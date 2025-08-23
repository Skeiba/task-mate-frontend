import {useRoute, useRouter} from "vue-router";
import {useAuthStore} from "../store/authStore.ts";
import {computed, onMounted, ref} from "vue";
import type {LoginData} from "../types";

export function useLoginView(){
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

// Form state
    const form = ref<LoginData & { rememberMe: boolean }>({
        email: '',
        password: '',
        rememberMe: false
    })

    const errors = ref<Partial<Record<keyof LoginData, string>>>({})
    const showPassword = ref(false)

// Computed properties
    const isFormValid = computed(() => {
        return form.value.email &&
            form.value.password &&
            Object.keys(errors.value).length === 0
    })

// Validation
    const validateForm = () => {
        errors.value = {}

        // Email validation
        if (!form.value.email) {
            errors.value.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
            errors.value.email = 'Please enter a valid email address'
        }

        // Password validation
        if (!form.value.password) {
            errors.value.password = 'Password is required'
        } else if (form.value.password.length < 6) {
            errors.value.password = 'Password must be at least 6 characters'
        }

        return Object.keys(errors.value).length === 0
    }

// Form submission
    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            await authStore.login(form.value.email, form.value.password)

            // Handle successful login
            const redirectTo = route.query.redirect as string || '/dashboard'
            await router.push(redirectTo)
        } catch (error) {
            // Error is handled by the store
            console.error('Login failed:', error)
        }
    }

// Autofocus email field on mount
    onMounted(() => {
        const emailInput = document.getElementById('email')
        if (emailInput) {
            emailInput.focus()
        }
    })

    return{
        authStore,
        form,
        errors,
        showPassword,
        isFormValid,
        handleSubmit,
    }
}