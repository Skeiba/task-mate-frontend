<template>
  <!-- Modal Backdrop -->
  <div
      v-if="showModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      @click.self="closeModal"
  >
    <div class="bg-secondary-color rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-4 sm:p-6">
        <div class="flex items-center space-x-2 sm:space-x-3">
          <div
              class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold"
          >
            <FolderOpen class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-semibold text-color">Category Management</h2>
            <p class="text-xs sm:text-sm text-secondary hidden sm:block">Organize your tasks with categories</p>
          </div>
        </div>
        <button
            @click="closeModal"
            class="hover:text-red-600 transition-colors p-1"
        >
          <X class="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex flex-col md:flex-row bg-color m-1 sm:m-2 overflow-hidden rounded-xl" style="height: calc(85vh - 120px); min-height: 400px;">
        <nav class="flex md:flex-col md:w-64 p-3 sm:p-5 space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-visible">
          <button
              @click="setActiveTab('list')"
              class="flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap md:w-full"
              :class="activeTab === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'"
          >
            <List class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span class="hidden sm:inline">All Categories</span>
            <span class="sm:hidden">All</span>
          </button>
          <button
              @click="setActiveTab('create')"
              class="flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap md:w-full"
              :class="activeTab === 'create' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'"
          >
            <Plus class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span class="hidden sm:inline">Create Category</span>
            <span class="sm:hidden">Create</span>
          </button>
          <button
              @click="setActiveTab('edit')"
              class="flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap md:w-full"
              :class="activeTab === 'edit' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'"
          >
            <Edit class="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span class="hidden sm:inline">Edit Category</span>
            <span class="sm:hidden">Edit</span>
          </button>
        </nav>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="successMessage || errorMessage" class="p-3 sm:p-6 pb-0">
            <div
                v-if="successMessage"
                class="bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm"
            >
              {{ successMessage }}
            </div>
            <div
                v-if="errorMessage"
                class="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm"
            >
              {{ errorMessage }}
            </div>
          </div>

          <!-- Categories List Tab -->
          <div v-if="activeTab === 'list'" class="p-3 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
              <h3 class="text-base sm:text-lg font-medium">Categories ({{ categories.length }})</h3>
              <button
                  @click="setActiveTab('create')"
                  class="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center text-sm w-full sm:w-auto justify-center"
              >
                <Plus class="w-4 h-4 mr-1" />
                Add Category
              </button>
            </div>

            <!-- Search -->
            <div class="mb-4">
              <div class="relative">
                <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    v-model="filteredCategories"
                    type="text"
                    placeholder="Search categories..."
                    class="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            <!-- Categories Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div
                  v-for="category in displayedCategories"
                  :key="category.id"
                  class="bg-secondary-color rounded-lg p-3 sm:p-4 hover-theme transition-shadow"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div
                        class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                        :style="{ backgroundColor: category.color || '#6B7280' }"
                    >
                      <component
                          :is="lucideIconMap[category.icon] || lucideIconMap['briefcase']"
                          class="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <h4 class="font-medium text-color text-sm sm:text-base truncate">{{ category.name }}</h4>
                    </div>
                  </div>
                  <div class="flex space-x-1 flex-shrink-0">
                    <button
                        @click="selectCategoryForEdit(category)"
                        class="p-1.5 hover:text-blue-500 rounded transition-colors"
                        title="Edit category"
                    >
                      <Edit class="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                        @click="handleDeleteCategory(category)"
                        class="p-1.5  hover:text-red-600 rounded transition-colors"
                        title="Delete category"
                    >
                      <Trash2 class="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="displayedCategories.length === 0" class="text-center py-8 sm:py-12">
              <FolderOpen class="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-4" />
              <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">
                {{ filteredCategories ? 'No categories found' : 'No categories yet' }}
              </h3>
              <p class="text-gray-500 mb-4 text-sm sm:text-base px-4">
                {{ filteredCategories ? 'Try adjusting your search.' : 'Get started by creating your first category.' }}
              </p>
              <button
                  v-if="!filteredCategories"
                  @click="setActiveTab('create')"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
              >
                Create Your First Category
              </button>
            </div>
          </div>

          <!-- Create Category Tab -->
          <div v-if="activeTab === 'create'" class="p-3 sm:p-6">
            <h3 class="text-base sm:text-lg font-medium mb-4">Create New Category</h3>
            <form @submit.prevent="handleCreateCategory" class="space-y-4 sm:space-y-6">
              <div>
                <label for="categoryName" class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                  Category Name *
                </label>
                <input
                    id="categoryName"
                    v-model="categoryForm.name"
                    type="text"
                    class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                    :class="{ 'border-red-300': formErrors.name }"
                    placeholder="e.g., Work, Personal, Shopping"
                />
                <p v-if="formErrors.name" class="mt-1 text-sm text-red-600">
                  {{ formErrors.name }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                  Color *
                </label>
                <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-5 gap-2 sm:gap-3">
                  <button
                      v-for="color in predefinedColors"
                      :key="color"
                      type="button"
                      @click="categoryForm.color = color"
                      class="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all"
                      :class="categoryForm.color === color ? 'border-gray-800' : 'border-gray-300'"
                      :style="{ backgroundColor: color }"
                  >
                    <Check v-if="categoryForm.color === color" class="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                  </button>
                </div>
                <p v-if="formErrors.color" class="mt-1 text-sm text-red-600">
                  {{ formErrors.color }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                  Icon *
                </label>
                <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-5 gap-2 sm:gap-3 max-h-32 sm:max-h-40 overflow-y-auto">
                  <button
                      v-for="icon in allowedLucideIcons"
                      :key="icon.name"
                      type="button"
                      @click="categoryForm.icon = icon.name"
                      class="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all hover-theme"
                      :class="categoryForm.icon === icon.name ? 'border-gray-800' : 'border-gray-300'"
                      :style="{ backgroundColor: categoryForm.color && categoryForm.icon === icon.name ? categoryForm.color : (categoryForm.color || '#6B7280') }"
                  >
                    <component :is="icon.icon" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                </div>
                <p v-if="formErrors.icon" class="mt-1 text-sm text-red-600">
                  {{ formErrors.icon }}
                </p>
              </div>

              <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                    type="button"
                    @click="setActiveTab('list')"
                    class="w-full sm:w-auto px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    :disabled="!isFormValid || isLoading"
                    class="w-full sm:w-auto px-4 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base order-1 sm:order-2"
                >
                  <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
                  Create Category
                </button>
              </div>
            </form>
          </div>

          <!-- Edit Category Tab -->
          <div v-if="activeTab === 'edit'" class="p-3 sm:p-6">
            <div v-if="!selectedCategory" class="text-center py-8 sm:py-12">
              <Edit class="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-4" />
              <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">No Category Selected</h3>
              <p class="text-gray-500 mb-4 text-sm sm:text-base px-4">Please select a category from the list to edit.</p>
              <button
                  @click="setActiveTab('list')"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
              >
                Go to Categories List
              </button>
            </div>

            <div v-else>
              <div class="flex items-center mb-4 sm:mb-6">
                <div
                    class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2 sm:mr-3 flex-shrink-0"
                    :style="{ backgroundColor: selectedCategory.color || '#6B7280' }"
                >
                  <component
                      :is="lucideIconMap[selectedCategory.icon] || lucideIconMap['briefcase']"
                      class="w-3 h-3 sm:w-4 sm:h-4 text-white"
                  />
                </div>
                <h3 class="text-base sm:text-lg font-medium truncate">Edit "{{ selectedCategory.name }}"</h3>
              </div>

              <form @submit.prevent="handleUpdateCategory" class="space-y-4 sm:space-y-6">
                <div>
                  <label for="editCategoryName" class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                    Category Name *
                  </label>
                  <input
                      id="editCategoryName"
                      v-model="categoryForm.name"
                      type="text"
                      class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                      :class="{ 'border-red-300': formErrors.name }"
                      placeholder="e.g., Work, Personal, Shopping"
                  />
                  <p v-if="formErrors.name" class="mt-1 text-sm text-red-600">
                    {{ formErrors.name }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                    Color *
                  </label>
                  <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-5 gap-2 sm:gap-3">
                    <button
                        v-for="color in predefinedColors"
                        :key="color"
                        type="button"
                        @click="categoryForm.color = color"
                        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all"
                        :class="categoryForm.color === color ? 'border-gray-800' : 'border-gray-300'"
                        :style="{ backgroundColor: color }"
                    >
                      <Check v-if="categoryForm.color === color" class="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                    </button>
                  </div>
                  <p v-if="formErrors.color" class="mt-1 text-sm text-red-600">
                    {{ formErrors.color }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-1 sm:mb-2">
                    Icon *
                  </label>
                  <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-5 gap-2 sm:gap-3 max-h-32 sm:max-h-40 overflow-y-auto">
                    <button
                        v-for="icon in allowedLucideIcons"
                        :key="icon.name"
                        type="button"
                        @click="categoryForm.icon = icon.name"
                        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all hover-theme"
                        :class="categoryForm.icon === icon.name ? 'border-gray-800' : 'border-gray-300'"
                        :style="{ backgroundColor: categoryForm.color && categoryForm.icon === icon.name ? categoryForm.color : (categoryForm.color || '#6B7280') }"
                    >
                      <component :is="icon.icon" class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                  </div>
                  <p v-if="formErrors.icon" class="mt-1 text-sm text-red-600">
                    {{ formErrors.icon }}
                  </p>
                </div>

                <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                      type="button"
                      @click="setActiveTab('list')"
                      class="w-full sm:w-auto px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                      type="submit"
                      :disabled="!isFormValid || isLoading"
                      class="w-full sm:w-auto px-4 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base order-1 sm:order-2"
                  >
                    <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
                    Update Category
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Check,
  Edit,
  FolderOpen,
  List,
  Loader2,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-vue-next"

import { useCategoryView } from "../composables/useCategoryView.ts"

const {
  showModal,
  activeTab,
  isLoading,
  successMessage,
  errorMessage,
  categories,
  selectedCategory,

  categoryForm,
  formErrors,
  filteredCategories,

  predefinedColors,
  lucideIconMap,

  isFormValid,
  displayedCategories,
  allowedLucideIcons,

  openModal,
  closeModal,
  setActiveTab,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  selectCategoryForEdit
} = useCategoryView()

defineExpose({
  openModal
})
</script>