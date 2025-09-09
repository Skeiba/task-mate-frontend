<template>
  <div class="flex h-screen bg-secondary-color">
    <!-- Sidebar -->
    <aside class="w-64 bg-secondary-color flex flex-col">
      <div class="flex items-center justify-between px-4 py-3">
        <h1 class="text-2xl font-bold text-color">Task Mate</h1>
        <button
            @click="setActiveTab('search')"
            class="p-2 rounded-full hover-theme"
        >
          <Search class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        <button
            class="w-full  flex items-center px-3 py-2 text-sm font-medium rounded-lg border"
            :class="getTabClass('today')"
            @click="setActiveTab('today')"
        >
          <Calendar class="w-4 h-4 mr-2" />
          Today
          <span
              v-if="todayTasksCount > 0"
              class="ml-auto inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700"
          >
            {{ todayTasksCount }}
          </span>
        </button>

        <button
            class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg border"
            :class="getTabClass('all')"
            @click="setActiveTab('all')"
        >
          <List class="w-4 h-4 mr-2" />
          Inbox
          <span
              v-if="allTasks.length > 0"
              class="ml-auto inline-flex items-center px-2 py-0.5 text-xs rounded-full "
          >
            {{ allTasks.length }}
          </span>
        </button>

        <button
            class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg border"
            :class="getTabClass('favorites')"
            @click="setActiveTab('favorites')"
        >
          <Star class="w-4 h-4 mr-2" />
          Favorites
          <span
              v-if="favoriteTasks.length > 0"
              class="ml-auto inline-flex items-center px-2 py-0.5 text-xs rounded-full "
          >
            {{ favoriteTasks.length }}
          </span>
        </button>

        <div class="pt-4">
          <div class="flex items-center justify-between px-3 mb-2">
            <p class="text-xs font-semibold text-gray-500 uppercase">
              Categories
            </p>
            <button
                @click="categoryViewRef?.openModal()"
                class="p-1 hover:bg-gray-200 rounded"
                title="Manage Categories"
            >
              <Settings class="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div v-if="isLoadingCategories" class="px-3 py-2">
            <div class="flex items-center text-sm text-gray-500">
              <Loader2 class="w-4 h-4 mr-2 animate-spin" />
              Loading categories...
            </div>
          </div>

          <div v-else-if="categoriesError" class="px-3 py-2">
            <p class="text-sm text-red-600">{{ categoriesError }}</p>
            <button
                @click="loadCategories"
                class="text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              Try again
            </button>
          </div>

          <div v-else class="space-y-1">
            <button
                v-for="cat in categories"
                :key="cat.id"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg border"
                :class="getTabClass('category', cat.id)"
                @click="setActiveTab('category', cat)"
            >
              <div
                  class="w-6 h-6 rounded-full mr-2 flex items-center justify-center"
                  :style="{ backgroundColor: cat.color || '#6B7280' }"
              >
                <component
                    :is="lucideIconMap[cat.icon] || lucideIconMap['briefcase']"
                    class="w-3 h-3 text-white"
                />
              </div>
              {{ cat.name }}
              <span class="ml-auto inline-flex items-center px-2 py-0.5 text-xs rounded-full ">{{ cat.taskCount || 0 }}</span>
            </button>

            <button
                @click="categoryViewRef?.openModal()"
                class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-gray-400"
            >
              <Plus class="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        <div v-if="isAdmin" class="pt-4">
          <p class="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase">
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

      <div class="p-4">
        <button
            @click="taskViewRef?.openModal()"
            class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col">
      <header class="h-14 bg-secondary-color flex items-center justify-between px-6">
        <ThemeToggle/>
        <h2 class="text-lg font-semibold">{{ activeTabTitle }}</h2>
        <div class="relative">
          <button
              class="flex items-center space-x-2 px-3 py-1 hover-theme rounded-lg transition-colors"
              @click="profileViewRef?.openModal()"
          >
            <div
                class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold"
            >
              {{ userInitials }}
            </div>
            <span class="text-sm font-medium">{{ user?.username }}</span>
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6 bg-color rounded-tl-2xl">
        <!-- Today's Tasks View -->
        <div v-if="activeTab === 'today'">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-semibold text-color">Today's Tasks</h3>
              <p class="text-secondary">{{ todayTasksCount }} tasks due today</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                  @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
                  class="p-2 hover:bg-gray-200 rounded-lg"
                  :title="viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'"
              >
                <Grid3X3 v-if="viewMode === 'list'" class="w-5 h-5" />
                <List v-else class="w-5 h-5" />
              </button>
              <button
                  @click="refreshData"
                  class="p-2 hover:bg-gray-200 rounded-lg"
                  title="Refresh tasks"
                  :disabled="isLoadingTasks"
              >
                <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': isLoadingTasks }" />
              </button>
            </div>
          </div>

          <TaskList
              :tasks="currentTasks"
              :loading="isLoadingTasks"
              :error="tasksError"
              :view-mode="viewMode"
              @task-click="(task) => taskViewRef?.openModal(task.id, 'view')"
              @task-edit="(task) => taskViewRef?.openModal(task.id, 'edit')"
              @task-delete="handleDeleteTaskById"
              @task-favorite="onToggleFavorite"
              @task-mark-done="onMarkAsDone"
              @task-categorize="handleCategorizeTaskById"
              @retry-load="loadTodayTasks"
          />
        </div>

        <div v-else-if="activeTab === 'all'">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-semibold text-color">All Tasks</h3>
              <p class="text-secondary">{{ allTasks.length }} total tasks</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                  @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
                  class="p-2 hover:bg-gray-200 rounded-lg"
                  :title="viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'"
              >
                <Grid3X3 v-if="viewMode === 'list'" class="w-5 h-5" />
                <List v-else class="w-5 h-5" />
              </button>
              <button
                  @click="refreshData"
                  class="p-2 hover:bg-gray-200 rounded-lg"
                  title="Refresh tasks"
                  :disabled="isLoadingTasks"
              >
                <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': isLoadingTasks }" />
              </button>
            </div>
          </div>
          <TaskList
              :tasks="currentTasks"
              :loading="isLoadingTasks"
              :error="tasksError"
              :view-mode="viewMode"
              @task-click="(task) => taskViewRef?.openModal(task.id, 'view')"
              @task-edit="(task) => taskViewRef?.openModal(task.id, 'edit')"
              @task-delete="handleDeleteTaskById"
              @task-favorite="onToggleFavorite"
              @task-mark-done="onMarkAsDone"
              @task-categorize="handleCategorizeTaskById"
              @retry-load="loadAllTasks"
          />
        </div>

        <div v-else-if="activeTab === 'favorites'">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-semibold text-color">Favorite Tasks</h3>
              <p class="text-secondary">{{ favoriteTasks.length }} favorite tasks</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                  @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
                  class="p-2 hover:bg-gray-200 rounded-lg"
                  :title="viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'"
              >
                <Grid3X3 v-if="viewMode === 'list'" class="w-5 h-5" />
                <List v-else class="w-5 h-5" />
              </button>
              <button
                  @click="refreshData"
                  class="p-2 hover:bg-gray-200 rounded-lg"
                  title="Refresh tasks"
                  :disabled="isLoadingTasks"
              >
                <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': isLoadingTasks }" />
              </button>
            </div>
          </div>

          <TaskList
              :tasks="currentTasks"
              :loading="isLoadingTasks"
              :error="tasksError"
              :view-mode="viewMode"
              @task-click="(task) => taskViewRef?.openModal(task.id, 'view')"
              @task-edit="(task) => taskViewRef?.openModal(task.id, 'edit')"
              @task-delete="handleDeleteTaskById"
              @task-favorite="onToggleFavorite"
              @task-mark-done="onMarkAsDone"
              @task-categorize="handleCategorizeTaskById"
              @retry-load="loadAllTasks"
          />
        </div>

        <div v-else-if="activeTab === 'category'">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-semibold text-color">{{ activeTabData?.name }}</h3>
              <p class="text-secondary">{{ currentTasks.length }} tasks in this category</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                  @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
                  class="p-2 hover:bg-gray-200 rounded-lg"
                  :title="viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'"
              >
                <Grid3X3 v-if="viewMode === 'list'" class="w-5 h-5" />
                <List v-else class="w-5 h-5" />
              </button>
              <button
                  @click="refreshData"
                  class="p-2 hover:bg-gray-200 rounded-lg"
                  title="Refresh tasks"
                  :disabled="isLoadingTasks"
              >
                <RefreshCw class="w-5 h-5" :class="{ 'animate-spin': isLoadingTasks }" />
              </button>
            </div>
          </div>

          <TaskList
              :tasks="currentTasks"
              :loading="isLoadingTasks"
              :error="tasksError"
              :view-mode="viewMode"
              @task-click="(task) => taskViewRef?.openModal(task.id, 'view')"
              @task-edit="(task) => taskViewRef?.openModal(task.id, 'edit')"
              @task-delete="handleDeleteTaskById"
              @task-favorite="onToggleFavorite"
              @task-mark-done="onMarkAsDone"
              @task-categorize="handleCategorizeTaskById"
              @retry-load="loadAllTasks"
          />
        </div>

        <!-- Users Management: for implementing this use the same logic as taskView and taskList but for users-->
        <div v-else-if="activeTab === 'users'">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-color">User Management</h3>
            <p class="text-secondary">Manage system users and permissions</p>
          </div>
          <div class="bg-secondary-color rounded-lg p-8 text-center">
            <Users class="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p class="text-secondary">User management features coming soon...</p>
          </div>
        </div>

        <!-- Search Results -->
        <div v-else-if="activeTab === 'search'">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-color">Search Tasks</h3>
            <p class="text-secondary">Find tasks across all categories</p>
          </div>

          <!-- Search Input -->
          <div class="mb-6 space-y-4">
            <div class="relative">
              <Search class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
              <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search by task title or content..."
                  class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-color placeholder-gray-400"
              />
              <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-color hover-theme"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Search Filters -->
            <div class="flex flex-wrap gap-2 items-center">
              <span class="text-sm font-medium text-secondary">Filters:</span>

              <!-- Status Filter -->
              <select
                  v-model="searchFilters.status"
                  class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-color"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="DONE">Done</option>
                <option value="MISSED">Missed</option>
              </select>

              <!-- Priority Filter -->
              <select
                  v-model="searchFilters.priority"
                  class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-color"
              >
                <option value="all">All Priorities</option>
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>

              <!-- Category Filter -->
              <select
                  v-model="searchFilters.category"
                  class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-color"
              >
                <option value="all">All Categories</option>
                <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>

              <!-- Date Range Filter -->
              <select
                  v-model="searchFilters.dateRange"
                  class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-color"
              >
                <option value="all">All Dates</option>
                <option value="today">Due Today</option>
                <option value="week">Due This Week</option>
                <option value="month">Due This Month</option>
                <option value="overdue">Overdue</option>
              </select>

              <!-- Clear Filters -->
              <button
                  v-if="activeFiltersCount > 0"
                  @click="resetFilters"
                  class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear Filters ({{ activeFiltersCount }})
              </button>
            </div>
          </div>

          <!-- Search Results -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-secondary">
                <span v-if="searchQuery || activeFiltersCount > 0">
                  {{ filteredTasks.length }} result{{ filteredTasks.length !== 1 ? 's' : '' }} found
                </span>
                <span v-else>
                  {{ allTasks.length }} total tasks
                </span>
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                  @click="viewMode = viewMode === 'list' ? 'grid' : 'list'"
                  class="p-2 hover:bg-gray-200 rounded-lg"
                  :title="viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'"
              >
                <Grid3X3 v-if="viewMode === 'list'" class="w-5 h-5" />
                <List v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Results -->
          <TaskList
              :tasks="filteredTasks"
              :loading="isLoadingTasks"
              :error="tasksError"
              :view-mode="viewMode"
              @task-click="(task) => taskViewRef?.openModal(task.id, 'view')"
              @task-edit="(task) => taskViewRef?.openModal(task.id, 'edit')"
              @task-delete="handleDeleteTaskById"
              @task-favorite="onToggleFavorite"
              @task-mark-done="onMarkAsDone"
              @task-categorize="handleCategorizeTaskById"
              @retry-load="loadAllTasks"
          />

          <!-- Empty Search State -->
          <div v-if="(searchQuery || activeFiltersCount > 0) && filteredTasks.length === 0" class="text-center py-12">
            <Search class="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p class="text-gray-500 mb-4">Try adjusting your search terms or filters.</p>
            <button
                @click="clearSearch"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Search
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Modals -->
    <ProfileView ref="profileViewRef" />
    <CategoryView
        ref="categoryViewRef"
        @category-created="handleCreateCategory"
        @category-updated="handleUpdateCategory"
        @category-deleted="handleDeleteCategory"
    />
    <TasksView
        ref="taskViewRef"
        @task-created="handleCreateTask"
        @task-updated="handleUpdateTask"
        @task-deleted="handleDeleteTask"
    />
    <AiChatView/>
  </div>
</template>

<script setup lang="ts">
import {
  Calendar,
  Grid3X3,
  List,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  Users,
  X
} from "lucide-vue-next"

import { ref } from "vue"
import { useMainLayout } from "../composables/useMainLayout.ts"
import ThemeToggle from "../components/ThemeToggle.vue"
import ProfileView from "../pages/ProfileView.vue"
import CategoryView from "../pages/CategoryView.vue"
import TasksView from "../pages/TasksView.vue";
import TaskList from "../components/TaskList.vue"
import { useTaskView } from "../composables/useTaskView.ts"
import { useCategoryView } from "../composables/useCategoryView.ts"
import {useSearch} from "../composables/useSearch.ts";
import AiChatView from "../pages/AiChatView.vue";

const profileViewRef = ref()
const categoryViewRef = ref()
const taskViewRef = ref()

const {
  activeTab,
  activeTabData,
  viewMode,
  categories,
  favoriteTasks,
  currentTasks,
  allTasks,
  todayTasksCount,
  isLoadingCategories,
  isLoadingTasks,
  categoriesError,
  tasksError,
  user,
  isAdmin,
  userInitials,
  activeTabTitle,
  setActiveTab,
  getTabClass,
  refreshData,
  loadCategories,
  loadTodayTasks,
  loadAllTasks,
  onMarkAsDone,
  onToggleFavorite
} = useMainLayout()

const {
  handleCreateTask,
  handleUpdateTask,
  handleDeleteTask,
  handleCategorizeTaskById,
  handleDeleteTaskById
} = useTaskView()

const {
  searchQuery,
  searchFilters,
  filteredTasks,
  activeFiltersCount,
  clearSearch,
  resetFilters,
} = useSearch(allTasks)


const {
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  lucideIconMap
} = useCategoryView()
</script>