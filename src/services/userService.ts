import api from './api';
import type { User, ApiResponse } from '../types';

interface UpdateProfileData {
    username?: string;
    email?: string;
}

interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

interface AdminChangePasswordData {
    newPassword: string;
}

export const userService = {
    // ----- Current User -----
    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        const response = await api.get<ApiResponse<User>>('/users/me');
        return response.data;
    },

    updateProfile: async (
        data: UpdateProfileData
    ): Promise<ApiResponse<User>> => {
        const response = await api.put<ApiResponse<User>>('/users/me', data);
        return response.data;
    },

    changePassword: async (
        data: ChangePasswordData
    ): Promise<ApiResponse<void>> => {
        const response = await api.patch<ApiResponse<void>>('/users/me/change-password', data);
        return response.data;
    },

    deleteCurrentUser: async (): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>('/users/me');
        return response.data;
    },

    deactivateCurrentUser: async (): Promise<ApiResponse<void>> => {
        const response = await api.patch<ApiResponse<void>>('/users/me/deactivate');
        return response.data;
    },

    // ----- Admin Endpoints -----
    getAllUsers: async (): Promise<ApiResponse<User[]>> => {
        const response = await api.get<ApiResponse<User[]>>('/users');
        return response.data;
    },

    getAllUsersByStatus: async (
        status: User['enabled']
    ): Promise<ApiResponse<User[]>> => {
        const response = await api.get<ApiResponse<User[]>>(`/users/status/${status}`);
        return response.data;
    },

    getUserById: async (
        userId: string
    ): Promise<ApiResponse<User>> => {
        const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
        return response.data;
    },

    updateUserById: async (
        userId: string,
        data: UpdateProfileData
    ): Promise<ApiResponse<User>> => {
        const response = await api.put<ApiResponse<User>>(`/users/${userId}`, data);
        return response.data;
    },

    deleteUserById: async (
        userId: string
    ): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/users/${userId}`);
        return response.data;
    },

    activateUser: async (
        userId: string
    ): Promise<ApiResponse<void>> => {
        const response = await api.patch<ApiResponse<void>>(`/users/${userId}/activate`);
        return response.data;
    },

    deactivateUser: async (
        userId: string
    ): Promise<ApiResponse<void>> => {
        const response = await api.patch<ApiResponse<void>>(`/users/${userId}/deactivate`);
        return response.data;
    },

    changeUserPassword: async (
        userId: string,
        data: AdminChangePasswordData
    ): Promise<ApiResponse<void>> => {
        const response = await api.patch<ApiResponse<void>>(`/users/${userId}/change-password`, data);
        return response.data;
    },

    updateUserRole: async (
        userId: string,
        role: User['role']
    ): Promise<ApiResponse<User>> => {
        const response = await api.patch<ApiResponse<User>>(`/users/${userId}/role`, { role });
        return response.data;
    },
};
