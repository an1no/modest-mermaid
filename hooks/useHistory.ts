import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
    id: number;
    code: string;
    timestamp: number;
    label: string;
}

const HISTORY_KEY = 'mermaid_snapshots';
const MAX_SNAPSHOTS = 15; // Increased slightly
const DEBOUNCE_MS = 5000;

export const useHistory = (currentCode: string, currentTitle: string = 'Untitled Diagram', isDirty: boolean = true) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [lastSaved, setLastSaved] = useState<number | null>(null);

    // Load initial history
    useEffect(() => {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);

                // Migration & Deduplication
                const seen = new Set<string>();
                const migrated: HistoryItem[] = [];

                // Process from newest (assuming array is ordered new->old)
                for (const item of parsed) {
                    const code = item.code || '';
                    const clean = code.trim();
                    if (!clean) continue;

                    if (seen.has(clean)) continue;
                    seen.add(clean);

                    migrated.push({
                        id: item.id,
                        code: code,
                        timestamp: item.timestamp || item.id, // Fallback to ID if timestamp missing
                        label: item.label || (clean.split('\n')[0] || 'Untitled').slice(0, 50)
                    });
                }

                setHistory(migrated);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }, []);

    // Debounced save
    useEffect(() => {
        if (!isDirty || !currentCode.trim()) return;

        const timer = setTimeout(() => {
            setHistory((prev) => {
                const cleanCode = currentCode.trim();

                // If the very latest snapshot is identical, do nothing (no need to bump timestamp repeatedly)
                if (prev.length > 0 && prev[0].code.trim() === cleanCode && prev[0].label === currentTitle) {
                    return prev;
                }

                // Remove ALL previous instances of this code (move to top behavior)
                const filtered = prev.filter(item => !(item.code.trim() === cleanCode && item.label === currentTitle));

                const newItem: HistoryItem = {
                    id: Date.now(),
                    code: currentCode,
                    timestamp: Date.now(),
                    label: currentTitle
                };

                const newHistory = [newItem, ...filtered].slice(0, MAX_SNAPSHOTS);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
                setTimeout(() => setLastSaved(Date.now()), 0);
                return newHistory;
            });
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [currentCode, currentTitle]);

    const restoreSnapshot = useCallback((code: string) => {
        return code;
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    }, []);

    const deleteSnapshot = useCallback((id: number) => {
        setHistory(prev => {
            const newHistory = prev.filter(item => item.id !== id);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    const forceSave = useCallback(() => {
        if (!currentCode.trim()) return;

        setHistory((prev) => {
            const cleanCode = currentCode.trim();

            if (prev.length > 0 && prev[0].code.trim() === cleanCode && prev[0].label === currentTitle) {
                return prev;
            }

            const filtered = prev.filter(item => !(item.code.trim() === cleanCode && item.label === currentTitle));

            const newItem: HistoryItem = {
                id: Date.now(),
                code: currentCode,
                timestamp: Date.now(),
                label: currentTitle
            };

            const newHistory = [newItem, ...filtered].slice(0, MAX_SNAPSHOTS);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
            setTimeout(() => setLastSaved(Date.now()), 0);
            return newHistory;
        });
    }, [currentCode, currentTitle]);

    return { history, restoreSnapshot, clearHistory, lastSaved, deleteSnapshot, forceSave };
};
