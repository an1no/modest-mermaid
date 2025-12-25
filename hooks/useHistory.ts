import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
    id: number;
    code: string;
    date: string;
}

const HISTORY_KEY = 'mermaid_snapshots';
const MAX_SNAPSHOTS = 10;
const DEBOUNCE_MS = 2000; // Save 2 seconds after typing stops

export const useHistory = (currentCode: string) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Load initial history
    useEffect(() => {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            if (saved) {
                setHistory(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }, []);

    // Debounced save
    useEffect(() => {
        if (!currentCode.trim()) return;

        const timer = setTimeout(() => {
            setHistory((prev) => {
                // Avoid saving duplicates if the code hasn't changed meaningfully since the last snapshot
                // or if it matches the very last snapshot exactly.
                if (prev.length > 0 && prev[0].code === currentCode) {
                    return prev;
                }

                const newItem: HistoryItem = {
                    id: Date.now(),
                    code: currentCode,
                    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
                        ' ' + new Date().toLocaleDateString()
                };

                const newHistory = [newItem, ...prev].slice(0, MAX_SNAPSHOTS);

                localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
                return newHistory;
            });
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [currentCode]);

    const restoreSnapshot = useCallback((code: string) => {
        // This function doesn't need to do much since the parent handles the state update,
        // but it provides a clean interface.
        return code;
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    }, []);

    return { history, restoreSnapshot, clearHistory };
};
