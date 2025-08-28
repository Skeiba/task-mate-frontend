import { defineStore } from "pinia";
import type { User } from "../types";
import { authService } from "../services/authService";
import router from "../router";

export const useAuthStore = defineStore("authStore", {
    state: () => ({
        user: null as User | null,
        isLoading: false,
        error: null as string | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
    },

    actions: {
        async getCurrentUser() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await authService.getCurrentUser();
                this.user = response.data;
            } catch {
                this.user = null;
            } finally {
                this.isLoading = false;
            }
        },

        async login(email: string, password: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await authService.login({ email, password });
                this.user = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message ?? "Login failed";
                this.user = null;
            } finally {
                this.isLoading = false;
            }
        },

        async logout(redirectPath?: string) {
            this.isLoading = true;
            this.error = null;
            try {
                await authService.logout();
                this.user = null;

                if (redirectPath) {
                    router.replace({ path: redirectPath });
                }
            } catch (err: any) {
                console.error('Logout error:', err);
                this.user = null;
            } finally {
                this.isLoading = false;
            }
        },

        async register(username: string, email: string, password: string) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await authService.register({ username, email, password });
                this.user = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message ?? "Registration failed";
                this.user = null;
            } finally {
                this.isLoading = false;
            }
        },

        async forgotPassword(email: string) {
            this.isLoading = true;
            this.error = null;
            try {
                await authService.forgotPassword({ email });
            } catch (err: any) {
                this.error = err.response?.data?.message ?? "Request failed";
            } finally {
                this.isLoading = false;
            }
        },

        async resetPassword(token: string, newPassword: string) {
            this.isLoading = true;
            this.error = null;
            try {
                await authService.resetPassword({ token, newPassword });
            } catch (err: any) {
                this.error = err.response?.data?.message ?? "Reset failed";
            } finally {
                this.isLoading = false;
            }
        },
    },
});
