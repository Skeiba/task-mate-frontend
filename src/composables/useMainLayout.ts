import { ref, computed, onMounted } from "vue"
import { useAuthStore } from "../store/authStore.ts"
import { categoryService } from "../services/categoryService.ts"
import { taskService } from "../services/taskService.ts"
import type { Category, Task } from "../types"
import {useTaskView} from "./useTaskView.ts";


export function useMainLayout() {
    const authStore = useAuthStore()

    const activeTab = ref("today")
    const activeTabData = ref<any>(null)
    const selectedItem = ref<any>(null)
    const showUserMenu = ref(false)
    const viewMode = ref<"list" | "grid">("list")

    // Real data states
    const categories = ref<Category[]>([])
    const allTasks = ref<Task[]>([])
    const todayTasks = ref<Task[]>([])
    const favoriteTasks = ref<Task[]>([])
    const isLoadingCategories = ref(false)
    const isLoadingTasks = ref(false)
    const categoriesError = ref('')
    const tasksError = ref('')

    const { handleToggleFavorite } = useTaskView()

    const user = computed(() => authStore.user)
    const isAdmin = computed(() => user.value?.role === "ADMIN")

    const userInitials = computed(() => {
        if (!user.value?.username) return "U"
        return user.value.username
            .split(" ")
            .map((n) => n.charAt(0))
            .join("")
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
        switch (activeTab.value) {
            case "search": return "Search Tasks"
            case "today": return "Today's Tasks"
            case "all": return "All Tasks"
            case "favorites": return "Favorite Tasks"
            case "category": return activeTabData.value?.name || "Category"
            case "users": return "User Management"
            default: return "Tasks"
        }
    })

    const currentTasks = computed(() => {
        switch (activeTab.value) {
            case "today":
                return todayTasks.value
            case "favorites":
                return favoriteTasks.value
            case "category":
                if (!activeTabData.value) return []
                return allTasks.value.filter(task =>
                    task.categories?.some(cat => cat.id === activeTabData.value.id)
                )
            case "all": // Added support for all tasks view
                return allTasks.value
            default:
                return []
        }
    })

    // Methods
    const loadCategories = async () => {
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

    const loadAllTasks = async (page: number = 0, size: number = 50) => {
        try {
            isLoadingTasks.value = true
            tasksError.value = ''

            const response = await taskService.getAllTasks(page, size)

            if (response.success && response.data?.content) {
                allTasks.value = response.data.content

                // Update other task arrays as well
                const today = new Date()
                const startOfDay = new Date(today.setHours(0, 0, 0, 0))
                const endOfDay = new Date(today.setHours(23, 59, 59, 999))

                // Filter today's tasks
                todayTasks.value = response.data.content.filter(task => {
                    if (!task.dueDate) return false
                    const taskDate = new Date(task.dueDate)
                    return taskDate >= startOfDay && taskDate <= endOfDay
                })

                // Filter favorite tasks
                favoriteTasks.value = response.data.content.filter(task =>
                    task.isFavorite
                )
            }
        } catch (error) {
            console.error('Failed to load all tasks:', error)
            tasksError.value = 'Failed to load tasks'
        } finally {
            isLoadingTasks.value = false
        }
    }

    const loadTodayTasks = async () => {
        try {
            isLoadingTasks.value = true
            tasksError.value = ''

            // Get today's date range
            const today = new Date()
            const startOfDay = new Date(today.setHours(0, 0, 0, 0))
            const endOfDay = new Date(today.setHours(23, 59, 59, 999))

            const response = await taskService.getAllTasks(0, 20)

            if (response.success && response.data?.content) {
                todayTasks.value = response.data.content.filter(task => {
                    if (!task.dueDate) return false
                    const taskDate = new Date(task.dueDate)
                    return taskDate >= startOfDay && taskDate <= endOfDay
                })
                favoriteTasks.value = response.data.content.filter(task =>
                    task.isFavorite
                )
            }
        } catch (error) {
            console.error('Failed to load tasks:', error)
            tasksError.value = 'Failed to load tasks'
        } finally {
            isLoadingTasks.value = false
        }
    }

    const refreshData = async () => {
        await Promise.all([
            loadCategories(),
            loadAllTasks()
        ])
    }

    const onMarkAsDone = async (taskId: string) => {
        try {
            const response = await taskService.changeStatus(taskId, 'DONE')
            if (response.success && response.data) {
                await refreshData()
            }
        } catch (error) {
            console.error('Failed to mark task as done:', error)
        }
    }

    const updateTaskInArrays = (updatedTask: Task) => {
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
            // Add to favorites if not already there
            favoriteTasks.value.push(updatedTask)
        } else if (!updatedTask.isFavorite && favIndex !== -1) {
            // Remove from favorites if it's there but no longer favorite
            favoriteTasks.value.splice(favIndex, 1)
        } else if (favIndex !== -1) {
            // Update existing favorite
            favoriteTasks.value[favIndex] = updatedTask
        }
    }

    const onToggleFavorite = async (taskId: string) => {
        console.log('Before toggle, favoriteTasks:', favoriteTasks.value.length)
        const updatedTask = await handleToggleFavorite(taskId)
        console.log('Updated task:', updatedTask)
        if (updatedTask) {
            updateTaskInArrays(updatedTask)
            console.log('After update, favoriteTasks:', favoriteTasks.value.length)
            console.log('Favorite tasks:', favoriteTasks.value.map(t => ({ id: t.id, title: t.title, isFavorite: t.isFavorite })))
        }
    }

    const refreshTasks = async (taskType: 'all' | 'today' | 'favorites' = 'all') => {
        switch (taskType) {
            case 'all':
                await loadAllTasks()
                break
            case 'today':
                await loadTodayTasks()
                break
            case 'favorites':
                // Favorites are updated when loading all tasks or today tasks
                await loadAllTasks()
                break
        }
    }

    const setActiveTab = (tab: string, data: any = null) => {
        activeTab.value = tab
        activeTabData.value = data
        selectedItem.value = null
    }

    const getTabClass = (tab: string, itemId?: string | number) => {
        const isActive = activeTab.value === tab &&
            (itemId === null || activeTabData.value?.id === itemId)

        return isActive
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "text-secondary hover-theme"
    }

    const toggleUserMenu = () => {
        showUserMenu.value = !showUserMenu.value
    }

    const handleLogout = async () => {
        await authStore.logout()
    }

    const clearSelection = () => {
        selectedItem.value = null
    }

    onMounted(() => {
        setActiveTab("today")
        refreshData()

        document.addEventListener("click", (e) => {
            if (!(e.target as HTMLElement)?.closest(".user-menu")) {
                showUserMenu.value = false
            }
        })
    })

    return {
        // State
        activeTab,
        activeTabData,
        selectedItem,
        showUserMenu,
        viewMode,

        // Data
        categories: categoriesWithTaskCount,
        allTasks, // Added allTasks to the return
        todayTasks,
        favoriteTasks,
        currentTasks,
        todayTasksCount,

        // Loading states
        isLoadingCategories,
        isLoadingTasks,
        categoriesError,
        tasksError,

        // User data
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
        loadAllTasks, // Added loadAllTasks to the return
        loadTodayTasks,
        onMarkAsDone,
        onToggleFavorite,
        refreshTasks, // Added new method for specific task refreshing
    }
}