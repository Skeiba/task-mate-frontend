<template>
  <div class="min-h-screen bg-color flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <!-- Icon -->
      <div class="mb-8">
        <div class="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <Search class="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" />
        </div>
      </div>

      <!-- Content -->
      <div class="mb-8">
        <h1 class="text-6xl sm:text-7xl font-bold text-color mb-4">
          404
        </h1>
        <h2 class="text-xl sm:text-2xl font-semibold text-color mb-4">
          Page Not Found
        </h2>
        <p class="text-secondary text-sm sm:text-base leading-relaxed mb-6">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-3 sm:space-y-4">
        <button
            @click="goHome"
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base flex items-center justify-center"
        >
          <Home class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Home
        </button>

        <button
            @click="goBack"
            class="w-full px-6 py-3 border border-gray-300 text-secondary rounded-lg hover-theme transition-colors font-medium text-sm sm:text-base flex items-center justify-center"
        >
          <ArrowLeft class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Home, Search } from "lucide-vue-next"
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>