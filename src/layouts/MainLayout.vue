<template>
  <div class="flex h-screen bg-color">
    <!-- Sidebar -->
    <aside class="w-64 bg-color border-r border-gray-200 flex flex-col">
      <div class="flex items-center justify-between px-4 py-3">
        <h1 class="text-2xl font-bold text-color ">Task Mate</h1>
        <button
            @click="setActiveTab('search')"
            class="p-2 rounded-full hover:bg-gray-100"
        >
          <Search class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        <button
            class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg border"
            :class="getTabClass('today')"
            @click="setActiveTab('today')"
        >
          <Calendar class="w-4 h-4 mr-2" />
          Today
          <span
              class="ml-auto inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700"
          >
            {{ todayTasksCount }}
          </span>
        </button>

        <button
            class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg border"
            :class="getTabClass('favorites')"
            @click="setActiveTab('favorites')"
        >
          <Star class="w-4 h-4 mr-2" />
          Favorites
        </button>

        <div class="pt-4">
          <p class="px-3 text-xs font-semibold text-gray-500 uppercase">
            Categories
          </p>
          <div class="mt-2 space-y-1">
            <button
                v-for="cat in categories"
                :key="cat.id"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg border"
                :class="getTabClass('category', cat.id)"
                @click="setActiveTab('category', cat)"
            >
              <span
                  class="w-2.5 h-2.5 rounded-full mr-2"
                  :style="{ backgroundColor: cat.color }"
              />
              {{ cat.name }}
              <span class="ml-auto text-xs text-gray-500">{{ cat.taskCount }}</span>
            </button>
          </div>
        </div>

        <div v-if="isAdmin" class="pt-4">
          <p class="px-3 text-xs font-semibold text-gray-500 uppercase">
            Admin
          </p>
          <button
              class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg border"
              :class="getTabClass('users')"
              @click="setActiveTab('users')"
          >
            <Users class="w-4 h-4 mr-2" />
            Users
          </button>
        </div>
      </nav>

      <div class="p-4 border-t">
        <button
            @click="$emit('add-task')"
            class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col py-2">
      <header class="h-14  bg-color flex items-center justify-between px-6">
        <ThemeToggle/>
        <h2 class="text-lg font-semibold">{{ activeTabTitle }}</h2>
        <div class="relative user-menu">
          <button
              class="flex items-center space-x-2 px-3 py-1 hover:bg-gray-100"
              @click="toggleUserMenu"
          >
            <div
                class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold"
            >
              {{ userInitials }}
            </div>
            <ChevronDown class="w-4 h-4 text-gray-500" />
          </button>

          <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
          >
            <p class="px-4 py-2 text-sm text-gray-700 font-medium border-b">
              {{ user?.username }}
            </p>
            <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <div v-if="activeTab === 'today'">
          <p class="text-gray-500">Today’s tasks will appear here.</p>
        </div>
        <div v-else-if="activeTab === 'favorites'">
          <p class="text-gray-500">Favorite tasks go here.</p>
        </div>
        <div v-else-if="activeTab === 'category'">
          <p class="text-gray-500">Tasks for {{ activeTabData?.name }}.</p>
        </div>
        <div v-else-if="activeTab === 'users'">
          <p class="text-gray-500">User management section.</p>
        </div>
        <div v-else-if="activeTab === 'search'">
          <p class="text-gray-500">Search results will show here.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Calendar,
  ChevronDown,
  Plus,
  Search,
  Star,
  Users
} from "lucide-vue-next"

import {useMainLayout} from "../composables/useMainLayout.ts";
import ThemeToggle from "../components/ThemeToggle.vue";

defineEmits(["add-task"])

const {
  activeTab,
  activeTabData,
  showUserMenu,
  todayTasksCount,
  categories,

  user,
  isAdmin,
  userInitials,
  activeTabTitle,

  setActiveTab,
  getTabClass,
  toggleUserMenu,
  handleLogout,
} = useMainLayout()
</script>
