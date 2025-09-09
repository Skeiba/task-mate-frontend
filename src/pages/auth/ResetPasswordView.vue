<template>
  <div class="min-h-screen relative bg-color">
    <div class="absolute top-4 right-4">
      <ThemeToggle/>
    </div>
    <div class="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <RectangleEllipsis class="h-8 w-8 text-green-600"/>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-color">
            Reset Password
          </h2>
          <h3 class="mt-2 text-center text-sm text-secondary">
            Enter the 6-digit code we sent you and choose a new password.
          </h3>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">

          <div
              v-if="authStore.error"
              class="rounded-md bg-red-100 border border-red-300 p-2 flex items-center justify-between"
          >
            <AlertCircle class="h-5 w-5 text-red-400"/>
            <button @click="authStore.error = null" type="button"
                    class="text-red-400 hover:text-red-600">
              <X class="h-5 w-5"/>
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-secondary mb-2">
              Reset Code
            </label>
            <div class="flex gap-2 justify-center">
              <input
                  v-for="(_, index) in tokenDigits"
                  :key="index"
                  :id="`token-${index}`"
                  v-model="tokenDigits[index]"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  class="w-12 h-12 text-center text-xl border rounded"
                  @input="focusNext(index, $event)"
                  @paste="handlePaste($event)"
              />
            </div>
            <p v-if="errors.token" class="mt-1 text-sm text-red-600">{{ errors.token }}</p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-secondary mb-1">
              New Password
            </label>
            <div class="flex items-center gap-2">
              <input
                  id="password"
                  v-model="form.newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :disabled="authStore.isLoading"
                  placeholder="Enter new password"
                  class="appearance-none relative block w-full px-3 py-3 border border-gray-300
                     placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2
                     focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
                  :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.newPassword }"
              />

              <button type="button" @click="showPassword = !showPassword"
                      :disabled="authStore.isLoading"
                      class="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors focus:outline-none disabled:opacity-50"
              >
                <EyeOff v-if="showPassword" class="h-5 w-5"/>
                <Eye v-else class="h-5 w-5"/>
              </button>
            </div>
            <p v-if="errors.newPassword" class="mt-1 text-sm text-red-600">{{ errors.newPassword }}</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-secondary mb-1">
              Confirm Password
            </label>
            <div class="flex items-center gap-2">
              <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  :disabled="authStore.isLoading"
                  placeholder="Confirm new password"
                  class="appearance-none relative block w-full px-3 py-3 border border-gray-300
                     placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2
                     focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
                  :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.confirmPassword }"
              />
              <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                      :disabled="authStore.isLoading"
                      class="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none disabled:opacity-50"
              >
                <EyeOff v-if="showConfirmPassword" class="h-5 w-5"/>
                <Eye v-else class="h-5 w-5"/>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <div>
            <button
                type="submit"
                :disabled="authStore.isLoading || !isFormValid"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent
                       text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="!authStore.isLoading">Reset Password</span>
              <span v-else class="flex items-center">
                <Loader2 class="animate-spin -ml-1 mr-2 h-4 w-4 text-color" />
                Processing...
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from "../../components/ThemeToggle.vue";
import {Loader2, RectangleEllipsis, AlertCircle, X, EyeOff, Eye} from "lucide-vue-next";
import { useResetPasswordView } from "../../composables/useResetPasswordView.ts";

const {
  authStore,
  form,
  tokenDigits,
  errors,
  isFormValid,
  handleSubmit,
  handlePaste,
  showPassword,
  showConfirmPassword,
  focusNext,
} = useResetPasswordView();
</script>
