import { ref, computed, watch } from 'vue'
import { useAuthStore } from "../store/authStore.ts"
import { userService } from "../services/userService.ts"
import type { UpdateProfileData, ChangePasswordData, User } from "../types"

export function useProfileView() {
    const authStore = useAuthStore()

    const showModal = ref(false)
    const activeTab = ref<'profile' | 'password' | 'danger'>('profile')
    const isLoading = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    const profileForm = ref<UpdateProfileData>({
        username: '',
        email: ''
    })

    const passwordForm = ref<ChangePasswordData & { confirmNewPassword: string }>({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    })

    const profileErrors = ref<Partial<Record<keyof UpdateProfileData, string>>>({})
    const passwordErrors = ref<Partial<Record<keyof typeof passwordForm.value, string>>>({})

    const showCurrentPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)

    const showDeactivateConfirm = ref(false)
    const showDeleteConfirm = ref(false)
    const deactivateConfirmText = ref('')
    const deleteConfirmText = ref('')

    const currentUser = ref<User | null>(null)

    const isProfileFormValid = computed(() => {
        return profileForm.value.username &&
            profileForm.value.email &&
            Object.keys(profileErrors.value).length === 0
    })

    const isPasswordFormValid = computed(() => {
        return passwordForm.value.oldPassword &&
            passwordForm.value.newPassword &&
            passwordForm.value.confirmNewPassword &&
            Object.keys(passwordErrors.value).length === 0
    })

    const passwordStrength = computed(() => {
        const password = passwordForm.value.newPassword
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

    const canDeactivate = computed(() => {
        return deactivateConfirmText.value === 'DEACTIVATE'
    })

    const canDelete = computed(() => {
        return deleteConfirmText.value === 'DELETE'
    })

    const openModal = async () => {
        showModal.value = true
        activeTab.value = 'profile'
        await loadCurrentUser()
        clearMessages()
    }

    const closeModal = () => {
        showModal.value = false
        resetForms()
        clearMessages()
        showDeactivateConfirm.value = false
        showDeleteConfirm.value = false
        deactivateConfirmText.value = ''
        deleteConfirmText.value = ''
    }

    const setActiveTab = (tab: 'profile' | 'password' | 'danger') => {
        activeTab.value = tab
        clearMessages()
    }

    const loadCurrentUser = async () => {
        try {
            isLoading.value = true
            const response = await userService.getCurrentUser()

            if (response.success && response.data) {
                currentUser.value = response.data
                // Populate profile form with current data
                profileForm.value = {
                    username: response.data.username,
                    email: response.data.email
                }
            }
        } catch (error) {
            console.error('Failed to load user data:', error)
            errorMessage.value = 'Failed to load user data'
        } finally {
            isLoading.value = false
        }
    }

    const validateProfileForm = () => {
        profileErrors.value = {}

        if (!profileForm.value.username) {
            profileErrors.value.username = 'Username is required'
        } else if (profileForm.value.username.length < 3) {
            profileErrors.value.username = 'Username must be at least 3 characters'
        } else if (profileForm.value.username.length > 20) {
            profileErrors.value.username = 'Username must be less than 20 characters'
        } else if (!/^[a-zA-Z0-9_]+$/.test(profileForm.value.username)) {
            profileErrors.value.username = 'Username can only contain letters, numbers, and underscores'
        }

        if (!profileForm.value.email) {
            profileErrors.value.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
            profileErrors.value.email = 'Please enter a valid email address'
        }

        return Object.keys(profileErrors.value).length === 0
    }

    const validatePasswordForm = () => {
        passwordErrors.value = {}

        if (!passwordForm.value.oldPassword) {
            passwordErrors.value.oldPassword = 'Current password is required'
        }

        if (!passwordForm.value.newPassword) {
            passwordErrors.value.newPassword = 'New password is required'
        } else if (passwordForm.value.newPassword.length < 8) {
            passwordErrors.value.newPassword = 'Password must be at least 8 characters'
        } else if (passwordStrength.value < 2) {
            passwordErrors.value.newPassword = 'Password is too weak. Include uppercase, lowercase, numbers, and symbols'
        }

        if (!passwordForm.value.confirmNewPassword) {
            passwordErrors.value.confirmNewPassword = 'Please confirm your new password'
        } else if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
            passwordErrors.value.confirmNewPassword = 'Passwords do not match'
        }

        return Object.keys(passwordErrors.value).length === 0
    }

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

    const handleUpdateProfile = async () => {
        if (!validateProfileForm()) return

        try {
            isLoading.value = true
            clearMessages()

            const response = await userService.updateProfile(profileForm.value)

            if (response.success && response.data) {
                currentUser.value = response.data
                if (authStore.user) {
                    authStore.user = response.data
                }
                successMessage.value = 'Profile updated successfully!'
            }
        } catch (error) {
            console.error('Profile update failed:', error)
            errorMessage.value = 'Failed to update profile. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return

        try {
            isLoading.value = true
            clearMessages()

            const passwordData: ChangePasswordData = {
                oldPassword: passwordForm.value.oldPassword,
                newPassword: passwordForm.value.newPassword
            }

            await userService.changePassword(passwordData)

            successMessage.value = 'Password changed successfully!'

            passwordForm.value = {
                oldPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }

        } catch (error) {
            console.error('Password change failed:', error)
            errorMessage.value = 'Failed to change password. Please check your current password and try again.'
        } finally {
            isLoading.value = false
        }
    }

    const handleDeactivateAccount = async () => {
        if (!canDeactivate.value) return

        try {
            isLoading.value = true
            clearMessages()

            await userService.deactivateCurrentUser()

            successMessage.value = 'Account deactivated successfully. Logging out...'

            setTimeout(() => {
                showModal.value = false
            }, 500)

            setTimeout(async () => {
                await authStore.logout('/login')
            }, 2000)

        } catch (error) {
            console.error('Account deactivation failed:', error)
            errorMessage.value = 'Failed to deactivate account. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const handleDeleteAccount = async () => {
        if (!canDelete.value) return

        try {
            isLoading.value = true
            clearMessages()

            await userService.deleteCurrentUser()

            successMessage.value = 'Account deleted successfully. Logging out...'

            setTimeout(() => {
                showModal.value = false
            }, 500)

            setTimeout(async () => {
                await authStore.logout('/login')
            }, 2000)

        } catch (error) {
            console.error('Account deletion failed:', error)
            errorMessage.value = 'Failed to delete account. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const handleLogout = async () => {
        try {
            isLoading.value = true
            await authStore.logout('/login')
            showModal.value = false
        } catch (error) {
            console.error('Logout failed:', error)
            errorMessage.value = 'Failed to log out. Please try again.'
        } finally {
            isLoading.value = false
        }
    }

    const resetForms = () => {
        profileForm.value = {
            username: '',
            email: ''
        }
        passwordForm.value = {
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        }
        profileErrors.value = {}
        passwordErrors.value = {}
    }

    const clearMessages = () => {
        successMessage.value = ''
        errorMessage.value = ''
    }

    watch(() => profileForm.value, () => {
        if (Object.keys(profileErrors.value).length > 0) {
            validateProfileForm()
        }
    }, { deep: true })

    watch(() => passwordForm.value, () => {
        if (Object.keys(passwordErrors.value).length > 0) {
            validatePasswordForm()
        }
    }, { deep: true })

    return {
        showModal,
        activeTab,
        isLoading,
        successMessage,
        errorMessage,
        currentUser,

        profileForm,
        passwordForm,
        profileErrors,
        passwordErrors,

        showCurrentPassword,
        showNewPassword,
        showConfirmPassword,

        showDeactivateConfirm,
        showDeleteConfirm,
        deactivateConfirmText,
        deleteConfirmText,

        isProfileFormValid,
        isPasswordFormValid,
        passwordStrength,
        passwordStrengthText,
        canDeactivate,
        canDelete,

        openModal,
        closeModal,
        setActiveTab,
        loadCurrentUser,
        validateProfileForm,
        validatePasswordForm,
        getPasswordStrengthClass,
        handleUpdateProfile,
        handleChangePassword,
        handleDeactivateAccount,
        handleDeleteAccount,
        handleLogout,
        clearMessages
    }
}