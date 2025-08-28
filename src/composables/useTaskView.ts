import { ref, computed, watch } from 'vue'
import { taskService} from "../services/taskService.ts";
import { categoryService } from "../services/categoryService.ts"
import type { Task, TaskRequest, Category } from "../types"
import {AlertCircle, CheckCircle, Circle, Clock, XCircle} from "lucide-vue-next";

export function useTaskView() {
    // Modal state
    const showModal = ref(false)
    const mode = ref<'create' | 'edit' | 'view'>('create')
    const isLoading = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    // Task data
    const currentTask = ref<Task | null>(null)
    const availableCategories = ref<Category[]>([])

    // Form data
    const taskForm = ref<TaskRequest>({
        title: '',
        content: '',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: '',
        categoryIds: [],
        isFavorite: false
    })

    // Form validation errors
    const formErrors = ref<Partial<Record<keyof TaskRequest, string>>>({})

    // UI state
    const showDeleteConfirm = ref(false)
    const selectedCategories = ref<Category[]>([])
    const showStatusDropdown = ref(false)
    const showPriorityDropdown = ref(false)
    const showDatePicker = ref(false)

    // Computed properties
    const isFormValid = computed(() => {
        return taskForm.value.title.trim() &&
            Object.keys(formErrors.value).length === 0
    })

    const priorityOptions = [
        {
            value: 'LOW',
            label: 'Low Priority',
            icon: 'Circle',
            iconColor: 'text-gray-500',
            color: 'bg-gray-100 text-gray-800'
        },
        {
            value: 'MEDIUM',
            label: 'Medium Priority',
            icon: 'Clock',
            iconColor: 'text-blue-500',
            color: 'bg-blue-100 text-blue-800'
        },
        {
            value: 'HIGH',
            label: 'High Priority',
            icon: 'AlertCircle',
            iconColor: 'text-orange-500',
            color: 'bg-orange-100 text-orange-800'
        }
    ]

    const statusOptions = [
        {
            value: 'PENDING',
            label: 'To Do',
            icon: 'Circle',
            iconColor: 'text-gray-500',
            color: 'bg-gray-100 text-gray-800'
        },
        {
            value: 'MISSED',
            label: 'Missed',
            icon: 'XCircle',
            iconColor: 'text-red-500',
            color: 'bg-red-100 text-red-800'
        },
        {
            value: 'DONE',
            label: 'Completed',
            icon: 'CheckCircle',
            iconColor: 'text-green-500',
            color: 'bg-green-100 text-green-800'
        }
    ]

    const modalTitle = computed(() => {
        switch (mode.value) {
            case 'create': return 'Create New Task'
            case 'edit': return 'Edit Task'
            case 'view': return 'Task Details'
            default: return 'Task'
        }
    })

    const isReadOnly = computed(() => mode.value === 'view')

    // Helper methods for dropdowns
    const getPriorityIcon = (priority: string) => {
        const option = priorityOptions.find(p => p.value === priority)
        return option?.icon === 'Circle' ? Circle : option?.icon === 'Clock' ? Clock : AlertCircle
    }

    const getPriorityColor = (priority: string) => {
        const option = priorityOptions.find(p => p.value === priority)
        return option?.iconColor || 'text-gray-500'
    }

    const getPriorityLabel = (priority: string) => {
        const option = priorityOptions.find(p => p.value === priority)
        return option?.label || 'Medium Priority'
    }

    const getStatusIcon = (status: string) => {
        const option = statusOptions.find(s => s.value === status)
        return option?.icon === 'Circle' ? Circle : option?.icon === 'XCircle' ? XCircle : CheckCircle
    }

    const getStatusColor = (status: string) => {
        const option = statusOptions.find(s => s.value === status)
        return option?.iconColor || 'text-gray-500'
    }

    const getStatusLabel = (status: string) => {
        const option = statusOptions.find(s => s.value === status)
        return option?.label || 'To Do'
    }

    const selectPriority = (priority: string) => {
        if (mode.value === 'view') {
            handlePriorityChange(priority)
        } else {
            taskForm.value.priority = priority as any
        }
        showPriorityDropdown.value = false
    }

    const selectStatus = (status: string) => {
        if (mode.value === 'view') {
            handleStatusChange(status)
        } else {
            taskForm.value.status = status as any
        }
        showStatusDropdown.value = false
    }

    const formatDateTime = (dateTimeValue: string) => {
        if (!dateTimeValue) return ''

        try {
            const date = new Date(dateTimeValue)

            // Check if date is valid
            if (isNaN(date.getTime())) return ''

            // Format as "Dec 25, 2024 at 2:30 PM"
            const dateOptions: Intl.DateTimeFormatOptions = {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }

            const timeOptions: Intl.DateTimeFormatOptions = {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }

            const dateStr = date.toLocaleDateString('en-US', dateOptions)
            const timeStr = date.toLocaleTimeString('en-US', timeOptions)

            return `${dateStr} at ${timeStr}`
        } catch (error) {
            console.error('Error formatting date:', error)
            return ''
        }
    }

    // Methods
    const openModal = async (taskId?: string, modalMode: 'create' | 'edit' | 'view' = 'create') => {
        showModal.value = true
        mode.value = modalMode

        await loadCategories()

        if (taskId && modalMode !== 'create') {
            await loadTask(taskId)
        } else {
            resetForm()
        }

        clearMessages()
    }

    const closeModal = () => {
        showModal.value = false
        resetForm()
        clearMessages()
        showDeleteConfirm.value = false
        showStatusDropdown.value = false
        showPriorityDropdown.value = false
        showDatePicker.value = false
        currentTask.value = null
    }

    const loadTask = async (taskId: string) => {
        try {
            isLoading.value = true
            const response = await taskService.getTaskById(taskId)

            if (response.success && response.data) {
                currentTask.value = response.data
                populateForm(response.data)
            }
        } catch (error) {
            console.error('Failed to load task:', error)
            errorMessage.value = 'Failed to load task details'
        } finally {
            isLoading.value = false
        }
    }

    const loadCategories = async () => {
        try {
            const response = await categoryService.getAllCategories()

            if (response.success && response.data) {
                availableCategories.value = response.data
            }
        } catch (error) {
            console.error('Failed to load categories:', error)
        }
    }

    const populateForm = (task: Task) => {
        taskForm.value = {
            title: task.title,
            content: task.content || '',
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
            categoryIds: task.categories?.map(cat => cat.id) || [],
            isFavorite: task.isFavorite,
        }

        selectedCategories.value = task.categories || []
    }

    const validateForm = () => {
        formErrors.value = {}

        if (!taskForm.value.title.trim()) {
            formErrors.value.title = 'Task title is required'
        } else if (taskForm.value.title.length < 3) {
            formErrors.value.title = 'Task title must be at least 3 characters'
        } else if (taskForm.value.title.length > 200) {
            formErrors.value.title = 'Task title must be less than 200 characters'
        }

        if (taskForm.value.content && taskForm.value.content.length > 1000) {
            formErrors.value.content = 'Description must be less than 1000 characters'
        }

        if (taskForm.value.dueDate) {
            const dueDate = new Date(taskForm.value.dueDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (dueDate < today) {
                formErrors.value.dueDate = 'Due date cannot be in the past'
            }
        }

        return Object.keys(formErrors.value).length === 0
    }

    watch(taskForm, () => {
        if (Object.keys(formErrors.value).length > 0) {
            validateForm()
        }
    }, { deep: true })

    const handleCreateTask = async () => {
        if (!validateForm()) return

        try {
            isLoading.value = true
            clearMessages()

            const taskData: TaskRequest = {
                ...taskForm.value,
                dueDate: taskForm.value.dueDate
            }

            const response = await taskService.createTask(taskData)

            if (response.success && response.data) {
                successMessage.value = 'Task created successfully!'

                setTimeout(() => {
                    closeModal()
                }, 1500)
            }
        } catch (error) {
            console.error('Task creation failed:', error)
            errorMessage.value = 'Failed to create task. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const handleUpdateTask = async () => {
        if (!currentTask.value || !validateForm()) return

        try {
            isLoading.value = true
            clearMessages()

            const taskData: Partial<TaskRequest> = {
                ...taskForm.value,
                dueDate: taskForm.value.dueDate || undefined
            }

            const response = await taskService.updateTask(currentTask.value.id, taskData)

            if (response.success && response.data) {
                currentTask.value = response.data
                successMessage.value = 'Task updated successfully!'

                setTimeout(() => {
                    closeModal()
                }, 1500)
            }
        } catch (error) {
            console.error('Task update failed:', error)
            errorMessage.value = 'Failed to update task. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const handleDeleteTaskById = async (taskId: string) => {
        try {
            await taskService.deleteTask(taskId)
            return { success: true }
        } catch (error) {
            console.error('Task deletion failed:', error)
            throw error
        }
    }
    
    const handleDeleteTask = async () => {
        if (!currentTask.value) return

        try {
            isLoading.value = true
            clearMessages()

            const result = await handleDeleteTaskById(currentTask.value.id)

            if (result.success) {
                successMessage.value = 'Task deleted successfully!'
                setTimeout(() => {
                    closeModal()
                }, 1500)
            }
        } catch (error) {
            errorMessage.value = 'Failed to delete task. Please try again.'
        } finally {
            isLoading.value = false
        }
    }


    const handleStatusChange = async (newStatus: string) => {
        if (!currentTask.value || isReadOnly.value) return

        try {
            isLoading.value = true
            const response = await taskService.changeStatus(currentTask.value.id, newStatus)

            if (response.success && response.data) {
                currentTask.value = response.data
                taskForm.value.status = newStatus as any
                successMessage.value = 'Task status updated!'
            }
        } catch (error) {
            console.error('Status change failed:', error)
            errorMessage.value = 'Failed to update task status'
        } finally {
            isLoading.value = false
        }
    }

    const handlePriorityChange = async (newPriority: string) => {
        if (!currentTask.value || isReadOnly.value) return

        try {
            isLoading.value = true
            const response = await taskService.changePriority(currentTask.value.id, newPriority)

            if (response.success && response.data) {
                currentTask.value = response.data
                taskForm.value.priority = newPriority as any
                successMessage.value = 'Task priority updated!'
            }
        } catch (error) {
            console.error('Priority change failed:', error)
            errorMessage.value = 'Failed to update task priority'
        } finally {
            isLoading.value = false
        }
    }

    const handleToggleFavorite = async (taskId: string) => {
        try {
            isLoading.value = true
            clearMessages()

            const response = await taskService.toggleFavorite(taskId)

            if (response.success && response.data) {
                const updatedTask = response.data as Task
                successMessage.value = updatedTask.isFavorite
                    ? 'Task marked as favorite!'
                    : 'Task removed from favorites!'

                return updatedTask
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error)
            errorMessage.value = 'Failed to update favorite status'
        } finally {
            isLoading.value = false
        }
    }

    const toggleCategory = (category: Category) => {
        if (isReadOnly.value) return

        const index = selectedCategories.value.findIndex(cat => cat.id === category.id)

        if (index > -1) {
            selectedCategories.value.splice(index, 1)
        } else {
            selectedCategories.value.push(category)
        }

        taskForm.value.categoryIds = selectedCategories.value.map(cat => cat.id)
    }

    const isCategorySelected = (category: Category) => {
        return selectedCategories.value.some(cat => cat.id === category.id)
    }

    const switchToEditMode = () => {
        if (currentTask.value) {
            mode.value = 'edit'
            populateForm(currentTask.value)
        }
    }

    const resetForm = () => {
        taskForm.value = {
            title: '',
            content: '',
            priority: 'MEDIUM',
            status: 'PENDING',
            dueDate: '',
            categoryIds: [],
            isFavorite: false
        }
        formErrors.value = {}
        selectedCategories.value = []
    }

    const clearMessages = () => {
        successMessage.value = ''
        errorMessage.value = ''
    }

    // Watch for category changes to update categoryIds
    watch(selectedCategories, (newCategories) => {
        taskForm.value.categoryIds = newCategories.map(cat => cat.id)
    }, { deep: true })

    return {
        // State
        showModal,
        mode,
        isLoading,
        successMessage,
        errorMessage,
        currentTask,
        availableCategories,
        showDeleteConfirm,
        showStatusDropdown,
        showPriorityDropdown,
        showDatePicker,

        // Form
        taskForm,
        formErrors,
        selectedCategories,

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
        loadTask,
        loadCategories,
        validateForm,
        handleCreateTask,
        handleUpdateTask,
        handleDeleteTask,
        handleStatusChange,
        handlePriorityChange,
        handleToggleFavorite,
        toggleCategory,
        isCategorySelected,
        handleDeleteTaskById,
        switchToEditMode,
        resetForm,
        clearMessages
    }
}