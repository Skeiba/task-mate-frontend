<template>
  <!-- Loading State -->
  <div v-if="loading" class="space-y-4">
    <div v-for="i in 3" :key="i" class="bg-secondary-color rounded-lg p-4 animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="error" class="text-center py-12">
    <AlertCircle class="w-12 h-12 mx-auto text-red-400 mb-4" />
    <h3 class="text-lg font-medium text-gray-900 mb-2">Failed to load tasks</h3>
    <p class="text-gray-500 mb-4">{{ error }}</p>
    <button
        @click="$emit('retry-load')"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Try Again
    </button>
  </div>

  <!-- Empty State -->
  <div v-else-if="tasks.length === 0" class="text-center py-12">
    <CheckSquare class="w-12 h-12 mx-auto text-gray-400 mb-4" />
    <h3 class="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
    <p class="text-gray-500">Start by creating your first task</p>
  </div>

  <!-- Tasks List View -->
  <div v-else-if="viewMode === 'list'" class="space-y-3">
    <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-secondary-color rounded-lg p-4 hover-theme transition-colors cursor-pointer"
        @click="$emit('task-click', task)"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <h3 class="font-medium text-color">{{ task.title }}</h3>
            <span
                class="px-2 py-1 text-xs rounded-full"
                :class="getPriorityClass(task.priority)"
            >
              {{ task.priority }}
            </span>
            <span
                class="px-2 py-1 text-xs rounded-full"
                :class="getStatusClass(task.status)"
            >
              {{ getStatusLabel(task.status) }}
            </span>
          </div>

          <p v-if="task.content" class="text-sm text-secondary mb-2 line-clamp-2">
            {{ task.content }}
          </p>

          <div class="flex items-center space-x-4 text-xs text-secondary">
            <span v-if="task.dueDate" class="flex items-center">
              <Calendar class="w-3 h-3 mr-1" />
              {{ formatDate(task.dueDate) }}
            </span>
            <span v-if="task.categories?.length" class="flex items-center">
              <Tag class="w-3 h-3 mr-1" />
              {{ task.categories.map(c => c.name).join(', ') }}
            </span>
          </div>
        </div>

        <div class="flex items-center space-x-2 ml-4">
          <!-- Mark as Done Button -->
          <button
              v-if="task.status !== 'DONE'"
              @click.stop="handleMarkAsDone(task.id)"
              class="p-1.5 hover:text-green-500 rounded transition-colors"
              title="Mark as done"
          >
            <CheckCircle class="w-5 h-5" />
          </button>

          <button
              @click.stop="$emit('task-edit', task)"
              class="p-1.5 hover:text-blue-500 rounded transition-colors"
              title="Edit task"
          >
            <Edit class="w-5 h-5" />
          </button>

          <button
              @click.stop="handleToggleFavorite(task.id)"
              class="p-1.5 rounded transition-colors"
              :class="task.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'hover:text-yellow-500'"
              title="Toggle favorite"
          >
            <Star class="w-5 h-5" :class="{ 'fill-current': task.isFavorite }" />
          </button>

          <button
              @click.stop="showDeleteConfirm(task)"
              class="p-1.5 hover:text-red-600 rounded transition-colors"
              title="Delete task"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Tasks Grid View -->
  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-secondary-color rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
        @click="$emit('task-click', task)"
    >
      <div class="flex items-start justify-between mb-3">
        <h3 class="font-medium text-color line-clamp-2">{{ task.title }}</h3>
        <div class="flex items-center space-x-1 ml-2">
          <!-- Mark as Done Button -->
          <button
              v-if="task.status !== 'DONE'"
              @click.stop="handleMarkAsDone(task.id)"
              class="p-1 hover:bg-green-100 hover:text-green-600 rounded transition-colors"
              title="Mark as done"
          >
            <CheckCircle class="w-3 h-3" />
          </button>

          <button
              @click.stop="$emit('task-edit', task)"
              class="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Edit task"
          >
            <Edit class="w-3 h-3" />
          </button>

          <button
              @click.stop="handleToggleFavorite(task.id)"
              class="p-1 rounded transition-colors"
              :class="task.isFavorite ? 'text-yellow-500 hover:bg-yellow-100' : 'hover:bg-yellow-100 hover:text-yellow-500'"
              title="Toggle favorite"
          >
            <Star class="w-3 h-3" :class="{ 'fill-current': task.isFavorite }" />
          </button>

          <button
              @click.stop="showDeleteConfirm(task)"
              class="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
              title="Delete task"
          >
            <Trash2 class="w-3 h-3" />
          </button>
        </div>
      </div>

      <p v-if="task.content" class="text-sm text-secondary mb-3 line-clamp-3">
        {{ task.content }}
      </p>

      <div class="flex items-center space-x-2 mb-3">
        <span
            class="px-2 py-1 text-xs rounded-full"
            :class="getPriorityClass(task.priority)"
        >
          {{ task.priority }}
        </span>
        <span
            class="px-2 py-1 text-xs rounded-full"
            :class="getStatusClass(task.status)"
        >
          {{ getStatusLabel(task.status) }}
        </span>
      </div>

      <div class="space-y-2 text-xs text-secondary">
        <div v-if="task.dueDate" class="flex items-center">
          <Calendar class="w-3 h-3 mr-1" />
          {{ formatDate(task.dueDate) }}
        </div>
        <div v-if="task.categories?.length" class="flex items-center">
          <Tag class="w-3 h-3 mr-1" />
          <span class="line-clamp-1">{{ task.categories.map(c => c.name).join(', ') }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div
      v-if="deleteTaskToConfirm"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-3 sm:p-4"
      @click.self="cancelDelete"
  >
    <div class="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-6">
      <div class="flex items-center mb-3 sm:mb-4">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
          <AlertTriangle class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600" />
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-gray-900">Delete Task</h3>
      </div>
      <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        Are you sure you want to delete "<span class="font-medium break-words">{{ deleteTaskToConfirm?.title }}</span>"? This action cannot be undone.
      </p>
      <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <button
            @click="cancelDelete"
            :disabled="isDeleting"
            class="w-full sm:w-auto px-3 sm:px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
            @click="confirmDelete"
            :disabled="isDeleting"
            class="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 font-medium text-sm sm:text-base"
        >
          <Loader2 v-if="isDeleting" class="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
          <span v-if="!isDeleting">Delete Task</span>
          <span v-else>Deleting...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  CheckSquare,
  Edit,
  Loader2,
  Tag,
  Star,
  Trash2
} from "lucide-vue-next"

import type { Task } from "../types"
import { ref } from "vue"

interface Props {
  tasks: Task[]
  loading?: boolean
  error?: string
  viewMode?: 'list' | 'grid'
}

defineProps<Props>()

const emit = defineEmits<{
  'task-click': [task: Task]
  'task-edit': [task: Task]
  'task-delete': [taskId: string]
  'task-favorite': [taskId: string]
  'task-mark-done': [taskId: string]
  'retry-load': []
}>()

// State for delete confirmation
const deleteTaskToConfirm = ref<Task | null>(null)
const isDeleting = ref(false)

const getPriorityClass = (priority: string) => {
  const classes = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800'
  }
  return classes[priority as keyof typeof classes] || classes.MEDIUM
}

const getStatusClass = (status: string) => {
  const classes = {
    PENDING: 'bg-gray-100 text-gray-800',
    DONE: 'bg-green-100 text-green-800',
    MISSED: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || classes.PENDING
}

const getStatusLabel = (status: string) => {
  const labels = {
    PENDING: 'To Do',
    DONE: 'Completed',
    MISSED: 'Missed'
  }
  return labels[status as keyof typeof labels] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const handleToggleFavorite = (taskId: string) => {
  emit('task-favorite', taskId)
}

const handleMarkAsDone = (taskId: string) => {
  emit('task-mark-done', taskId)
}

const showDeleteConfirm = (task: Task) => {
  deleteTaskToConfirm.value = task
  isDeleting.value = false
}

const cancelDelete = () => {
  if (!isDeleting.value) {
    deleteTaskToConfirm.value = null
  }
}

const confirmDelete = async () => {
  if (!deleteTaskToConfirm.value || isDeleting.value) return

  const taskToDelete = deleteTaskToConfirm.value
  isDeleting.value = true

  try {
    emit('task-delete', taskToDelete.id)

    await new Promise(resolve => setTimeout(resolve, 300))

    deleteTaskToConfirm.value = null
  } catch (error) {
    console.error('Error deleting task:', error)
    deleteTaskToConfirm.value = taskToDelete
  } finally {
    isDeleting.value = false
  }
}
</script>