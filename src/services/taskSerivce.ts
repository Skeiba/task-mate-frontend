import type {ApiResponse, Page, Task, TaskRequest} from "../types";
import api from "./api.ts";

export const taskService = {
    getAllTasks: async (
        page: number = 0,
        size: number = 10,
    ): Promise<ApiResponse<Page<Task>>> => {
        const response = await api.get<ApiResponse<Page<Task>>>(`/tasks?page=${page}&size=${size}`);
        return response.data;
    },

    getTaskById: async (
        taskId: string
    ): Promise<ApiResponse<Task>> => {
        const response = await api.get<ApiResponse<Task>>(`/tasks/${taskId}`);
        return response.data;
    },

    createTask: async (
        task: TaskRequest
    ): Promise<ApiResponse<Task>> => {
        const response = await api.post<ApiResponse<Task>>("/tasks", task);
        return response.data;
    },

    updateTask: async (
        taskId: string,
        task: Partial<TaskRequest>
    ): Promise<ApiResponse<Task>> => {
        const response = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, task);
        return response.data;
    },

    deleteTask: async (
        taskId: string
    ): Promise<ApiResponse<null>> => {
        return (await api.delete<ApiResponse<null>>(`/tasks/${taskId}`)).data;
    },

    changeStatus: async (
        taskId: string,
        status: string
    ): Promise<ApiResponse<Task>> => {
        const response = await api.patch<ApiResponse<Task>>(
            `/tasks/${taskId}/status?status=${status}`
        );
        return response.data;
    },

    changePriority: async (
        taskId: string,
        priority: string
    ): Promise<ApiResponse<Task>> => {
        const response = await api.patch<ApiResponse<Task>>(
            `/tasks/${taskId}/priority?priority=${priority}`
        );
        return response.data;
    },

    addCategories: async (
        taskId: string,
        categoryIds: string[]
    ): Promise<ApiResponse<Task>> => {
        const response = await api.patch<ApiResponse<Task>>(
            `/tasks/${taskId}/categories`, categoryIds
        );
        return response.data;
    }

}