import type {ApiResponse, Category} from "../types";
import api from "./api.ts";

export const categoryService = {

    getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
        const response = await api.get<ApiResponse<Category[]>>('/categories');
        return response.data;
    },

    createCategory: async (name: string): Promise<ApiResponse<Category>> => {
        const response = await api.post<ApiResponse<Category>>('/categories', name);
        return response.data;
    },

    updateCategory: async (categoryId: string, name: string): Promise<ApiResponse<Category>> => {
        const response = await api.put<ApiResponse<Category>>(`/categories/${categoryId}`, name);
        return response.data;
    },

    deleteCategory: async (categoryId: string): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/categories/${categoryId}`);
        return response.data;
    },

    getAllowedIcons: async (): Promise<ApiResponse<String[]>> => {
        const response = await api.get<ApiResponse<String[]>>('/categories/icons');
        return response.data;
    }
}