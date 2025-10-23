import { useState, useEffect } from 'react';

const useFetch = <T = unknown>(url: string) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
                }
                const result = (await response.json()) as T;
                if (mounted) setData(result);
            } catch (err: unknown) {
                if (!mounted) return;
                if (err instanceof Error) setError(err.message);
                else setError(String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [url]);

    return { data, loading, error } as const;
};

export default useFetch;