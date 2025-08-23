<script setup lang="ts">

import { SunMedium, Moon } from "lucide-vue-next";
import {useThemeStore} from "../store/theme.ts";

const themeStore = useThemeStore();
</script>

<template>
  <div
      @click="themeStore.toggleTheme"
      class="cursor-pointer transition-all duration-200 ease-in-out active:scale-95"
  >
    <div
        class="p-2 rounded-full flex items-center justify-center
      transition-all duration-300 ease-in-out hover:scale-110 active:scale-125"
    >
      <SunMedium v-if="themeStore.resolvedTheme === 'dark'" :size="24" class="text-yellow-400 transition-all duration-200"></SunMedium>
      <Moon v-else :size="24" class="text-gray-600 transition-all duration-200"></Moon>
    </div>
  </div>
</template>