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

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(summary);
        } catch {
            // ignore copy errors
        }
    };

    const handleClear = () => {
        setInput('');
        setSummary('');
        if (controllerRef.current) controllerRef.current.abort();
        setLoading(false);
    };

    return (
        <div className="app-container">
            <main className="main">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Summarize text</h1>
                            <div className="muted" style={{ marginTop: 6 }}>Enter or paste text and get a concise summary. Streaming enabled.</div>
                        </div>
                        <div className="controls">
                            <div className="muted" style={{ fontSize: 12 }}>{loading ? 'Summarizing…' : 'Ready'}</div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
                        <label htmlFor="inputText" className="muted">Text to summarize</label>
                        <textarea
                            id="inputText"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            rows={8}
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="Paste text to summarize..."
                            aria-label="Text to summarize"
                        />

                        <div className="actions">
                            <button className="btn btn-primary" type="submit" disabled={loading || input.trim() === ''}>
                                {loading ? 'Summarizing...' : 'Summarize'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => {
                                    if (controllerRef.current) controllerRef.current.abort();
                                    setLoading(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button type="button" className="btn small" onClick={handleCopy} disabled={!summary}>
                                Copy
                            </button>
                            <button type="button" className="btn btn-danger small" onClick={handleClear}>
                                Clear
                            </button>
                        </div>
                    </form>

                    <section>
                        <h3 style={{ marginTop: 18 }}>Summary</h3>
                        <div className="summary-box" role="region" aria-live="polite">
                            {summary || <div className="muted">No summary yet.</div>}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Home;