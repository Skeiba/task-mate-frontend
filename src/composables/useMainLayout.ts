import { ref, computed, onMounted } from "vue"
import {useAuthStore} from "../store/authStore.ts";

export function useMainLayout() {
    const authStore = useAuthStore()

    const activeTab = ref("today")
    const activeTabData = ref<any>(null)
    const selectedItem = ref<any>(null)
    const showUserMenu = ref(false)
    const viewMode = ref<"list" | "grid">("list")

    const todayTasksCount = ref(5)
    const categories = ref([
        { id: 1, name: "Work", color: "#3B82F6", taskCount: 8 },
        { id: 2, name: "Personal", color: "#10B981", taskCount: 3 },
        { id: 3, name: "Shopping", color: "#F59E0B", taskCount: 2 },
        { id: 4, name: "Health", color: "#EF4444", taskCount: 1 }
    ])

    const user = computed(() => authStore.user)
    const isAdmin = computed(() => user.value?.role === "ADMIN" )

    const userInitials = computed(() => {
        if (!user.value?.username) return "U"
        return user.value.username
            .split(" ")
            .map((n) => n.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2)
    })

    const activeTabTitle = computed(() => {
        switch (activeTab.value) {
            case "search": return "Search Tasks"
            case "today": return "Today's Tasks"
            case "favorites": return "Favorite Tasks"
            case "category": return activeTabData.value?.name || "Category"
            case "users": return "User Management"
            default: return "Tasks"
        }
    })

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
            : "text-gray-700 hover:bg-gray-50"
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

        document.addEventListener("click", (e) => {
            if (!(e.target as HTMLElement)?.closest(".user-menu")) {
                showUserMenu.value = false
            }
        })
    })

    return {
        activeTab,
        activeTabData,
        selectedItem,
        showUserMenu,
        viewMode,
        todayTasksCount,
        categories,

        user,
        isAdmin,
        userInitials,
        activeTabTitle,

        setActiveTab,
        getTabClass,
        toggleUserMenu,
        handleLogout,
        clearSelection
    }
}
