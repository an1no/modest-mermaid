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