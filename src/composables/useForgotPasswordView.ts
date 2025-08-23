import {useRoute, useRouter} from "vue-router";
import {useAuthStore} from "../store/authStore.ts";
import {computed, onMounted, ref} from "vue";
import type {ForgotPasswordData} from "../types";

export function useForgotPasswordView(){
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();

    const form = ref<ForgotPasswordData>({email: ''});

    const errors = ref<Partial<Record<keyof ForgotPasswordData, string>>>({})

    const isFormValid = computed(()=>{
        return form.value.email && Object.keys(errors.value).length === 0;
    });

    const validateForm = () => {
        errors.value = {}

        if (!form.value.email) {
            errors.value.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
            errors.value.email = 'Please enter a valid email address'
        }

        return Object.keys(errors.value).length === 0;
    }

    const handleSubmit = async () => {
        if (!validateForm()) return
        try {
            await authStore.forgotPassword(form.value.email);
            const redirectTo = route.query.redirect as string || '/reset-password';
            await router.push(redirectTo);
        } catch (error) {
            console.log(error);
        }
    }

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
        isFormValid,
        handleSubmit,
    }
}