import type {ApiResponse, Category, CategoryRequest} from "../types";
import api from "./api.ts";

export const categoryService = {

    getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
        const response = await api.get<ApiResponse<Category[]>>('/categories');
        return response.data;
    },

    createCategory: async (category: CategoryRequest): Promise<ApiResponse<Category>> => {
        const response = await api.post<ApiResponse<Category>>('/categories', category);
        return response.data;
    },

    updateCategory: async (categoryId: string, category: CategoryRequest): Promise<ApiResponse<Category>> => {
        const response = await api.put<ApiResponse<Category>>(`/categories/${categoryId}`, category);
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