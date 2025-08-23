<template>
  <div class="min-h-screen flex items-center justify-center bg-color py-12 px-4 sm:px-6 lg:px-8">
    <div class="absolute top-4 right-4">
      <ThemeToggle/>
    </div>
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
          <UserRound class="h-8 w-8 text-green-600"/>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-color">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-secondary">
          Or
          <router-link
              to="/login"
              class="font-medium link-color hover:link-color transition-colors"
          >
            sign in to your existing account
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <!-- Success Message -->
        <div
            v-if="successMessage"
            class="rounded-md bg-green-50 p-4 border border-green-200"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-800">{{ successMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Error Alert -->
        <div
            v-if="authStore.error"
            class="rounded-md bg-red-50 p-4 border border-red-200"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-800">{{ authStore.error }}</p>
            </div>
            <div class="ml-auto pl-3">
              <button
                  @click="authStore.error = null"
                  type="button"
                  class="text-red-400 hover:text-red-600"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Username Field -->
          <div>
            <label for="username" class="block text-sm font-medium text-secondary mb-1">
              Username
            </label>
            <input
                id="username"
                v-model="form.username"
                type="text"
                required
                autocomplete="username"
                :disabled="authStore.isLoading"
                class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="Choose a username"
                :class="{
                'border-red-300 focus:ring-red-500 focus:border-red-500': errors.username
              }"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-secondary mb-1">
              Email address
            </label>
            <input
                id="email"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                :disabled="authStore.isLoading"
                class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="Enter your email"
                :class="{
                'border-red-300 focus:ring-red-500 focus:border-red-500': errors.email
              }"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-secondary mb-1">
              Password
            </label>
            <div class="flex items-center gap-2">
              <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :disabled="authStore.isLoading"
                  class="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder="Create a strong password"
                  :class="{
                  'border-red-300 focus:ring-red-500 focus:border-red-500': errors.password
                }"
              />
              <button
                  type="button"
                  @click="showPassword = !showPassword"
                  :disabled="authStore.isLoading"
                  class="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none disabled:opacity-50"
              >
                <EyeOff
                    v-if="showPassword"
                    class="h-5 w-5"
                />
                <Eye
                    v-else
                    class="h-5 w-5"
                />
              </button>
            </div>
            <!-- Password strength indicator -->
            <div class="mt-1">
              <div class="flex space-x-1">
                <div
                    v-for="i in 4"
                    :key="i"
                    class="h-1 flex-1 rounded-full transition-colors"
                    :class="getPasswordStrengthClass(i)"
                ></div>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ passwordStrengthText }}
              </p>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-secondary mb-1">
              Confirm Password
            </label>
            <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                autocomplete="new-password"
                :disabled="authStore.isLoading"
                class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="Confirm your password"
                :class="{
                'border-red-300 focus:ring-red-500 focus:border-red-500': errors.confirmPassword
              }"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="flex items-center">
          <input
              id="agreeToTerms"
              v-model="form.agreeToTerms"
              type="checkbox"
              required
              class="h-4 w-4 link-color focus:link-color border-gray-300 rounded"
              :disabled="authStore.isLoading"
          />
          <label for="agreeToTerms" class="ml-2 block text-sm text-secondary cursor-pointer">
            I agree to the
            <a href="#" class="link-color hover:link-color underline">Terms and Conditions</a>
            and
            <a href="#" class="link-color hover:link-color underline">Privacy Policy</a>
          </label>
        </div>

        <!-- Submit Button -->
        <div>
          <button
              type="submit"
              :disabled="authStore.isLoading || !isFormValid"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="!authStore.isLoading">Create Account</span>
            <span v-else class="flex items-center">
              <Loader2/>
              Creating account...
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">

import {
  Eye, EyeOff, Loader2,
  UserRound
} from 'lucide-vue-next';
import ThemeToggle from "../../components/ThemeToggle.vue";
import {useRegisterView} from "../../composables/useRegisterView.ts";

const {
    form,
    errors,
    authStore,
    showPassword,
    successMessage,

    isFormValid,
    passwordStrengthText,

    getPasswordStrengthClass,
    handleSubmit
} = useRegisterView();

</script>