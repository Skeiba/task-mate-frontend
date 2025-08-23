import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {useAuthStore} from "../store/authStore.ts";
import type {RegisterData} from "../types";

export function useRegisterView() {
    const router = useRouter()
    const authStore = useAuthStore()

    const form = ref<RegisterData & { confirmPassword: string; agreeToTerms: boolean }>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    })

    const errors = ref<Partial<Record<keyof typeof form.value, string>>>({})
    const showPassword = ref(false)
    const successMessage = ref('')

    const isFormValid = computed(() => {
        return form.value.username &&
            form.value.email &&
            form.value.password &&
            form.value.confirmPassword &&
            form.value.agreeToTerms &&
            Object.keys(errors.value).length === 0
    })

    const passwordStrength = computed(() => {
        const password = form.value.password
        if (!password) return 0

        let strength = 0
        if (password.length >= 8) strength++
        if (/[a-z]/.test(password)) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++

        return Math.min(strength, 4)
    })

    const passwordStrengthText = computed(() => {
        const strength = passwordStrength.value
        const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
        return texts[strength] || ''
    })

    const getPasswordStrengthClass = (index: number) => {
        const strength = passwordStrength.value
        if (index <= strength) {
            if (strength <= 1) return 'bg-red-400'
            if (strength === 2) return 'bg-yellow-400'
            if (strength === 3) return 'bg-blue-400'
            return 'bg-green-400'
        }
        return 'bg-gray-200'
    }

    const validateForm = () => {
        errors.value = {}

        if (!form.value.username) {
            errors.value.username = 'Username is required'
        } else if (form.value.username.length < 3) {
            errors.value.username = 'Username must be at least 3 characters'
        } else if (form.value.username.length > 20) {
            errors.value.username = 'Username must be less than 20 characters'
        } else if (!/^[a-zA-Z0-9_]+$/.test(form.value.username)) {
            errors.value.username = 'Username can only contain letters, numbers, and underscores'
        }

        if (!form.value.email) {
            errors.value.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
            errors.value.email = 'Please enter a valid email address'
        }

        if (!form.value.password) {
            errors.value.password = 'Password is required'
        } else if (form.value.password.length < 8) {
            errors.value.password = 'Password must be at least 8 characters'
        } else if (passwordStrength.value < 2) {
            errors.value.password = 'Password is too weak. Include uppercase, lowercase, numbers, and symbols'
        }

        if (!form.value.confirmPassword) {
            errors.value.confirmPassword = 'Please confirm your password'
        } else if (form.value.password !== form.value.confirmPassword) {
            errors.value.confirmPassword = 'Passwords do not match'
        }

        if (!form.value.agreeToTerms) {
            errors.value.agreeToTerms = 'You must agree to the terms and conditions'
        }

        return Object.keys(errors.value).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            await authStore.register(
                form.value.username,
                form.value.email,
                form.value.password
            )

            successMessage.value = 'Account created successfully! Redirecting to dashboard...'

            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)

        } catch (error) {
            console.error('Registration failed:', error)
        }
    }

    onMounted(() => {
        const usernameInput = document.getElementById('username')
        if (usernameInput) {
            usernameInput.focus()
        }
    })
    return {
        authStore,
        form,
        errors,
        showPassword,
        successMessage,

        isFormValid,
        passwordStrength,
        passwordStrengthText,

        getPasswordStrengthClass,
        validateForm,
        handleSubmit,
    }

}