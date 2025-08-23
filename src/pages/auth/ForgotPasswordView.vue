<template>
  <div class="min-h-screen relative bg-color">
    <div class="absolute top-4 right-4">
      <ThemeToggle/>
    </div>
    <div class="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <RectangleEllipsis class="h-8 w-8 text-red-600"/>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-color">
            Forgot Password
          </h2>
          <h3 class="mt-2 text-center text-sm text-secondary">
            Enter your email address below and we’ll send you a link to reset your password.
          </h3>
          <p class="mt-2 text-center text-sm text-secondary">
            Or
            <router-link
                to="/login"
                class="font-medium link-color hover:link-color transition-colors"
            >
              go back to sign in
            </router-link>
          </p>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <div
            v-if="authStore.error"
            class="rounded-md bg-red-100 border border-red-300"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <AlertCircle class="h-5 w-5 text-red-400"/>
              </div>
              <div class="ml-auto pl-3">
                <button @click="authStore.error = null" type="button"
                        class="text-red-400 hover:text-red-600"
                >
                  <X class="h-5 w-5"/>
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4">
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
                placeholder="Enter your email"
                class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-color rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :class="{
                'border-red-300 focus:ring-red-500 focus:border-red-500': errors.email
              }"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{errors.email}}</p>
            </div>
          </div>
          <div>
            <button
                type="submit"
                :disabled="authStore.isLoading || !isFormValid"
                class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="!authStore.isLoading">Send Reset Email</span>
              <span v-else class="flex items-center">
                <Loader2 class="animate-spin -ml-1 mr-2 h-4 w-4 text-color" />
                Sending...
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
import {Loader2, RectangleEllipsis, X} from "lucide-vue-next";
import { useForgotPasswordView} from "../../composables/useForgotPasswordView.ts";

const {
  authStore,
  form,
  errors,
  isFormValid,
  handleSubmit,
} = useForgotPasswordView();
</script>

