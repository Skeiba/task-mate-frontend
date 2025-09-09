import {useRoute, useRouter} from "vue-router";
import { useAuthStore } from "../store/authStore.ts";
import { computed, onMounted, ref } from "vue";
import type { ResetPasswordData } from "../types";

export function useResetPasswordView() {
    const router = useRouter();
    const route = useRoute();
    const tokenFromLink = route.query.token as string || "";
    const authStore = useAuthStore();

    const tokenDigits = ref<string[]>(["", "", "", "", "", ""]);

    const form = ref<ResetPasswordData & { confirmPassword: string }>({
        token: "",
        newPassword: "",
        confirmPassword: "",
    });

    const errors = ref<Partial<Record<keyof typeof form.value, string>>>({});
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    const isFormValid = computed(() => {
        return (
            tokenDigits.value.join("").length === 6 &&
            form.value.newPassword &&
            form.value.confirmPassword &&
            Object.keys(errors.value).length === 0
        );
    });

    const validateForm = () => {
        errors.value = {};

        const token = tokenDigits.value.join("");
        form.value.token = token;

        if (!token) {
            errors.value.token = "Reset code is required";
        } else if (!/^\d{6}$/.test(token)) {
            errors.value.token = "Reset code must be a 6-digit number";
        }

        if (!form.value.newPassword) {
            errors.value.newPassword = "Password is required";
        } else if (form.value.newPassword.length < 8) {
            errors.value.newPassword = "Password must be at least 8 characters";
        }

        if (!form.value.confirmPassword) {
            errors.value.confirmPassword = "Please confirm your password";
        } else if (form.value.newPassword !== form.value.confirmPassword) {
            errors.value.confirmPassword = "Passwords do not match";
        }

        return Object.keys(errors.value).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            await authStore.resetPassword(form.value.token, form.value.newPassword);
            await router.push("/login");
        } catch (error) {
            console.error("Reset password failed:", error);
        }
    };

    const handlePaste = (event: ClipboardEvent) => {
        event.preventDefault();
        const pasteData = event.clipboardData?.getData("text") ?? "";

        if (/^\d{6}$/.test(pasteData)) {
            pasteData.split("").forEach((char, i) => {
                tokenDigits.value[i] = char;
            });

            const lastInput = document.getElementById("token-5") as HTMLInputElement;
            if (lastInput) lastInput.focus();
        }
    };


    const focusNext = (index: number, event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.value && index < tokenDigits.value.length - 1) {
            const nextInput = document.querySelector<HTMLInputElement>(
                `#token-${index + 1}`
            );
            nextInput?.focus();
        }
    };

    onMounted(() => {
        if (tokenFromLink && /^\d{6}$/.test(tokenFromLink)) {
            tokenFromLink.split("").forEach((digit, i) => {
                tokenDigits.value[i] = digit;
            });
            form.value.token = tokenFromLink;

            const passwordInput = document.querySelector<HTMLInputElement>("#password");
            passwordInput?.focus();
        } else {
            const firstInput = document.querySelector<HTMLInputElement>("#token-0");
            firstInput?.focus();
        }
    });


    return {
        authStore,
        form,
        tokenDigits,
        errors,
        isFormValid,
        showPassword,
        showConfirmPassword,
        handleSubmit,
        focusNext,
        handlePaste
    };
}
