<template>
  <div class="min-h-screen relative bg-color">
    <div class="absolute top-4 right-4">
      <ThemeToggle/>
    </div>
    <div class="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">

    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <CheckCircle class="h-8 w-8 text-blue-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-color">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-secondary">
          Or
          <router-link
              to="/register"
              class="font-medium link-color hover:link-color transition-colors"
          >
            create a new account
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <!-- Error Alert -->
        <div
            v-if="authStore.error"
            class="rounded-md bg-red-50 p-4 border border-red-200"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <AlertCircle class="h-5 w-5 text-red-400" />
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
                <X class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-4">
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
            <div class="relative">
              <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :disabled="authStore.isLoading"
                  class="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  placeholder="Enter your password"
                  :class="{'border-red-300 focus:ring-red-500 focus:border-red-500': errors.password}"
              />

              <!-- Eye toggle sits OUTSIDE input -->
              <button
                  type="button"
                  @click="showPassword = !showPassword"
                  :disabled="authStore.isLoading"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center cursor-pointer">
            <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 cursor-pointer text-blue-600 focus:ring-blue-500 border-gray-300 rounded "
                :disabled="authStore.isLoading"
            />
            <label for="remember-me" class="ml-2 cursor-pointer block text-sm text-color">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <router-link
                to="/forgot-password"
                class="font-medium link-color hover:link-color transition-colors"
            >
              Forgot your password?
            </router-link>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
              type="submit"
              :disabled="authStore.isLoading || !isFormValid"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="!authStore.isLoading">Sign in</span>
            <span v-else class="flex items-center">
              <Loader2 class="animate-spin -ml-1 mr-2 h-4 w-4 text-color" />
              Signing in...
            </span>
          </button>
        </div>

      </form>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-vue-next'
import ThemeToggle from "../../components/ThemeToggle.vue";
import {useLoginView} from "../../composables/useLoginView.ts";

const {
  authStore,
  form,
  errors,
  showPassword,
  isFormValid,
  handleSubmit,
} = useLoginView();
</script>