import type { ApiResponse, Task } from "../types";
import api from "./api.ts";

export const aiService = {
    parseAndCreateTask: async (
        naturalLanguageInput: string,
    ): Promise<ApiResponse<Task>> => {
        const response = await api.post<ApiResponse<Task>>(
            "/ai/parse-task",
            naturalLanguageInput
        );
        return response.data;
    },

    aiChat: async(
        naturalLanguageInput: string,
        taskIds?: string[],
        date?: Date
    ): Promise<ApiResponse<any>> => {
        let url = "/ai/chat";
        const params: Record<string, string> = {};
        if (taskIds && taskIds.length > 0) {
            params.taskIds = taskIds.join(",");
        }
        if (date) {
            params.date = date.toISOString().split("T")[0];
        }
        const queryString = new URLSearchParams(params).toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const response = await api.post<ApiResponse<any>>(url, naturalLanguageInput);
        return response.data;
    },

    categorizeTask: async (
        taskId: string
    ): Promise<ApiResponse<Task>> => {
        const response = await api.patch<ApiResponse<Task>>(
            `/ai/categorize/${taskId}`
        );
        return response.data;
    },

    summarizeTasks: async (
        taskIds: string[]
    ): Promise<ApiResponse<string>> => {
        const response = await api.post<ApiResponse<string>>(
            "/ai/summarize",
            taskIds
        );
        return response.data;
    },

    summarizeDailyTasks: async (
        date: Date
    ): Promise<ApiResponse<string>> => {
        const dateStr = date.toISOString().split("T")[0];
        const response = await api.get(`/ai/summarize/daily?date=${dateStr}`);
        return response.data;
    },

    summarizeAllTasks: async (): Promise<ApiResponse<string>> => {
        const response = await api.get<ApiResponse<string>>(
            "/ai/summarize/all"
        );
        return response.data;
    },

    async healthCheck(): Promise<ApiResponse<string>> {
        const response = await api.get('/ai/health-check');
        return response.data;
    }
};
