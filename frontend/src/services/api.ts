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

export const streamSummarize = async (
    text: string,
    onChunk: (chunk: string) => void,
    onDone?: () => void,
    signal?: AbortSignal,
) => {
    const res = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal,
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    const reader = res.body?.getReader();

    if (!reader) {
        if (contentType.includes('application/json')) {
            const json = await res.json();
            onChunk(json.summary ?? '');
            onDone?.();
            return;
        }

        const full = await res.text();
        onChunk(full);
        onDone?.();
        return;
    }

    const decoder = new TextDecoder();
    let done = false;
    try {
        while (!done) {
            const { value, done: d } = await reader.read();
            done = !!d;
            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                try {
                    const json = JSON.parse(chunk);
                    if (typeof json.summary === 'string') {
                        onChunk(json.summary);
                    } else {
                        onChunk(chunk);
                    }
                } catch {
                    onChunk(chunk);
                }
            }
        }
        onDone?.();
    } finally {
        try {
            reader.releaseLock();
        } catch {}
    }
};