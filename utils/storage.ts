export interface SavedDiagram {
  id: string;
  title: string;
  code: string;
  lastModified: number;
}

const STORAGE_KEY = 'mermaid-saved-diagrams';

export const getSavedDiagrams = (): SavedDiagram[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load saved diagrams:', error);
    return [];
  }
};

export const saveDiagram = (diagram: Omit<SavedDiagram, 'lastModified'>): SavedDiagram => {
  const diagrams = getSavedDiagrams();
  const existingIndex = diagrams.findIndex(d => d.id === diagram.id);
  
  const newDiagram: SavedDiagram = {
    ...diagram,
    lastModified: Date.now(),
  };

  if (existingIndex >= 0) {
    diagrams[existingIndex] = newDiagram;
  } else {
    diagrams.push(newDiagram);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(diagrams));
  return newDiagram;
};

export const deleteDiagram = (id: string): void => {
  const diagrams = getSavedDiagrams();
  const filtered = diagrams.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const loadDiagram = (id: string): SavedDiagram | undefined => {
  const diagrams = getSavedDiagrams();
  return diagrams.find(d => d.id === id);
};
