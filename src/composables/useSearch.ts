// composables/useSearch.ts
import {ref, computed, watch, type Ref} from 'vue'
import type { Task } from '../types'

export function useSearch(allTasks: Ref<Task[]>) {
    const searchQuery = ref('')
    const searchFilters = ref({
        status: 'all', // 'all', 'PENDING', 'DONE', 'MISSED'
        priority: 'all', // 'all', 'LOW', 'MEDIUM', 'HIGH'
        category: 'all', // 'all' or category ID
        dateRange: 'all' // 'all', 'today', 'week', 'month', 'overdue'
    })

    const isSearching = ref(false)

    // Debounced search to avoid too many updates
    let searchTimeout: ReturnType<typeof setTimeout>
    const debouncedSearchQuery = ref('')

    watch(searchQuery, (newQuery) => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            debouncedSearchQuery.value = newQuery
        }, 300)
    })

    const filteredTasks = computed(() => {
        if (!debouncedSearchQuery.value && areFiltersDefault.value) {
            return allTasks.value
        }

        return allTasks.value.filter(task => {
            // Text search in title and content
            const matchesText = !debouncedSearchQuery.value ||
                task.title.toLowerCase().includes(debouncedSearchQuery.value.toLowerCase()) ||
                (task.content && task.content.toLowerCase().includes(debouncedSearchQuery.value.toLowerCase()))

            // Status filter
            const matchesStatus = searchFilters.value.status === 'all' ||
                task.status === searchFilters.value.status

            // Priority filter
            const matchesPriority = searchFilters.value.priority === 'all' ||
                task.priority === searchFilters.value.priority

            // Category filter - check if task has the selected category
            const matchesCategory = searchFilters.value.category === 'all' ||
                task.categories.some(cat => cat.id === searchFilters.value.category)

            // Date range filter
            const matchesDateRange = checkDateRange(task)

            return matchesText && matchesStatus && matchesPriority && matchesCategory && matchesDateRange
        })
    })

    const areFiltersDefault = computed(() => {
        return searchFilters.value.status === 'all' &&
            searchFilters.value.priority === 'all' &&
            searchFilters.value.category === 'all' &&
            searchFilters.value.dateRange === 'all'
    })

    const activeFiltersCount = computed(() => {
        let count = 0
        if (searchFilters.value.status !== 'all') count++
        if (searchFilters.value.priority !== 'all') count++
        if (searchFilters.value.category !== 'all') count++
        if (searchFilters.value.dateRange !== 'all') count++
        return count
    })

    function checkDateRange(task: Task): boolean {
        if (searchFilters.value.dateRange === 'all') return true

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const taskDate = new Date(task.dueDate)
        const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())

        switch (searchFilters.value.dateRange) {
            case 'today':
                return taskDateOnly.getTime() === today.getTime()

            case 'week':
                const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                return taskDate >= today && taskDate <= weekFromNow

            case 'month':
                const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
                return taskDate >= today && taskDate <= monthFromNow

            case 'overdue':
                return taskDate < today && task.status !== 'DONE'

            default:
                return true
        }
    }

    function clearSearch() {
        searchQuery.value = ''
        debouncedSearchQuery.value = ''
        resetFilters()
    }

    function resetFilters() {
        searchFilters.value = {
            status: 'all',
            priority: 'all',
            category: 'all',
            dateRange: 'all'
        }
    }

    function updateFilter(filterType: keyof typeof searchFilters.value, value: string) {
        searchFilters.value[filterType] = value
    }

    return {
        searchQuery,
        searchFilters,
        debouncedSearchQuery,
        isSearching,
        filteredTasks,
        areFiltersDefault,
        activeFiltersCount,
        clearSearch,
        resetFilters,
        updateFilter
    }
}