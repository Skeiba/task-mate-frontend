import axios, {type AxiosError} from "axios";
import type {ApiError} from "../types";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const apiError: ApiError = {
            message: (error.response?.data as ApiError)?.message || error.message,
            status: (error.response?.data as ApiError)?.status || error.response?.status || 500,
        };
        return Promise.reject(apiError)
    }
)

export default api;