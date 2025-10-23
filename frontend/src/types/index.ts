export interface ApiResponse<T> {
    data: T;
    message: string;
    status: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    authorId: number;
}

export interface FetchOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
}