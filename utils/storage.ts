import { DiagramFile, DiagramFolder } from '../types';

// ─── Legacy SavedDiagram (kept for backward compat) ───────────────────────────
export interface SavedDiagram {
  id: string;
  title: string;
  code: string;
  lastModified: number;
}

const LEGACY_KEY = 'mermaid-saved-diagrams';
const FOLDERS_KEY = 'mermaid-folders';
const FILES_KEY = 'mermaid-files';

// ─── Legacy helpers ──────────────────────────────────────────────────────────
export const getSavedDiagrams = (): SavedDiagram[] => {
  try {
    const stored = localStorage.getItem(LEGACY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveDiagram = (diagram: Omit<SavedDiagram, 'lastModified'>): SavedDiagram => {
  const diagrams = getSavedDiagrams();
  const existingIndex = diagrams.findIndex(d => d.id === diagram.id);
  const newDiagram: SavedDiagram = { ...diagram, lastModified: Date.now() };
  if (existingIndex >= 0) {
    diagrams[existingIndex] = newDiagram;
  } else {
    diagrams.push(newDiagram);
  }
  localStorage.setItem(LEGACY_KEY, JSON.stringify(diagrams));
  return newDiagram;
};

export const deleteDiagram = (id: string): void => {
  const diagrams = getSavedDiagrams().filter(d => d.id !== id);
  localStorage.setItem(LEGACY_KEY, JSON.stringify(diagrams));
};

export const loadDiagram = (id: string): SavedDiagram | undefined => {
  return getSavedDiagrams().find(d => d.id === id);
};

// ─── Folder CRUD ─────────────────────────────────────────────────────────────
export const getFolders = (): DiagramFolder[] => {
  try {
    const stored = localStorage.getItem(FOLDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveFolder = (folder: DiagramFolder): void => {
  const folders = getFolders();
  const idx = folders.findIndex(f => f.id === folder.id);
  if (idx >= 0) {
    folders[idx] = folder;
  } else {
    folders.push(folder);
  }
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
};

export const deleteFolder = (id: string): void => {
  // Delete folder + all its files
  const folders = getFolders().filter(f => f.id !== id);
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  const files = getFiles().filter(f => f.folderId !== id);
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
};

// ─── File CRUD ────────────────────────────────────────────────────────────────
export const getFiles = (): DiagramFile[] => {
  try {
    const stored = localStorage.getItem(FILES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveFile = (file: DiagramFile): void => {
  const files = getFiles();
  const idx = files.findIndex(f => f.id === file.id);
  if (idx >= 0) {
    files[idx] = file;
  } else {
    files.push(file);
  }
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
};

export const deleteFile = (id: string): void => {
  const files = getFiles().filter(f => f.id !== id);
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
};

export const getFilesInFolder = (folderId: string | null): DiagramFile[] => {
  return getFiles().filter(f => f.folderId === folderId);
};
