<template>
  <!-- Success/Error Messages for Task Actions -->
  <div v-if="actionMessage.show" class="mb-4 px-4 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300"
       :class="actionMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'">
    <CheckSquare v-if="actionMessage.type === 'success'" class="w-5 h-5 flex-shrink-0" />
    <AlertCircle v-else class="w-5 h-5 flex-shrink-0" />
    <span class="text-sm">{{ actionMessage.text }}</span>
    <button @click="clearActionMessage" class="ml-auto text-current hover:opacity-70">
      <X class="w-4 h-4" />
    </button>
  </div>

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
          <button
              @click.stop="handleMarkAsDone(task.id)"
              class="p-1.5 rounded transition-colors"
              :class="task.status === 'DONE' ? 'text-green-600 hover:text-green-700' : 'hover:text-green-500'"
              :title="task.status === 'DONE' ? 'Completed' : 'Mark as done'"
              :disabled="isProcessing"
          >
            <CheckCheck v-if="task.status === 'DONE'" class="w-5 h-5" />
            <Check v-else class="w-4 h-4" />
          </button>

          <button
              @click.stop="handleCategorizeTask(task.id)"
              class="p-1.5 hover:text-violet-500 transition-colors relative"
              title="Categorize task"
              :disabled="isProcessing"
          >
            <Loader2 v-if="categorizingTaskId === task.id" class="w-4 h-4 animate-spin" />
            <Tag v-else class="w-4 h-4" />
          </button>

          <button
              @click.stop="$emit('task-edit', task)"
              class="p-1.5 hover:text-blue-500 rounded transition-colors"
              title="Edit task"
              :disabled="isProcessing"
          >
            <Edit class="w-4 h-4" />
          </button>

          <button
              @click.stop="handleToggleFavorite(task.id)"
              class="p-1.5 rounded transition-colors"
              :class="task.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'hover:text-yellow-500'"
              title="Toggle favorite"
              :disabled="isProcessing"
          >
            <Star class="w-4 h-4" :class="{ 'fill-current': task.isFavorite }" />
          </button>

          <button
              @click.stop="showDeleteConfirm(task)"
              class="p-1.5 hover:text-red-600 rounded transition-colors"
              title="Delete task"
              :disabled="isProcessing"
          >
            <Trash2 class="w-4 h-4" />
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
        class="bg-secondary-color rounded-lg p-4 hover-theme transition-colors cursor-pointer"
        @click="$emit('task-click', task)"
    >
      <div class="flex items-start justify-between mb-3">
        <h3 class="font-medium text-color line-clamp-2">{{ task.title }}</h3>
        <div class="flex items-center space-x-1 ml-2">
          <button
              @click.stop="handleMarkAsDone(task.id)"
              class="p-1.5 rounded transition-colors"
              :class="task.status === 'DONE' ? 'text-green-600 hover:text-green-700' : 'hover:text-green-500'"
              :title="task.status === 'DONE' ? 'Completed' : 'Mark as done'"
              :disabled="isProcessing"
          >
            <CheckCheck v-if="task.status === 'DONE'" class="w-5 h-5" />
            <Check v-else class="w-4 h-4" />
          </button>

          <button
              @click.stop="handleCategorizeTask(task.id)"
              class="p-1.5 hover:text-violet-500 transition-colors"
              title="Categorize task"
              :disabled="isProcessing"
          >
            <Loader2 v-if="categorizingTaskId === task.id" class="w-4 h-4 animate-spin" />
            <Tag v-else class="w-4 h-4" />
          </button>

          <button
              @click.stop="$emit('task-edit', task)"
              class="p-1.5 hover:text-blue-500 rounded transition-colors"
              title="Edit task"
              :disabled="isProcessing"
          >
            <Edit class="w-4 h-4" />
          </button>

          <button
              @click.stop="handleToggleFavorite(task.id)"
              class="p-1.5 rounded transition-colors"
              :class="task.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'hover:text-yellow-500'"
              title="Toggle favorite"
              :disabled="isProcessing"
          >
            <Star class="w-4 h-4" :class="{ 'fill-current': task.isFavorite }" />
          </button>

          <button
              @click.stop="showDeleteConfirm(task)"
              class="p-1.5 hover:text-red-600 rounded transition-colors"
              title="Delete task"
              :disabled="isProcessing"
          >
            <Trash2 class="w-4 h-4" />
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
    <div class="bg-color rounded-lg sm:rounded-xl shadow-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-6">
      <div class="flex items-center mb-3 sm:mb-4">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
          <AlertTriangle class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600" />
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-color">Delete Task</h3>
      </div>
      <p class="text-sm sm:text-base text-secondary mb-4 sm:mb-6">
        Are you sure you want to delete "<span class="font-medium break-words">{{ deleteTaskToConfirm?.title }}</span>"? This action cannot be undone.
      </p>
      <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <button
            @click="cancelDelete"
            :disabled="isDeleting"
            class="w-full sm:w-auto px-3 sm:px-4 py-2 border-2 border-gray-200 text-color rounded-lg sm:rounded-xl hover-theme disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm sm:text-base"
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
  CheckSquare,
  Check,
  CheckCheck,
  Edit,
  Loader2,
  Tag,
  Star,
  Trash2,
  X,
} from "lucide-vue-next"

import type { Task } from "../types"
import { ref } from "vue"
import {useTaskView} from "../composables/useTaskView.ts";

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
  'task-categorize': [taskId: string]
  'retry-load': []
}>()

const deleteTaskToConfirm = ref<Task | null>(null)
const isDeleting = ref(false)
const isProcessing = ref(false)
const categorizingTaskId = ref<string | null>(null)

// Action message state
const actionMessage = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  text: ''
})

let messageTimeout: ReturnType<typeof setTimeout> | null = null;

const showActionMessage = (type: 'success' | 'error', text: string) => {
  if (messageTimeout) {
    clearTimeout(messageTimeout)
  }

  actionMessage.value = {
    show: true,
    type,
    text
  }

  messageTimeout = setTimeout(() => {
    clearActionMessage()
  }, 3000)
}

const clearActionMessage = () => {
  actionMessage.value.show = false
  if (messageTimeout) {
    clearTimeout(messageTimeout)
    messageTimeout = null
  }
}

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

const handleToggleFavorite = async (taskId: string) => {
  if (isProcessing.value) return

  try {
    isProcessing.value = true
    emit('task-favorite', taskId)
    showActionMessage('success', 'Favorite status updated!')
  } catch (error) {
    showActionMessage('error', 'Failed to update favorite status')
  } finally {
    setTimeout(() => {
      isProcessing.value = false
    }, 300)
  }
}

const handleMarkAsDone = async (taskId: string) => {
  if (isProcessing.value) return

  try {
    isProcessing.value = true
    emit('task-mark-done', taskId)
    showActionMessage('success', 'Task status updated!')
  } catch (error) {
    showActionMessage('error', 'Failed to update task status')
  } finally {
    setTimeout(() => {
      isProcessing.value = false
    }, 300)
  }
}

const handleCategorizeTask = async (taskId: string) => {
  if (isProcessing.value || categorizingTaskId.value) return

  try {
    isProcessing.value = true
    categorizingTaskId.value = taskId

    // Use the composable function directly
    const { handleCategorizeTaskById } = useTaskView()

    await handleCategorizeTaskById(taskId)

    // Emit the event for parent component to refresh data
    emit('task-categorize', taskId)

    showActionMessage('success', 'Task categorized successfully!')
  } catch (error) {
    console.error('Categorization failed:', error)
    showActionMessage('error', 'Failed to categorize task. Please try again.')
  } finally {
    setTimeout(() => {
      isProcessing.value = false
      categorizingTaskId.value = null
    }, 500)
  }
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
    showActionMessage('success', 'Task deleted successfully!')

    await new Promise(resolve => setTimeout(resolve, 300))

    deleteTaskToConfirm.value = null
  } catch (error) {
    console.error('Error deleting task:', error)
    showActionMessage('error', 'Failed to delete task')
    deleteTaskToConfirm.value = taskToDelete
  } finally {
    isDeleting.value = false
  }
}
</script>