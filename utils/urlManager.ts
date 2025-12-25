import LZString from 'lz-string';

export const getShareLink = (code: string): string => {
    try {
        const compressed = LZString.compressToEncodedURIComponent(code);
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}#${compressed}`;
    } catch (error) {
        console.error('Failed to generate share link:', error);
        return window.location.href;
    }
};

export const loadFromURL = (): string | null => {
    try {
        const hash = window.location.hash;
        if (!hash || hash.length <= 1) return null;

        // Remove the '#'
        const compressed = hash.slice(1);
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        return decompressed;
    } catch (error) {
        console.error('Failed to load from URL:', error);
        return null;
    }
};
