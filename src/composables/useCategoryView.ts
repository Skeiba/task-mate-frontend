import { ref, computed } from 'vue'
import { categoryService } from '../services/categoryService'
import type { Category, CategoryRequest } from '../types'
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
} from 'lucide-vue-next'

// Constants
const LUCIDE_ICON_MAP: Record<string, any> = {
    'briefcase': Briefcase,
    'user': User,
    'shopping-cart': ShoppingCart,
    'heart': Heart,
    'home': Home,
    'car': Car,
    'book': Book,
    'music': Music,
    'camera': Camera,
    'phone': Phone
}

const PREDEFINED_COLORS = [
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

const DEFAULT_ICONS = [
    'briefcase', 'user', 'shopping-cart', 'heart',
    'home', 'car', 'book', 'music', 'camera', 'phone'
]

const DEFAULT_FORM_VALUES = {
    name: '',
    icon: 'briefcase',
    color: '#3B82F6'
}

const VALIDATION_RULES = {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50
}

export function useCategoryView() {
    // Modal state
    const showModal = ref(false)
    const activeTab = ref<'list' | 'create' | 'edit'>('list')
    const isLoading = ref(false)

    // Messages
    const successMessage = ref('')
    const errorMessage = ref('')

    // Data
    const categories = ref<Category[]>([])
    const selectedCategory = ref<Category | null>(null)
    const allowedIcons = ref<string[]>([])
    const filteredCategories = ref('')

    // Form
    const categoryForm = ref({ ...DEFAULT_FORM_VALUES })
    const formErrors = ref<Partial<Record<keyof typeof categoryForm.value, string>>>({})

    // Computed properties
    const isFormValid = computed(() => {
        return Boolean(
            categoryForm.value.name &&
            categoryForm.value.color &&
            categoryForm.value.icon &&
            Object.keys(formErrors.value).length === 0
        )
    })

    const displayedCategories = computed(() => {
        if (!filteredCategories.value) return categories.value

        return categories.value.filter(category =>
            category.name.toLowerCase().includes(filteredCategories.value.toLowerCase())
        )
    })

    const allowedLucideIcons = computed(() =>
        allowedIcons.value.map(name => ({
            name,
            icon: LUCIDE_ICON_MAP[name] || LUCIDE_ICON_MAP.briefcase
        }))
    )

    // Utility methods
    const clearMessages = () => {
        successMessage.value = ''
        errorMessage.value = ''
    }

    const resetForm = () => {
        categoryForm.value = { ...DEFAULT_FORM_VALUES }
        formErrors.value = {}
    }

    const populateForm = (category: Category) => {
        categoryForm.value = {
            name: category.name,
            icon: category.icon || DEFAULT_FORM_VALUES.icon,
            color: category.color || DEFAULT_FORM_VALUES.color
        }
    }

    // Validation
    const validateForm = (): boolean => {
        formErrors.value = {}
        const { name } = categoryForm.value

        if (!name) {
            formErrors.value.name = 'Category name is required'
        } else if (name.length < VALIDATION_RULES.MIN_NAME_LENGTH) {
            formErrors.value.name = `Category name must be at least ${VALIDATION_RULES.MIN_NAME_LENGTH} characters`
        } else if (name.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
            formErrors.value.name = `Category name must be less than ${VALIDATION_RULES.MAX_NAME_LENGTH} characters`
        } else {
            const isDuplicate = categories.value.some(cat =>
                cat.name.toLowerCase() === name.toLowerCase() &&
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

    // API methods
    const loadCategories = async (): Promise<void> => {
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

    const loadAllowedIcons = async (): Promise<void> => {
        try {
            const response = await categoryService.getAllowedIcons()

            if (response.success && response.data) {
                allowedIcons.value = response.data as string[]
            }
        } catch (error) {
            console.error('Failed to load icons:', error)
            allowedIcons.value = DEFAULT_ICONS
        }
    }

    const createCategoryRequest = (): CategoryRequest => ({
        name: categoryForm.value.name,
        icon: categoryForm.value.icon,
        color: categoryForm.value.color
    })

    const handleCreateCategory = async (): Promise<void> => {
        if (!validateForm()) return

        try {
            isLoading.value = true
            clearMessages()

            const categoryRequest = createCategoryRequest()
            const response = await categoryService.createCategory(categoryRequest)

            if (response.success && response.data) {
                categories.value.push(response.data)
                successMessage.value = 'Category created successfully!'
                resetForm()

                setTimeout(() => setActiveTab('list'), 2000)
            }
        } catch (error) {
            console.error('Category creation failed:', error)
            errorMessage.value = 'Failed to create category. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const handleUpdateCategory = async (): Promise<void> => {
        if (!selectedCategory.value || !validateForm()) return

        try {
            isLoading.value = true
            clearMessages()

            const categoryRequest = createCategoryRequest()
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

                setTimeout(() => setActiveTab('list'), 2000)
            }
        } catch (error) {
            console.error('Category update failed:', error)
            errorMessage.value = 'Failed to update category. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const handleDeleteCategory = async (category: Category): Promise<void> => {
        const confirmed = confirm(
            `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
        )

        if (!confirmed) return

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

    const openModal = async (): Promise<void> => {
        showModal.value = true
        activeTab.value = 'list'
        clearMessages()

        await Promise.all([
            loadCategories(),
            loadAllowedIcons()
        ])
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

    const selectCategoryForEdit = (category: Category) => {
        selectedCategory.value = category
        populateForm(category)
        setActiveTab('edit')
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
        filteredCategories,

        // Form
        categoryForm,
        formErrors,

        // Constants
        predefinedColors: PREDEFINED_COLORS,
        lucideIconMap: LUCIDE_ICON_MAP,

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