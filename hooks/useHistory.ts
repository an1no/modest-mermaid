import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
    id: number;
    code: string;
    timestamp: number;
    label: string;
}

const HISTORY_KEY = 'mermaid_snapshots';
const MAX_SNAPSHOTS = 15; // Increased slightly
const DEBOUNCE_MS = 2000;

export const useHistory = (currentCode: string) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Load initial history
    useEffect(() => {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Migration: If old format (no timestamp), convert or filter
                // Simple check: if item.date exists but not timestamp, we might want to just reset or migrate.
                // For simplicity, we'll just validate structure or start fresh if invalid.
                // A robust way is to just map it:
                const migrated = parsed.map((item: any) => ({
                    id: item.id,
                    code: item.code,
                    timestamp: item.timestamp || item.id, // Fallback to ID if timestamp missing
                    label: item.label || (item.code.trim().split('\n')[0] || 'Untitled').slice(0, 50)
                }));
                setHistory(migrated);
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
                const cleanCode = currentCode.trim();

                // Avoid saving if same as last code (ignoring whitespace differences or exact match)
                if (prev.length > 0) {
                    const lastItem = prev[0];
                    if (lastItem.code.trim() === cleanCode) {
                        return prev;
                    }
                }

                const newItem: HistoryItem = {
                    id: Date.now(),
                    code: currentCode,
                    timestamp: Date.now(),
                    label: (cleanCode.split('\n')[0] || 'Untitled').slice(0, 50)
                };

                const newHistory = [newItem, ...prev].slice(0, MAX_SNAPSHOTS);

                localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
                return newHistory;
            });
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [currentCode]);

    const restoreSnapshot = useCallback((code: string) => {
        return code;
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    }, []);

    return { history, restoreSnapshot, clearHistory };
};
