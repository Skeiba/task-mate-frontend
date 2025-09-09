import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
import { categoryService } from '../services/categoryService'
import { taskService } from '../services/taskService'
import type { Category, Task } from '../types'
import { useTaskView } from './useTaskView'

// Constants
const DEFAULT_PAGE_SIZE = 50
const TODAY_TASKS_LIMIT = 20

export function useMainLayout() {
    const authStore = useAuthStore()
    const { handleToggleFavorite } = useTaskView()

    // UI State
    const activeTab = ref('today')
    const activeTabData = ref<any>(null)
    const selectedItem = ref<any>(null)
    const showUserMenu = ref(false)
    const viewMode = ref<'list' | 'grid'>('list')

    // Data State
    const categories = ref<Category[]>([])
    const allTasks = ref<Task[]>([])
    const todayTasks = ref<Task[]>([])
    const favoriteTasks = ref<Task[]>([])

    // Loading States
    const isLoadingCategories = ref(false)
    const isLoadingTasks = ref(false)
    const categoriesError = ref('')
    const tasksError = ref('')

    // Computed Properties
    const user = computed(() => authStore.user)
    const isAdmin = computed(() => user.value?.role === 'ADMIN')

    const userInitials = computed(() => {
        if (!user.value?.username) return 'U'

        return user.value.username
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    })

    const todayTasksCount = computed(() => todayTasks.value.length)

    const categoriesWithTaskCount = computed(() => {
        return categories.value.map(category => ({
            ...category,
            taskCount: allTasks.value.filter(task =>
                task.categories?.some(cat => cat.id === category.id)
            ).length
        }))
    })

    const activeTabTitle = computed(() => {
        const tabTitles: Record<string, string> = {
            search: 'Search Tasks',
            today: "Today's Tasks",
            all: 'All Tasks',
            favorites: 'Favorite Tasks',
            category: activeTabData.value?.name || 'Category',
            users: 'User Management'
        }

        return tabTitles[activeTab.value] || 'Tasks'
    })

    const currentTasks = computed(() => {
        switch (activeTab.value) {
            case 'today':
                return todayTasks.value
            case 'favorites':
                return favoriteTasks.value
            case 'category':
                if (!activeTabData.value) return []
                return allTasks.value.filter(task =>
                    task.categories?.some(cat => cat.id === activeTabData.value.id)
                )
            case 'all':
                return allTasks.value
            default:
                return []
        }
    })

    // Utility Functions
    const getTodayDateRange = () => {
        const today = new Date()
        const startOfDay = new Date(today.setHours(0, 0, 0, 0))
        const endOfDay = new Date(today.setHours(23, 59, 59, 999))
        return { startOfDay, endOfDay }
    }

    const filterTodayTasks = (tasks: Task[]) => {
        const { startOfDay, endOfDay } = getTodayDateRange()

        return tasks.filter(task => {
            if (!task.dueDate) return false
            const taskDate = new Date(task.dueDate)
            return taskDate >= startOfDay && taskDate <= endOfDay
        })
    }

    const filterFavoriteTasks = (tasks: Task[]) => {
        return tasks.filter(task => task.isFavorite)
    }

    // Data Loading Methods
    const loadCategories = async (): Promise<void> => {
        try {
            isLoadingCategories.value = true
            categoriesError.value = ''

            const response = await categoryService.getAllCategories()

            if (response.success && response.data) {
                categories.value = response.data
            }
        } catch (error) {
            console.error('Failed to load categories:', error)
            categoriesError.value = 'Failed to load categories'
        } finally {
            isLoadingCategories.value = false
        }
    }

    const loadAllTasks = async (page: number = 0, size: number = DEFAULT_PAGE_SIZE): Promise<void> => {
        try {
            isLoadingTasks.value = true
            tasksError.value = ''

            const response = await taskService.getAllTasks(page, size)

            if (response.success && response.data?.content) {
                const tasks = response.data.content
                allTasks.value = tasks
                todayTasks.value = filterTodayTasks(tasks)
                favoriteTasks.value = filterFavoriteTasks(tasks)
            }
        } catch (error) {
            console.error('Failed to load all tasks:', error)
            tasksError.value = 'Failed to load tasks'
        } finally {
            isLoadingTasks.value = false
        }
    }

    const loadTodayTasks = async (): Promise<void> => {
        try {
            isLoadingTasks.value = true
            tasksError.value = ''

            const response = await taskService.getAllTasks(0, TODAY_TASKS_LIMIT)

            if (response.success && response.data?.content) {
                const tasks = response.data.content
                todayTasks.value = filterTodayTasks(tasks)
                favoriteTasks.value = filterFavoriteTasks(tasks)
            }
        } catch (error) {
            console.error('Failed to load tasks:', error)
            tasksError.value = 'Failed to load tasks'
        } finally {
            isLoadingTasks.value = false
        }
    }

    // Task Management Methods
    const updateTaskInArrays = (updatedTask: Task): void => {
        // Update in allTasks
        const allIndex = allTasks.value.findIndex(task => task.id === updatedTask.id)
        if (allIndex !== -1) {
            allTasks.value[allIndex] = updatedTask
        }

        // Update in todayTasks
        const todayIndex = todayTasks.value.findIndex(task => task.id === updatedTask.id)
        if (todayIndex !== -1) {
            todayTasks.value[todayIndex] = updatedTask
        }

        // Update favoriteTasks array based on new favorite status
        const favIndex = favoriteTasks.value.findIndex(task => task.id === updatedTask.id)

        if (updatedTask.isFavorite && favIndex === -1) {
            favoriteTasks.value.push(updatedTask)
        } else if (!updatedTask.isFavorite && favIndex !== -1) {
            favoriteTasks.value.splice(favIndex, 1)
        } else if (favIndex !== -1) {
            favoriteTasks.value[favIndex] = updatedTask
        }
    }

    const onMarkAsDone = async (taskId: string): Promise<void> => {
        try {
            const response = await taskService.changeStatus(taskId, 'DONE')
            if (response.success && response.data) {
                await refreshData()
            }
        } catch (error) {
            console.error('Failed to mark task as done:', error)
        }
    }

    const onToggleFavorite = async (taskId: string): Promise<void> => {
        const updatedTask = await handleToggleFavorite(taskId)
        if (updatedTask) {
            updateTaskInArrays(updatedTask)
        }
    }

    // Refresh Methods
    const refreshData = async (): Promise<void> => {
        await Promise.all([
            loadCategories(),
            loadAllTasks()
        ])
    }

    const refreshTasks = async (taskType: 'all' | 'today' | 'favorites' = 'all'): Promise<void> => {
        switch (taskType) {
            case 'all':
                await loadAllTasks()
                break
            case 'today':
                await loadTodayTasks()
                break
            case 'favorites':
                await loadAllTasks()
                break
        }
    }

    // Navigation Methods
    const setActiveTab = (tab: string, data: any = null): void => {
        activeTab.value = tab
        activeTabData.value = data
        selectedItem.value = null
    }

    const getTabClass = (tab: string, itemId?: string | number): string => {
        const isActive = activeTab.value === tab &&
            (itemId === null || activeTabData.value?.id === itemId)

        return isActive
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'text-secondary hover-theme'
    }

    // UI Methods
    const toggleUserMenu = (): void => {
        showUserMenu.value = !showUserMenu.value
    }

    const handleLogout = async (): Promise<void> => {
        await authStore.logout()
    }

    const clearSelection = (): void => {
        selectedItem.value = null
    }

    // Lifecycle
    onMounted(() => {
        setActiveTab('today')
        refreshData()

        document.addEventListener('click', (e) => {
            if (!(e.target as HTMLElement)?.closest('.user-menu')) {
                showUserMenu.value = false
            }
        })
    })

    return {
        // UI State
        activeTab,
        activeTabData,
        selectedItem,
        showUserMenu,
        viewMode,

        // Data
        categories: categoriesWithTaskCount,
        allTasks,
        todayTasks,
        favoriteTasks,
        currentTasks,
        todayTasksCount,

        // Loading States
        isLoadingCategories,
        isLoadingTasks,
        categoriesError,
        tasksError,

        // User Data
        user,
        isAdmin,
        userInitials,
        activeTabTitle,

        // Methods
        setActiveTab,
        getTabClass,
        toggleUserMenu,
        handleLogout,
        clearSelection,
        refreshData,
        loadCategories,
        loadAllTasks,
        loadTodayTasks,
        onMarkAsDone,
        onToggleFavorite,
        refreshTasks
    }
}