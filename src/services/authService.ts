import api from './api';
import type {User, ApiResponse, LoginData, RegisterData, ForgotPasswordData, ResetPasswordData} from '../types';

export const authService = {

    login: async (data: LoginData): Promise<ApiResponse<User>> => {
        const response = await api.post<ApiResponse<User>>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterData): Promise<ApiResponse<User>> => {
        const response = await api.post<ApiResponse<User>>('/auth/register', data);
        return response.data;
    },

    logout: async (): Promise<ApiResponse<null>> => {
        const response = await api.post<ApiResponse<null>>('/auth/logout');
        return response.data;
    },

    forgotPassword: async (data: ForgotPasswordData): Promise<ApiResponse<null>> => {
        const response = await api.post<ApiResponse<null>>('/auth/forgot-password', data);
        return response.data;
    },

    resetPassword: async (data: ResetPasswordData): Promise<ApiResponse<null>> => {
        const response = await api.post<ApiResponse<null>>('/auth/reset-password', data);
        return response.data;
    },

    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        const response = await api.get<ApiResponse<User>>('/users/me');
        return response.data;
    },
};