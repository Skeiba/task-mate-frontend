import { ref, computed } from 'vue'
import { categoryService } from "../services/categoryService.ts"
import type { Category, CategoryRequest } from "../types"
import {
    Briefcase,
    User,
    ShoppingCart,
    Heart,
    Home,
    Car,
    Book,
    Music,
    Camera,
    Phone
} from "lucide-vue-next"

const lucideIconMap: Record<string, any> = {
    "briefcase": Briefcase,
    "user": User,
    "shopping-cart": ShoppingCart,
    "heart": Heart,
    "home": Home,
    "car": Car,
    "book": Book,
    "music": Music,
    "camera": Camera,
    "phone": Phone
}

export function useCategoryView() {
    // Modal state
    const showModal = ref(false)
    const activeTab = ref<'list' | 'create' | 'edit'>('list')
    const isLoading = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    // Categories data
    const categories = ref<Category[]>([])
    const selectedCategory = ref<Category | null>(null)
    const allowedIcons = ref<string[]>([])

    // Form data
    const categoryForm = ref({
        name: '',
        icon: 'briefcase', // Set default icon
        color: '#3B82F6'
    })

    // Form validation errors
    const formErrors = ref<Partial<Record<keyof typeof categoryForm.value, string>>>({})

    // Predefined colors for categories
    const predefinedColors = [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#F97316', // Orange
        '#06B6D4', // Cyan
        '#84CC16', // Lime
        '#EC4899', // Pink
        '#6B7280'  // Gray
    ]

    // Computed properties
    const isFormValid = computed(() => {
        return categoryForm.value.name &&
            categoryForm.value.color &&
            categoryForm.value.icon &&
            Object.keys(formErrors.value).length === 0
    })

    const filteredCategories = ref('')
    const displayedCategories = computed(() => {
        if (!filteredCategories.value) return categories.value

        return categories.value.filter(category =>
            category.name.toLowerCase().includes(filteredCategories.value.toLowerCase())
        )
    })

    // Methods
    const openModal = async () => {
        showModal.value = true
        activeTab.value = 'list'
        await Promise.all([
            loadCategories(),
            loadAllowedIcons()
        ])
        clearMessages()
    }

    const closeModal = () => {
        showModal.value = false
        resetForm()
        clearMessages()
        selectedCategory.value = null
        filteredCategories.value = ''
    }

    const setActiveTab = (tab: 'list' | 'create' | 'edit') => {
        activeTab.value = tab
        clearMessages()

        if (tab === 'create') {
            resetForm()
        } else if (tab === 'edit' && selectedCategory.value) {
            populateForm(selectedCategory.value)
        }
    }

    const loadCategories = async () => {
        try {
            isLoading.value = true
            const response = await categoryService.getAllCategories()

            if (response.success && response.data) {
                categories.value = response.data
            }
        } catch (error) {
            console.error('Failed to load categories:', error)
            errorMessage.value = 'Failed to load categories'
        } finally {
            isLoading.value = false
        }
    }

    const loadAllowedIcons = async () => {
        try {
            const response = await categoryService.getAllowedIcons()

            if (response.success && response.data) {
                allowedIcons.value = response.data as string[]
            }
        } catch (error) {
            console.error('Failed to load icons:', error)
            allowedIcons.value = [
                'briefcase', 'user', 'shopping-cart', 'heart',
                'home', 'car', 'book', 'music', 'camera', 'phone'
            ]
        }
    }

    const allowedLucideIcons = computed(() =>
        allowedIcons.value.map(name => ({
            name,
            icon: lucideIconMap[name] || lucideIconMap["briefcase"] // fallback
        }))
    )

    const validateForm = () => {
        formErrors.value = {}

        if (!categoryForm.value.name) {
            formErrors.value.name = 'Category name is required'
        } else if (categoryForm.value.name.length < 2) {
            formErrors.value.name = 'Category name must be at least 2 characters'
        } else if (categoryForm.value.name.length > 50) {
            formErrors.value.name = 'Category name must be less than 50 characters'
        } else {
            // Check for duplicate names (excluding current category if editing)
            const isDuplicate = categories.value.some(cat =>
                cat.name.toLowerCase() === categoryForm.value.name.toLowerCase() &&
                cat.id !== selectedCategory.value?.id
            )

            if (isDuplicate) {
                formErrors.value.name = 'A category with this name already exists'
            }
        }

        if (!categoryForm.value.color) {
            formErrors.value.color = 'Please select a color'
        }

        if (!categoryForm.value.icon) {
            formErrors.value.icon = 'Please select an icon'
        }

        return Object.keys(formErrors.value).length === 0
    }

    const handleCreateCategory = async () => {
        if (!validateForm()) return

        try {
            isLoading.value = true
            clearMessages()

            // Create category request object with all form fields
            const categoryRequest : CategoryRequest = {
                name: categoryForm.value.name,
                icon: categoryForm.value.icon,
                color: categoryForm.value.color
            }

            console.log('Creating category with data:', categoryRequest) // Debug log

            const response = await categoryService.createCategory(categoryRequest)

            if (response.success && response.data) {
                categories.value.push(response.data)
                successMessage.value = 'Category created successfully!'

                resetForm()

                setTimeout(() => {
                    setActiveTab('list')
                }, 2000)
            }
        } catch (error) {
            console.error('Category creation failed:', error)
            errorMessage.value = 'Failed to create category. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const handleUpdateCategory = async () => {
        if (!selectedCategory.value || !validateForm()) return

        try {
            isLoading.value = true
            clearMessages()

            // Create category request object with all form fields
            const categoryRequest : CategoryRequest = {
                name: categoryForm.value.name,
                icon: categoryForm.value.icon,
                color: categoryForm.value.color
            }

            console.log('Updating category with data:', categoryRequest) // Debug log

            const response = await categoryService.updateCategory(
                selectedCategory.value.id,
                categoryRequest
            )

            if (response.success && response.data) {
                const index = categories.value.findIndex(cat => cat.id === selectedCategory.value!.id)
                if (index !== -1) {
                    categories.value[index] = response.data
                }

                successMessage.value = 'Category updated successfully!'
                selectedCategory.value = response.data

                // Auto switch to list view after 2 seconds
                setTimeout(() => {
                    setActiveTab('list')
                }, 2000)
            }
        } catch (error) {
            console.error('Category update failed:', error)
            errorMessage.value = 'Failed to update category. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const handleDeleteCategory = async (category: Category) => {
        if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
            return
        }

        try {
            isLoading.value = true
            clearMessages()

            await categoryService.deleteCategory(category.id)

            categories.value = categories.value.filter(cat => cat.id !== category.id)
            successMessage.value = 'Category deleted successfully!'

            if (selectedCategory.value?.id === category.id) {
                selectedCategory.value = null
                setActiveTab('list')
            }
        } catch (error) {
            console.error('Category deletion failed:', error)
            errorMessage.value = 'Failed to delete category. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const selectCategoryForEdit = (category: Category) => {
        selectedCategory.value = category
        populateForm(category)
        setActiveTab('edit')
    }

    const populateForm = (category: Category) => {
        categoryForm.value = {
            name: category.name,
            icon: category.icon || 'briefcase',
            color: category.color || '#3B82F6'
        }
    }

    const resetForm = () => {
        categoryForm.value = {
            name: '',
            icon: 'briefcase', // Set default icon
            color: '#3B82F6'
        }
        formErrors.value = {}
    }

    const clearMessages = () => {
        successMessage.value = ''
        errorMessage.value = ''
    }

    return {
        // State
        showModal,
        activeTab,
        isLoading,
        successMessage,
        errorMessage,
        categories,
        selectedCategory,
        allowedIcons,

        // Form
        categoryForm,
        formErrors,
        filteredCategories,

        // Constants
        predefinedColors,
        lucideIconMap,

        // Computed
        isFormValid,
        displayedCategories,
        allowedLucideIcons,

        // Methods
        openModal,
        closeModal,
        setActiveTab,
        loadCategories,
        loadAllowedIcons,
        validateForm,
        handleCreateCategory,
        handleUpdateCategory,
        handleDeleteCategory,
        selectCategoryForEdit,
        populateForm,
        resetForm,
        clearMessages
    }
}