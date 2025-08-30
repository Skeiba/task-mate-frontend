<template>
  <!-- Modal Backdrop -->
  <div
      v-if="showModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      @click.self="closeModal"
  >
    <div class="bg-secondary-color rounded-lg shadow-2xl w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-3 sm:p-4 md:p-6">
        <div class="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <CheckSquare class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-sm sm:text-lg md:text-xl font-semibold text-color truncate">{{ modalTitle }}</h2>
            <p class="text-xs sm:text-sm text-secondary hidden sm:block">
              {{ mode === 'create' ? 'Create a new task' : mode === 'edit' ? 'Modify task details' : 'View task information' }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <!-- Edit/View Mode Toggle -->
          <button
              v-if="mode === 'view' && currentTask"
              @click="switchToEditMode"
              class="hover:text-blue-500 rounded-full transition-colors p-1"
              title="Edit task"
          >
            <Edit class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          </button>

          <!-- Delete Button -->
          <button
              v-if="(mode === 'edit' || mode === 'view') && currentTask"
              @click="showDeleteConfirm = true"
              class="hover:text-red-600 text-red-500 rounded-full transition-colors p-1"
              title="Delete task"
          >
            <Trash2 class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>

          <!-- Close Button -->
          <button
              @click="closeModal"
              class="hover:text-red-600 transition-colors p-1"
          >
            <X class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="bg-color m-1 sm:m-2 overflow-hidden rounded-lg sm:rounded-xl" style="height: calc(85vh - 80px); max-height: calc(85vh - 80px);">
        <!-- Success/Error Messages -->
        <div v-if="successMessage || errorMessage" class="px-3 sm:px-4 md:px-6 pb-2 sm:pb-4">
          <div
              v-if="successMessage"
              class="bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl mb-2 sm:mb-4 flex items-center space-x-2"
          >
            <CheckSquare class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span class="text-xs sm:text-sm">{{ successMessage }}</span>
          </div>
          <div
              v-if="errorMessage"
              class="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl mb-2 sm:mb-4 flex items-center space-x-2"
          >
            <AlertTriangle class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span class="text-xs sm:text-sm">{{ errorMessage }}</span>
          </div>
        </div>

        <div class="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-y-auto" style="height: calc(100% - 60px);">
          <form @submit.prevent="mode === 'create' ? handleCreateTask() : handleUpdateTask()">
            <!-- Task Title -->
            <div>
              <label for="title" class="block pt-1 sm:pt-2 text-xs sm:text-sm font-semibold text-secondary mb-1 sm:mb-2">
                Task Title
              </label>
              <input
                  id="title"
                  v-model="taskForm.title"
                  type="text"
                  :disabled="isReadOnly"
                  class="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:cursor-not-allowed transition-all duration-200 text-color placeholder-gray-500 text-sm sm:text-base"
                  :class="{ 'border-red-300 focus:ring-red-500': formErrors.title }"
                  placeholder="What needs to be done?"
              />
              <p v-if="formErrors.title" class="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                <AlertTriangle class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{{ formErrors.title }}</span>
              </p>
            </div>

            <!-- Task Description -->
            <div>
              <label for="content" class="block pt-1 sm:pt-2 text-xs sm:text-sm font-semibold text-secondary mb-1 sm:mb-2">
                Description
              </label>
              <textarea
                  id="content"
                  v-model="taskForm.content"
                  :disabled="isReadOnly"
                  rows="3"
                  class="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:cursor-not-allowed transition-all duration-200 text-color placeholder-gray-500 resize-none text-sm sm:text-base"
                  :class="{ 'border-red-300 focus:ring-red-500': formErrors.content }"
                  placeholder="Add more details about this task..."
              />
              <p v-if="formErrors.content" class="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                <AlertTriangle class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{{ formErrors.content }}</span>
              </p>
            </div>

            <!-- Priority, Status and Due Date Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-1 sm:mt-2 gap-3 sm:gap-4 md:gap-6">
              <!-- Priority Dropdown -->
              <div class="relative">
                <label class="block text-xs sm:text-sm font-semibold text-secondary mb-1 sm:mb-2">
                  Priority
                </label>
                <div class="relative">
                  <button
                      type="button"
                      :disabled="isReadOnly"
                      @click="showPriorityDropdown = !showPriorityDropdown"
                      class="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl hover-theme focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <component
                          :is="getPriorityIcon(taskForm.priority)"
                          class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                          :class="getPriorityColor(taskForm.priority)"
                      />
                      <span class="font-medium text-color truncate">{{ getPriorityLabel(taskForm.priority) }}</span>
                    </div>
                    <ChevronDown class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0" :class="{ 'rotate-180': showPriorityDropdown }" />
                  </button>

                  <!-- Priority Dropdown Menu -->
                  <div v-if="showPriorityDropdown && !isReadOnly"
                       class="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-color border border-gray-200 rounded-lg sm:rounded-xl shadow-lg z-50">
                    <div class="py-1 sm:py-2">
                      <button
                          v-for="priority in priorityOptions"
                          :key="priority.value"
                          type="button"
                          @click="selectPriority(priority.value)"
                          class="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 hover-theme transition-colors duration-150 text-sm sm:text-base"
                          :class="{ '': taskForm.priority === priority.value }"
                      >
                        <component
                            :is="getPriorityIcon(priority.value)"
                            class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                            :class="getPriorityColor(priority.value)"
                        />
                        <span class="font-medium text-color flex-1 truncate">{{ priority.label }}</span>
                        <Check v-if="taskForm.priority === priority.value" class="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status Dropdown -->
              <div class="relative">
                <label class="block text-xs sm:text-sm font-semibold text-secondary mb-1 sm:mb-2">
                  Status
                </label>
                <div class="relative">
                  <button
                      type="button"
                      :disabled="isReadOnly"
                      @click="showStatusDropdown = !showStatusDropdown"
                      class="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl hover-theme focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <component
                          :is="getStatusIcon(taskForm.status)"
                          class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                          :class="getStatusColor(taskForm.status)"
                      />
                      <span class="font-medium text-color truncate">{{ getStatusLabel(taskForm.status) }}</span>
                    </div>
                    <ChevronDown class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0" :class="{ 'rotate-180': showStatusDropdown }" />
                  </button>

                  <!-- Status Dropdown Menu -->
                  <div v-if="showStatusDropdown && !isReadOnly"
                       class="absolute top-full left-0 right-0 mt-1 sm:mt-2 border bg-color border-gray-200 rounded-lg sm:rounded-xl shadow-lg z-50">
                    <div class="py-1 sm:py-2">
                      <button
                          v-for="status in statusOptions"
                          :key="status.value"
                          type="button"
                          @click="selectStatus(status.value)"
                          class="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 hover-theme transition-colors duration-150 text-sm sm:text-base"
                          :class="{ '': taskForm.status === status.value }"
                      >
                        <component
                            :is="getStatusIcon(status.value)"
                            class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                            :class="getStatusColor(status.value)"
                        />
                        <span class="font-medium text-color flex-1 truncate">{{ status.label }}</span>
                        <Check v-if="taskForm.status === status.value" class="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Due Date -->
              <div class="relative sm:col-span-2 lg:col-span-1">
                <label class="block text-xs sm:text-sm font-semibold text-secondary mb-1 sm:mb-2">
                  Due Date
                </label>
                <div class="relative">
                  <button
                      type="button"
                      :disabled="isReadOnly"
                      @click="showDatePicker = !showDatePicker"
                      class="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl bg-color hover-theme focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed text-sm sm:text-base"
                      :class="{ 'border-red-300 focus:ring-red-500': formErrors.dueDate }"
                  >
                    <div class="flex items-center space-x-1 sm:space-x-2 min-w-0">
                      <Calendar class="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                      <span class="font-medium text-color truncate">
                        {{ taskForm.dueDate ? formatDateTime(taskForm.dueDate) : 'Select due date' }}
                      </span>
                    </div>
                    <ChevronDown class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0" :class="{ 'rotate-180': showDatePicker }" />
                  </button>

                  <!-- Date Picker Dropdown -->
                  <div v-if="showDatePicker && !isReadOnly"
                       class="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-color border border-gray-200 rounded-lg sm:rounded-xl shadow-lg z-50">
                    <div class="p-3 sm:p-4">
                      <input
                          v-model="taskForm.dueDate"
                          type="datetime-local"
                          @change="showDatePicker = false"
                          class="w-full px-2 sm:px-3 py-1 sm:py-2 cursor-pointer border border-transparent rounded-lg focus:border-transparent transition-all duration-200 text-secondary text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                <p v-if="formErrors.dueDate" class="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                  <AlertTriangle class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{{ formErrors.dueDate }}</span>
                </p>
              </div>
            </div>

            <!-- Categories -->
            <div>
              <label class="block text-xs sm:text-sm font-semibold text-secondary  pt-1 sm:pt-2 mb-1 sm:mb-2">
                Categories
              </label>
              <div class="flex flex-wrap gap-1 sm:gap-2">
                <button
                    v-for="category in availableCategories"
                    :key="category.id"
                    type="button"
                    :disabled="isReadOnly"
                    @click="toggleCategory(category)"
                    class="flex items-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded-lg border-2 transition-all duration-200 disabled:cursor-not-allowed"
                    :class="[
                      isCategorySelected(category)
                        ? 'border-green-500 text-green-700 bg-green-50 shadow-sm'
                        : 'border-gray-200 text-color hover:border-gray-300 hover-theme',
                      isReadOnly && 'opacity-75'
                    ]"
                >
                  <div
                      class="w-6 h-6 rounded-full mr-2 flex items-center justify-center"
                      :style="{ backgroundColor: category.color || '#6B7280' }"
                  >
                    <component
                        :is="lucideIconMap[category.icon] || lucideIconMap['briefcase']"
                        class="w-3 h-3 text-white"
                    />
                  </div>
                  <span class="truncate max-w-[100px]  sm:max-w-none">{{ category.name }}</span>
                  <Check v-if="isCategorySelected(category)" class="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 flex-shrink-0" />
                </button>
                <span v-if="availableCategories.length === 0" class="text-xs sm:text-sm text-secondary italic flex items-center">
                  <Tag class="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  No categories available
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 md:pt-6">
              <button
                  type="button"
                  @click="closeModal"
                  class="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-200 text-secondary rounded-lg sm:rounded-xl hover-theme transition-all duration-200 font-medium text-sm sm:text-base"
              >
                {{ isReadOnly ? 'Close' : 'Cancel' }}
              </button>

              <button
                  v-if="!isReadOnly"
                  type="submit"
                  :disabled="!isFormValid || isLoading"
                  class="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Loader2 v-if="isLoading" class="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                {{ mode === 'create' ? 'Create Task' : 'Update Task' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- Delete Confirmation Modal -->
    <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-3 sm:p-4"
        @click.self="showDeleteConfirm = false"
    >
      <div class="bg-color rounded-lg sm:rounded-xl shadow-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-6">
        <div class="flex items-center mb-3 sm:mb-4">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            <AlertTriangle class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-600" />
          </div>
          <h3 class="text-base sm:text-lg font-semibold text-color">Delete Task</h3>
        </div>
        <p class="text-sm sm:text-base text-secondary mb-4 sm:mb-6">
          Are you sure you want to delete "<span class="font-medium break-words">{{ currentTask?.title }}</span>"? This action cannot be undone.
        </p>
        <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
              @click="showDeleteConfirm = false"
              class="w-full sm:w-auto px-3 sm:px-4 py-2 border-2 border-gray-200 text-color rounded-lg sm:rounded-xl hover-theme transition-all duration-200 font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
              @click="handleDeleteTask"
              :disabled="isLoading"
              class="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 font-medium text-sm sm:text-base"
          >
            <Loader2 v-if="isLoading" class="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
            Delete Task
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  Check,
  CheckSquare,
  Edit,
  Loader2,
  Trash2,
  X,
  ChevronDown,
  Calendar,
  Tag
} from "lucide-vue-next"

import { useTaskView } from "../composables/useTaskView.ts"
import { ref, onMounted, onUnmounted } from 'vue'
import {useCategoryView} from "../composables/useCategoryView.ts";

const showPriorityDropdown = ref(false)
const showStatusDropdown = ref(false)

const {
  showModal,
  mode,
  isLoading,
  successMessage,
  errorMessage,
  currentTask,
  availableCategories,
  showDeleteConfirm,
  showDatePicker,

  // Form
  taskForm,
  formErrors,

  // Constants
  priorityOptions,
  statusOptions,

  // Computed
  isFormValid,
  modalTitle,
  isReadOnly,

  // Helper methods
  getStatusIcon,
  getStatusColor,
  getStatusLabel,
  getPriorityIcon,
  getPriorityColor,
  getPriorityLabel,
  selectStatus,
  selectPriority,
  formatDateTime,

  // Methods
  openModal,
  closeModal,
  handleCreateTask,
  handleUpdateTask,
  handleDeleteTask,
  toggleCategory,
  isCategorySelected,
  switchToEditMode,
} = useTaskView()

const {lucideIconMap} = useCategoryView()

const handleClickOutside = (e: Event) => {
  const target = e.target as Element
  if (!target.closest('.relative')) {
    showPriorityDropdown.value = false
    showStatusDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({
  openModal
})
</script>