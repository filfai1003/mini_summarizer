import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const unwrapAxiosError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError;
        if (axiosErr.response) return `Request failed with status ${axiosErr.response.status}: ${JSON.stringify(axiosErr.response.data)}`;
        if (axiosErr.request) return 'No response received from server';
        return axiosErr.message;
    }
    if (err instanceof Error) return err.message;
    return String(err);
};

export const fetchData = async <T = any>(endpoint: string): Promise<T> => {
    try {
        const response = await axios.get<T>(`${API_BASE_URL}${endpoint}`);
        return response.data;
    } catch (error: unknown) {
        throw new Error(`Error fetching data: ${unwrapAxiosError(error)}`);
    }
};

export const postData = async <T = any>(endpoint: string, data: any): Promise<T> => {
    try {
        const response = await axios.post<T>(`${API_BASE_URL}${endpoint}`, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(`Error posting data: ${unwrapAxiosError(error)}`);
    }
};