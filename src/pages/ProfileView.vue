<template>
  <!-- Modal Backdrop -->
  <div
      v-if="showModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      @click.self="closeModal"
  >
    <div class="bg-secondary-color rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-4 sm:p-6">
        <div class="flex items-center space-x-2 sm:space-x-3">
          <div
              class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-base sm:text-lg font-bold"
          >
            {{ userInitials }}
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-lg sm:text-xl font-semibold text-color truncate">{{ currentUser?.username }}</h2>
            <p class="text-xs sm:text-sm text-secondary hidden sm:block">Manage your account settings</p>
          </div>
        </div>
        <button
            @click="closeModal"
            class="hover:text-red-600 transition-colors p-1 flex-shrink-0"
        >
          <X class="w-6 h-6 sm:w-7 sm:h-7"/>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex flex-col md:flex-row bg-color m-1 sm:m-2 overflow-hidden rounded-xl" style="height: calc(85vh - 120px); min-height: 400px;">
        <!-- Tab Navigation - Mobile: Horizontal, Desktop: Vertical -->
        <nav class="flex md:flex-col md:w-64 p-3 sm:p-5 justify-between md:justify-start md:space-y-2">
          <button
              @click="setActiveTab('profile')"
              class="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap md:w-full"
              :class="activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'text-secondary hover-theme'"
          >
            <User class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span class="hidden sm:inline">Profile Info</span>
            <span class="sm:hidden">Profile</span>
          </button>
          <button
              @click="setActiveTab('password')"
              class="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap md:w-full"
              :class="activeTab === 'password' ? 'bg-blue-100 text-blue-700' : 'text-secondary hover-theme'"
          >
            <Lock class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span class="hidden sm:inline">Change Password</span>
            <span class="sm:hidden">Password</span>
          </button>
          <button
              @click="setActiveTab('danger')"
              class="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium bg-red-600 rounded-lg transition-colors whitespace-nowrap md:w-full"
              :class="activeTab === 'danger' ? 'bg-red-600 text-white' : 'text-white hover:bg-red-700'"
          >
            <AlertTriangle class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span class="hidden sm:inline">Danger Zone</span>
            <span class="sm:hidden">Danger</span>
          </button>
          <button
              @click="handleLogout"
              class="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50 whitespace-nowrap md:w-full"
          >
            <LogOut class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span class="hidden sm:inline">Logout</span>
            <span class="sm:hidden">Logout</span>
          </button>
        </nav>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Success/Error Messages -->
          <div v-if="successMessage || errorMessage" class="p-3 sm:p-6 pb-0">
            <div
                v-if="successMessage"
                class="bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm"
            >
              {{ successMessage }}
            </div>
            <div
                v-if="errorMessage"
                class="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm"
            >
              {{ errorMessage }}
            </div>
          </div>

          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="p-3 sm:p-6">
            <h3 class="text-base sm:text-lg font-medium mb-4">Profile Information</h3>
            <form @submit.prevent="handleUpdateProfile" class="space-y-4 sm:space-y-6">
              <div class="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <label for="username" class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                    Username *
                  </label>
                  <input
                      id="username"
                      v-model="profileForm.username"
                      type="text"
                      class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      :class="{ 'border-red-300': profileErrors.username }"
                  />
                  <p v-if="profileErrors.username" class="mt-1 text-sm text-red-600">
                    {{ profileErrors.username }}
                  </p>
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                    Email Address *
                  </label>
                  <input
                      id="email"
                      v-model="profileForm.email"
                      type="email"
                      class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      :class="{ 'border-red-300': profileErrors.email }"
                  />
                  <p v-if="profileErrors.email" class="mt-1 text-sm text-red-600">
                    {{ profileErrors.email }}
                  </p>
                </div>
              </div>
              <div class="flex justify-end pt-4">
                <button
                    type="submit"
                    :disabled="!isProfileFormValid || isLoading"
                    class="w-full sm:w-auto px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          <!-- Password Tab -->
          <div v-if="activeTab === 'password'" class="p-3 sm:p-6">
            <h3 class="text-base sm:text-lg font-medium mb-4">Change Password</h3>
            <form @submit.prevent="handleChangePassword" class="space-y-4 sm:space-y-6">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                  Current Password *
                </label>
                <div class="relative">
                  <input
                      id="currentPassword"
                      v-model="passwordForm.oldPassword"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      class="appearance-none block w-full px-3 py-2 sm:py-3 pr-10 border border-gray-300 placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      :class="{ 'border-red-300': passwordErrors.oldPassword }"
                  />
                  <button
                      type="button"
                      @click="showCurrentPassword = !showCurrentPassword"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye v-if="!showCurrentPassword" class="w-4 h-4 sm:w-5 sm:h-5" />
                    <EyeOff v-else class="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <p v-if="passwordErrors.oldPassword" class="mt-1 text-sm text-red-600">
                  {{ passwordErrors.oldPassword }}
                </p>
              </div>

              <div>
                <label for="newPassword" class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                  New Password *
                </label>
                <div class="relative">
                  <input
                      id="newPassword"
                      v-model="passwordForm.newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      class="appearance-none block w-full px-3 py-2 sm:py-3 pr-10 border border-gray-300 placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      :class="{ 'border-red-300': passwordErrors.newPassword }"
                  />
                  <button
                      type="button"
                      @click="showNewPassword = !showNewPassword"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye v-if="!showNewPassword" class="w-4 h-4 sm:w-5 sm:h-5" />
                    <EyeOff v-else class="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <!-- Password Strength Indicator -->
                <div v-if="passwordForm.newPassword" class="mt-2">
                  <div class="flex space-x-1 mb-1">
                    <div
                        v-for="i in 4"
                        :key="i"
                        class="h-1 flex-1 rounded-full transition-colors"
                        :class="getPasswordStrengthClass(i - 1)"
                    />
                  </div>
                  <p class="text-xs text-gray-600">
                    Password strength: {{ passwordStrengthText }}
                  </p>
                </div>

                <p v-if="passwordErrors.newPassword" class="mt-1 text-sm text-red-600">
                  {{ passwordErrors.newPassword }}
                </p>
              </div>

              <div>
                <label for="confirmNewPassword" class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                  Confirm New Password *
                </label>
                <div class="relative">
                  <input
                      id="confirmNewPassword"
                      v-model="passwordForm.confirmNewPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="appearance-none block w-full px-3 py-2 sm:py-3 pr-10 border border-gray-300 placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      :class="{ 'border-red-300': passwordErrors.confirmNewPassword }"
                  />
                  <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye v-if="!showConfirmPassword" class="w-4 h-4 sm:w-5 sm:h-5" />
                    <EyeOff v-else class="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <p v-if="passwordErrors.confirmNewPassword" class="mt-1 text-sm text-red-600">
                  {{ passwordErrors.confirmNewPassword }}
                </p>
              </div>

              <div class="flex justify-end pt-4">
                <button
                    type="submit"
                    :disabled="!isPasswordFormValid || isLoading"
                    class="w-full sm:w-auto px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
                  Change Password
                </button>
              </div>
            </form>
          </div>

          <!-- Danger Zone Tab -->
          <div v-if="activeTab === 'danger'" class="p-3 sm:p-6">
            <h3 class="text-base sm:text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
            <div class="space-y-4 sm:space-y-6">
              <!-- Deactivate Account -->
              <div class="border border-red-300 rounded-lg p-3 sm:p-4 bg-red-50">
                <h4 class="font-medium text-red-800 mb-2 text-sm sm:text-base">Deactivate Account</h4>
                <p class="text-xs sm:text-sm text-red-700 mb-3">
                  Deactivating your account will disable your access but preserve your data. You can reactivate later.
                </p>

                <div v-if="!showDeactivateConfirm" class="flex justify-start">
                  <button
                      @click="showDeactivateConfirm = true"
                      class="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-red-700 text-white rounded hover:bg-red-800"
                  >
                    Deactivate Account
                  </button>
                </div>

                <div v-if="showDeactivateConfirm" class="space-y-3">
                  <p class="text-xs sm:text-sm font-medium text-red-800">
                    Type "DEACTIVATE" to confirm:
                  </p>
                  <input
                      v-model="deactivateConfirmText"
                      type="text"
                      class="w-full px-3 py-2 border border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      placeholder="Type DEACTIVATE"
                  />
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                        @click="handleDeactivateAccount"
                        :disabled="!canDeactivate || isLoading"
                        class="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center order-1"
                    >
                      <Loader2 v-if="isLoading" class="w-4 h-4 mr-1 animate-spin" />
                      Confirm Deactivation
                    </button>
                    <button
                        @click="showDeactivateConfirm = false; deactivateConfirmText = ''"
                        class="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 order-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <!-- Delete Account -->
              <div class="border border-red-400 rounded-lg p-3 sm:p-4 bg-red-100">
                <h4 class="font-medium text-red-900 mb-2 text-sm sm:text-base">Delete Account</h4>
                <p class="text-xs sm:text-sm text-red-800 mb-3">
                  <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account and all associated data.
                </p>

                <div v-if="!showDeleteConfirm" class="flex justify-start">
                  <button
                      @click="showDeleteConfirm = true"
                      class="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-red-700 text-white rounded hover:bg-red-800"
                  >
                    Delete Account
                  </button>
                </div>

                <div v-if="showDeleteConfirm" class="space-y-3">
                  <p class="text-xs sm:text-sm font-medium text-red-900">
                    Type "DELETE" to confirm permanent deletion:
                  </p>
                  <input
                      v-model="deleteConfirmText"
                      type="text"
                      class="w-full px-3 py-2 border border-red-400 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      placeholder="Type DELETE"
                  />
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                        @click="handleDeleteAccount"
                        :disabled="!canDelete || isLoading"
                        class="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-red-700 text-white rounded hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center order-1"
                    >
                      <Loader2 v-if="isLoading" class="w-4 h-4 mr-1 animate-spin" />
                      Permanently Delete
                    </button>
                    <button
                        @click="showDeleteConfirm = false; deleteConfirmText = ''"
                        class="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 order-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
  X,
  LogOut
} from "lucide-vue-next"

import { computed } from 'vue'
import { useProfileView } from "../composables/useProfileView.ts"

const {
  // State
  showModal,
  activeTab,
  isLoading,
  successMessage,
  errorMessage,
  currentUser,

  // Forms
  profileForm,
  passwordForm,
  profileErrors,
  passwordErrors,

  // Password visibility
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,

  // Danger zone
  showDeactivateConfirm,
  showDeleteConfirm,
  deactivateConfirmText,
  deleteConfirmText,

  // Computed
  isProfileFormValid,
  isPasswordFormValid,
  // passwordStrength,
  passwordStrengthText,
  canDeactivate,
  canDelete,

  // Methods
  openModal,
  closeModal,
  setActiveTab,
  getPasswordStrengthClass,
  handleUpdateProfile,
  handleChangePassword,
  handleDeactivateAccount,
  handleLogout,
  handleDeleteAccount
} = useProfileView()

const userInitials = computed(() => {
  return currentUser.value?.username?.substring(0, 2).toUpperCase() || 'U'
})

defineExpose({
  openModal
})
</script>