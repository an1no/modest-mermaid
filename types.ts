export interface ExportOptions {
  type: 'svg' | 'png';
  scale?: number;
}

export interface DiagramState {
  code: string;
  svg: string | null;
  error: string | null;
  lastRendered: number;
}

export enum ViewMode {
  Split = 'SPLIT',
  Code = 'CODE',
  Diagram = 'DIAGRAM'
}

export interface DiagramFile {
  id: string;
  type: 'file';
  name: string;
  code: string;
  folderId: string | null; // null = root level
  lastModified: number;
}

export interface DiagramFolder {
  id: string;
  type: 'folder';
  name: string;
  createdAt: number;
}