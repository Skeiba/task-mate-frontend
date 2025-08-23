import { computed, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import type {User} from '../types'

export interface AuthGuardOptions {
    requiredRole?: User['role']
    redirectTo?: string
    unauthorizedRedirect?: string
    immediate?: boolean
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
    const {
        requiredRole,
        redirectTo = '/login',
        unauthorizedRedirect = '/unauthorized',
        immediate = true
    } = options

    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    // Computed properties
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const isLoading = computed(() => authStore.isLoading)

    const hasRequiredRole = computed(() => {
        if (!requiredRole) return true
        return authStore.user?.role === requiredRole
    })

    const isAuthorized = computed(() => {
        return isAuthenticated.value && hasRequiredRole.value
    })

    const canAccess = computed(() => {
        if (isLoading.value) return null // Still checking
        return isAuthenticated.value && hasRequiredRole.value
    })

    // Methods
    const checkAuth = async (): Promise<boolean> => {
        // Ensure user data is loaded
        if (!authStore.user && !authStore.isLoading) {
            await authStore.getCurrentUser()
        }

        // Wait for loading to complete
        if (authStore.isLoading) {
            return new Promise((resolve) => {
                const unwatch = watchEffect(() => {
                    if (!authStore.isLoading) {
                        unwatch()
                        resolve(checkAuthSync())
                    }
                })
            })
        }

        return checkAuthSync()
    }

    const checkAuthSync = (): boolean => {
        if (!isAuthenticated.value) {
            redirectToLogin()
            return false
        }

        if (requiredRole && !hasRequiredRole.value) {
            redirectToUnauthorized()
            return false
        }

        return true
    }

    const redirectToLogin = () => {
        router.replace({
            path: redirectTo,
            query: { redirect: route.fullPath }
        })
    }

    const redirectToUnauthorized = () => {
        router.replace({ path: unauthorizedRedirect })
    }

    const requireAuth = async (): Promise<boolean> => {
        return await checkAuth()
    }

    const requireRole = async (role: User['role']): Promise<boolean> => {
        const isAuth = await checkAuth()
        if (!isAuth) return false

        if (authStore.user?.role !== role) {
            redirectToUnauthorized()
            return false
        }

        return true
    }

    // Auto-check on route changes if immediate is true
    if (immediate) {
        watchEffect(async () => {
            if (!isLoading.value) {
                await checkAuth()
            }
        })
    }

    return {
        // State
        isAuthenticated,
        isLoading,
        hasRequiredRole,
        isAuthorized,
        canAccess,
        user: computed(() => authStore.user),

        // Methods
        checkAuth,
        checkAuthSync,
        requireAuth,
        requireRole,
        redirectToLogin,
        redirectToUnauthorized
    }
}