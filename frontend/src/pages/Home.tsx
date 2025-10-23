import React, { useState, useRef } from 'react';
import { streamSummarize } from '../services/api';

const Home: React.FC = () => {
    const [input, setInput] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const controllerRef = useRef<AbortController | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSummary('');
        setLoading(true);

        if (controllerRef.current) controllerRef.current.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            await streamSummarize(
                input,
                (chunk) => setSummary((s) => s + chunk),
                () => setLoading(false),
                controller.signal,
            );
        } catch (err) {
            setSummary((s) => s + `\n\nError: ${String(err)}`);
            setLoading(false);
        } finally {
            controllerRef.current = null;
        }
    };

    return (
        <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
            <h1>Summarize text</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={10}
                    style={{ width: '100%' }}
                    placeholder="Paste text to summarize..."
                />
                <div style={{ marginTop: 8 }}>
                    <button type="submit" disabled={loading || input.trim() === ''}>
                        {loading ? 'Summarizing...' : 'Summarize'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (controllerRef.current) controllerRef.current.abort();
                            setLoading(false);
                        }}
                        style={{ marginLeft: 8 }}
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <section style={{ marginTop: 16 }}>
                <h3>Summary (streamed)</h3>
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 12, minHeight: 120 }}>{summary}</pre>
            </section>
        </div>
    );
};

export default Home;