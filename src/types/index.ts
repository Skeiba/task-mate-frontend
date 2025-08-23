export interface User {
    id: string;
    email: string;
    username: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    enabled: boolean;
}

export interface Task {
    id: string;
    title: string;
    content: string;
    status: 'PENDING' | 'DONE' | 'MISSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate: string;
    categories: Category[];
    createdAt: string;
    userId: string;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    timestamp: string;
    status: number;
}

export interface ApiError {
    message: string;
    status: number;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface LoginData {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface ForgotPasswordData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
}

export interface TaskRequest{
    title: string;
    content: string;
    status: Task['status'];
    priority: Task['priority'];
    dueDate: string;
    categories: Category[];
}