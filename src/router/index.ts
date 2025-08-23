import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Layout
import MainLayout from '../layouts/MainLayout.vue'
import {useAuthStore} from "../store/authStore.ts";
import type {User} from "../types";

// Auth components
const LoginView = () => import('../pages/auth/LoginView.vue')
const RegisterView = () => import('../pages/auth/RegisterView.vue')
const ForgotPasswordView = () => import('../pages/auth/ForgotPasswordView.vue')
const ResetPasswordView = () => import('../pages/auth/ResetPasswordView.vue')

// Main app components
const DashboardView = () => import('../pages/DashboardView.vue')
const TasksView = () => import('../pages/TasksView.vue')
const CategoriesView = () => import('../pages/CategoriesView.vue')
const ProfileView = () => import('../pages/ProfileView.vue')

// Admin components
const AdminUsersView = () => import('../pages/admin/UsersView.vue')
const AdminSettingsView = () => import('../pages/admin/SettingsView.vue')

// Error components
const NotFoundView = () => import('../pages/errors/NotFoundView.vue')
const UnauthorizedView = () => import('../pages/errors/UnauthorizedView.vue')

declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean
        requiredRole?: User['role']
        title?: string
        layout?: string
    }
}

const routes: RouteRecordRaw[] = [
    // Public routes
    { path: '/login', name: 'Login', component: LoginView, meta: { title: 'Login' } },
    { path: '/register', name: 'Register', component: RegisterView, meta: { title: 'Register' } },
    { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPasswordView, meta: { title: 'Forgot Password' } },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPasswordView, props: route => ({token: route.query.token}), meta: { title: 'Reset Password' } },

    // Protected routes with MainLayout
    {
        path: '/',
        component: MainLayout,
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: '/dashboard' },
            { path: 'dashboard', name: 'Dashboard', component: DashboardView, meta: { title: 'Dashboard' } },
            { path: 'tasks', name: 'Tasks', component: TasksView, meta: { title: 'Tasks' } },
            { path: 'categories', name: 'Categories', component: CategoriesView, meta: { title: 'Categories' } },
            { path: 'profile', name: 'Profile', component: ProfileView, meta: { title: 'Profile' } },
        ]
    },

    // Admin routes
    {
        path: '/admin',
        component: MainLayout,
        meta: { requiresAuth: true, requiredRole: 'ADMIN' },
        children: [
            { path: '', redirect: '/admin/users' },
            { path: 'users', name: 'AdminUsers', component: AdminUsersView, meta: { title: 'User Management' } },
            { path: 'settings', name: 'AdminSettings', component: AdminSettingsView, meta: { title: 'System Settings' } },
        ]
    },

    // Error routes
    { path: '/unauthorized', name: 'Unauthorized', component: UnauthorizedView, meta: { title: 'Unauthorized' } },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView, meta: { title: 'Page Not Found' } }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) return savedPosition
        return { top: 0 }
    }
})

// Global navigation guards
router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // Set page title
    if (to.meta.title) {
        document.title = `${to.meta.title} | TaskApp`
    }

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
        if (!authStore.user && !authStore.isLoading) {
            await authStore.getCurrentUser()
        }

        if (!authStore.isAuthenticated) {
            return next({ name: 'Login', query: { redirect: to.fullPath } })
        }

        // Role check
        if (to.meta.requiredRole && authStore.user?.role !== to.meta.requiredRole) {
            return next({ name: 'Unauthorized' })
        }
    }

    // Redirect authenticated users away from auth pages
    if (authStore.isAuthenticated && ['Login', 'Register', 'ForgotPassword'].includes(to.name as string)) {
        return next({ name: 'Dashboard' })
    }

    next()
})

export default router
