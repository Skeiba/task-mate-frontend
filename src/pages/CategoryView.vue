<template>
  <!-- Modal Backdrop -->
  <div
      v-if="showModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
  >
    <div class="bg-secondary-color rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6">
        <div class="flex items-center space-x-3">
          <div
              class="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold"
          >
            <FolderOpen class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-semibold text-color">Category Management</h2>
            <p class="text-sm text-secondary">Organize your tasks with categories</p>
          </div>
        </div>
        <button
            @click="closeModal"
            class="hover:text-red-600 transition-colors"
        >
          <X class="w-7 h-7" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex bg-color m-2 overflow-hidden rounded-xl" style="height: calc(80vh - 120px);">
        <!-- Tab Navigation -->
        <nav class="w-64 p-5 space-y-2">
          <button
              @click="setActiveTab('list')"
              class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="activeTab === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'"
          >
            <List class="w-5 h-5 mr-2" />
            All Categories
          </button>
          <button
              @click="setActiveTab('create')"
              class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="activeTab === 'create' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'"
          >
            <Plus class="w-5 h-5 mr-2" />
            Create Category
          </button>
          <button
              @click="setActiveTab('edit')"
              class="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="activeTab === 'edit' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'"
          >
            <Edit class="w-5 h-5 mr-2" />
            Edit Category
          </button>
        </nav>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Success/Error Messages -->
          <div v-if="successMessage || errorMessage" class="p-6 pb-0">
            <div
                v-if="successMessage"
                class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4"
            >
              {{ successMessage }}
            </div>
            <div
                v-if="errorMessage"
                class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4"
            >
              {{ errorMessage }}
            </div>
          </div>

          <!-- Categories List Tab -->
          <div v-if="activeTab === 'list'" class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium">Categories ({{ categories.length }})</h3>
              <button
                  @click="setActiveTab('create')"
                  class="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center text-sm"
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
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Categories Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                  v-for="category in displayedCategories"
                  :key="category.id"
                  class="bg-secondary-color border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center space-x-3">
                    <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        :style="{ backgroundColor: category.color || '#6B7280' }"
                    >
                      <component
                          :is="lucideIconMap[category.icon] || lucideIconMap['briefcase']"
                          class="w-4 h-4 text-white"
                      />
                    </div>
                    <div>
                      <h4 class="font-medium text-color">{{ category.name }}</h4>
<!--                      <p class="text-xs text-secondary">{{ category.taskCount || 0 }} tasks</p>-->
                    </div>
                  </div>
                  <div class="flex space-x-1">
                    <button
                        @click="selectCategoryForEdit(category)"
                        class="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        title="Edit category"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                    <button
                        @click="handleDeleteCategory(category)"
                        class="p-1.5 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                        title="Delete category"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between text-xs text-secondary">
                  <span>Created: {{ formatDate(category.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="displayedCategories.length === 0" class="text-center py-12">
              <FolderOpen class="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ filteredCategories ? 'No categories found' : 'No categories yet' }}
              </h3>
              <p class="text-gray-500 mb-4">
                {{ filteredCategories ? 'Try adjusting your search.' : 'Get started by creating your first category.' }}
              </p>
              <button
                  v-if="!filteredCategories"
                  @click="setActiveTab('create')"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Your First Category
              </button>
            </div>
          </div>

          <!-- Create Category Tab -->
          <div v-if="activeTab === 'create'" class="p-6">
            <h3 class="text-lg font-medium mb-4">Create New Category</h3>
            <form @submit.prevent="handleCreateCategory" class="space-y-4">
              <div>
                <label for="categoryName" class="block text-sm font-medium text-secondary mb-1">
                  Category Name *
                </label>
                <input
                    id="categoryName"
                    v-model="categoryForm.name"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    :class="{ 'border-red-300': formErrors.name }"
                    placeholder="e.g., Work, Personal, Shopping"
                />
                <p v-if="formErrors.name" class="mt-1 text-sm text-red-600">
                  {{ formErrors.name }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-1">
                  Color *
                </label>
                <div class="grid grid-cols-5 gap-2">
                  <button
                      v-for="color in predefinedColors"
                      :key="color"
                      type="button"
                      @click="categoryForm.color = color"
                      class="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
                      :class="categoryForm.color === color ? 'border-gray-800' : 'border-gray-300'"
                      :style="{ backgroundColor: color }"
                  >
                    <Check v-if="categoryForm.color === color" class="w-5 h-5 text-white" />
                  </button>
                </div>
                <p v-if="formErrors.color" class="mt-1 text-sm text-red-600">
                  {{ formErrors.color }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-secondary mb-1">
                  Icon *
                </label>
                <div class="grid grid-cols-5 gap-2">
                  <button
                      v-for="icon in allowedLucideIcons"
                      :key="icon.name"
                      type="button"
                      @click="categoryForm.icon = icon.name"
                      class="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
                      :class="categoryForm.icon === icon.name ? 'border-gray-800' : 'border-gray-300'"
                  >
                    <component :is="icon.icon" class="w-6 h-6" />
                  </button>
                </div>
              </div>


              <div class="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    @click="setActiveTab('list')"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    :disabled="!isFormValid || isLoading"
                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
                  Create Category
                </button>
              </div>
            </form>
          </div>

          <!-- Edit Category Tab -->
          <div v-if="activeTab === 'edit'" class="p-6">
            <div v-if="!selectedCategory" class="text-center py-12">
              <Edit class="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">No Category Selected</h3>
              <p class="text-gray-500 mb-4">Please select a category from the list to edit.</p>
              <button
                  @click="setActiveTab('list')"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Go to Categories List
              </button>
            </div>

            <div v-else>
              <div class="flex items-center mb-4">
                <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3"
                    :style="{ backgroundColor: selectedCategory.color || '#6B7280' }"
                >
                  <component
                      :is="lucideIconMap[selectedCategory.icon] || lucideIconMap['briefcase']"
                      class="w-4 h-4 text-white"
                  />
                </div>
                <h3 class="text-lg font-medium">Edit "{{ selectedCategory.name }}"</h3>
              </div>

              <form @submit.prevent="handleUpdateCategory" class="space-y-4">
                <div>
                  <label for="editCategoryName" class="block text-sm font-medium text-secondary mb-1">
                    Category Name *
                  </label>
                  <input
                      id="editCategoryName"
                      v-model="categoryForm.name"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      :class="{ 'border-red-300': formErrors.name }"
                      placeholder="e.g., Work, Personal, Shopping"
                  />
                  <p v-if="formErrors.name" class="mt-1 text-sm text-red-600">
                    {{ formErrors.name }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-1">
                    Color *
                  </label>
                  <div class="grid grid-cols-5 gap-2">
                    <button
                        v-for="color in predefinedColors"
                        :key="color"
                        type="button"
                        @click="categoryForm.color = color"
                        class="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
                        :class="categoryForm.color === color ? 'border-gray-800' : 'border-gray-300'"
                        :style="{ backgroundColor: color }"
                    >
                      <Check v-if="categoryForm.color === color" class="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <p v-if="formErrors.color" class="mt-1 text-sm text-red-600">
                    {{ formErrors.color }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-secondary mb-1">
                    Icon *
                  </label>
                  <div class="grid grid-cols-5 gap-2">
                    <button
                        v-for="icon in allowedLucideIcons"
                        :key="icon.name"
                        type="button"
                        @click="categoryForm.icon = icon.name"
                        class="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
                        :class="categoryForm.icon === icon.name ? 'border-gray-800' : 'border-gray-300'"
                    >
                      <component :is="icon.icon" class="w-6 h-6" />
                    </button>
                  </div>
                  <p v-if="formErrors.icon" class="mt-1 text-sm text-red-600">
                    {{ formErrors.icon }}
                  </p>
                </div>

                <div class="flex justify-end space-x-3 pt-4">
                  <button
                      type="button"
                      @click="setActiveTab('list')"
                      class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                      type="submit"
                      :disabled="!isFormValid || isLoading"
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
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
  // State
  showModal,
  activeTab,
  isLoading,
  successMessage,
  errorMessage,
  categories,
  selectedCategory,

  // Form
  categoryForm,
  formErrors,
  filteredCategories,

  // Constants
  predefinedColors,
  lucideIconMap,
  // allowedIcons,

  // Computed
  isFormValid,
  displayedCategories,
  allowedLucideIcons,


  // Methods
  openModal,
  closeModal,
  setActiveTab,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
  selectCategoryForEdit
} = useCategoryView()

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

defineExpose({
  openModal
})
</script>