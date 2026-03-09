import React, { useState, useEffect, useCallback } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { DiagramViewer } from './components/DiagramViewer';
import { Sidebar } from './components/Sidebar';
import { Layout } from 'lucide-react';
import { themes, ThemeId } from './themes';
import { ThemeSelector } from './components/ThemeSelector';
import { useHistory } from './hooks/useHistory';
import { getShareLink, loadFromURL } from './utils/urlManager';
import {
  getSavedDiagrams, saveDiagram, deleteDiagram, SavedDiagram,
  getFolders, getFiles, saveFolder,
  deleteFolder as storagDeleteFolder,
  saveFile,
  deleteFile as storageDeleteFile
} from './utils/storage';
import { SeoAccordion } from './components/SeoAccordion';
import { DiagramFile, DiagramFolder } from './types';

// Default example code
const DEFAULT_CODE = `flowchart TB
    subgraph Client["Client Layer"]
        A[Web Browser] --> B[Mobile App]
        B --> C[Desktop Client]
    end
    
    subgraph Gateway["API Gateway"]
        D[Load Balancer]
        E[Authentication]
        F[Rate Limiting]
    end
    
    subgraph Services["Microservices"]
        G[User Service]
        H[Payment Service]
        I[Notification Service]
        J[Analytics Service]
    end
    
    subgraph Data["Data Layer"]
        K[(PostgreSQL)]
        L[(MongoDB)]
        M[(Redis Cache)]
        N[Message Queue]
    end
    
    subgraph External["External Services"]
        O[Email Provider]
        P[SMS Gateway]
        Q[Cloud Storage]
    end
    
    Client --> D
    D --> E
    E --> F
    F --> G & H & I & J
    
    G --> K
    G --> M
    H --> K
    H --> N
    I --> N
    I --> O
    I --> P
    J --> L
    J --> Q
    
    N --> I
    
    style Client fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style Gateway fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Services fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    style Data fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style External fill:#fce4ec,stroke:#c2185b,stroke-width:2px`;

const App: React.FC = () => {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [title, setTitle] = useState<string>('Untitled Diagram');
  const [error, setError] = useState<string | null>(null);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('notion');
  const [savedDiagrams, setSavedDiagrams] = useState<SavedDiagram[]>([]);
  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // ── Folder/File state ──────────────────────────────────────────────────────
  const [folders, setFolders] = useState<DiagramFolder[]>([]);
  const [files, setFiles] = useState<DiagramFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);

  const activeTheme = themes[currentThemeId];
  const { history: historyItems, lastSaved, deleteSnapshot, forceSave } = useHistory(code, title, isDirty);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    setSavedDiagrams(getSavedDiagrams());
    setFolders(getFolders());
    setFiles(getFiles());

    const urlCode = loadFromURL();
    if (urlCode) {
      setCode(urlCode);
    } else {
      const savedCode = localStorage.getItem('mermaid-code');
      const savedTitle = localStorage.getItem('mermaid-title');
      if (savedCode) setCode(savedCode);
      if (savedTitle) setTitle(savedTitle);
    }
  }, []);

  // ── Editor handlers ────────────────────────────────────────────────────────
  const handleTitleChange = (newTitle: string) => {
    setIsDirty(true);
    setTitle(newTitle);
    localStorage.setItem('mermaid-title', newTitle);

    // If editing a tracked file, persist name change
    if (currentFileId) {
      setFiles(prev => {
        const updated = prev.map(f =>
          f.id === currentFileId ? { ...f, name: newTitle, lastModified: Date.now() } : f
        );
        const file = updated.find(f => f.id === currentFileId);
        if (file) saveFile(file);
        return updated;
      });
    }
  };

  const handleCodeChange = (newCode: string) => {
    setIsDirty(true);
    setCode(newCode);
    localStorage.setItem('mermaid-code', newCode);
  };

  const handleError = (errorMessage: string) => setError(errorMessage);
  const handleSuccess = () => setError(null);

  const handleClear = () => {
    setCode('');
    setTitle('Untitled Diagram');
    setCurrentDiagramId(null);
    setCurrentFileId(null);
    localStorage.setItem('mermaid-code', '');
    localStorage.removeItem('mermaid-title');
  };

  const handleShare = () => {
    const link = getShareLink(code);
    navigator.clipboard.writeText(link).catch(err => {
      console.error('Failed to copy link:', err);
    });
  };

  const handleSave = () => {
    const id = Date.now().toString();
    saveDiagram({ id, title, code });
    setSavedDiagrams(getSavedDiagrams());
    setCurrentDiagramId(id);
    forceSave(code, title, true);

    // Also persist to file system if we have a currentFileId
    if (currentFileId) {
      setFiles(prev => {
        const updated = prev.map(f =>
          f.id === currentFileId ? { ...f, code, name: title, lastModified: Date.now() } : f
        );
        const file = updated.find(f => f.id === currentFileId);
        if (file) saveFile(file);
        return updated;
      });
    }
  };

  const handleRestore = (code: string, restoredTitle: string) => {
    setIsDirty(false);
    setCode(code);
    setTitle(restoredTitle);
  };

  // ── Sidebar: file operations ──────────────────────────────────────────────
  const handleLoadFile = useCallback((file: DiagramFile) => {
    setCode(file.code);
    setTitle(file.name);
    setCurrentFileId(file.id);
    setIsDirty(false);
    localStorage.setItem('mermaid-code', file.code);
    localStorage.setItem('mermaid-title', file.name);
  }, []);

  const handleCreateFile = useCallback((folderId: string | null) => {
    const newFile: DiagramFile = {
      id: Date.now().toString(),
      type: 'file',
      name: 'Untitled Diagram',
      code: 'flowchart LR\n    A --> B',
      folderId,
      lastModified: Date.now(),
    };
    saveFile(newFile);
    setFiles(getFiles());
    handleLoadFile(newFile);
  }, [handleLoadFile]);

  const handleDeleteFile = useCallback((id: string) => {
    storageDeleteFile(id);
    setFiles(getFiles());
    if (currentFileId === id) {
      setCurrentFileId(null);
    }
  }, [currentFileId]);

  const handleRenameFile = useCallback((id: string, newName: string) => {
    setFiles(prev => {
      const updated = prev.map(f =>
        f.id === id ? { ...f, name: newName, lastModified: Date.now() } : f
      );
      const file = updated.find(f => f.id === id);
      if (file) saveFile(file);
      return updated;
    });
    if (currentFileId === id) {
      setTitle(newName);
      localStorage.setItem('mermaid-title', newName);
    }
  }, [currentFileId]);

  // ── Sidebar: folder operations ────────────────────────────────────────────
  const handleCreateFolder = useCallback(() => {
    const newFolder: DiagramFolder = {
      id: Date.now().toString(),
      type: 'folder',
      name: 'New Folder',
      createdAt: Date.now(),
    };
    saveFolder(newFolder);
    setFolders(getFolders());
  }, []);

  const handleDeleteFolder = useCallback((id: string) => {
    storagDeleteFolder(id);
    setFolders(getFolders());
    setFiles(getFiles());
  }, []);

  const handleRenameFolder = useCallback((id: string, newName: string) => {
    setFolders(prev => {
      const updated = prev.map(f =>
        f.id === id ? { ...f, name: newName } : f
      );
      const folder = updated.find(f => f.id === id);
      if (folder) saveFolder(folder);
      return updated;
    });
  }, []);

  return (
    <div className={`flex flex-col md:flex-row h-screen w-screen overflow-hidden ${activeTheme.ui.background} ${activeTheme.ui.text}`}>

      {/* ── Sidebar (rendered outside normal flow via fixed positioning) ── */}
      <Sidebar
        folders={folders}
        files={files}
        currentFileId={currentFileId}
        onLoadFile={handleLoadFile}
        onCreateFile={handleCreateFile}
        onDeleteFile={handleDeleteFile}
        onRenameFile={handleRenameFile}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        onRenameFolder={handleRenameFolder}
      />

      {/* Header/Nav for Mobile only */}
      <div className={`md:hidden ${activeTheme.ui.headerBg} border-b ${activeTheme.ui.borderColor} p-3 flex items-center justify-between`}>
        <h1 className="flex items-center gap-2 font-semibold text-base ml-10">
          <Layout className={`w-5 h-5 ${activeTheme.ui.accent}`} />
          <span>Mermaid Live</span>
        </h1>
        <ThemeSelector currentTheme={currentThemeId} onThemeChange={setCurrentThemeId} />
      </div>

      {/* Editor Pane */}
      <div className={`w-full md:w-1/2 lg:w-2/5 h-1/2 md:h-full border-b md:border-b-0 md:border-r ${activeTheme.ui.borderColor} shadow-xl z-20 flex flex-col`}>
        <div className="flex-1 min-h-0 relative">
          <CodeEditor
            title={title}
            onTitleChange={handleTitleChange}
            onSave={handleSave}
            code={code}
            onChange={handleCodeChange}
            error={error}
            onClear={handleClear}
            onShare={handleShare}
            history={historyItems}
            onRestore={handleRestore}
            onDeleteSnapshot={deleteSnapshot}
            lastSaved={lastSaved}
            className={`${activeTheme.ui.editorBg} ${activeTheme.ui.editorText}`}
            headerClassName={`${activeTheme.ui.headerBg} border-b ${activeTheme.ui.borderColor}`}
          />
        </div>

        <SeoAccordion className={`${activeTheme.ui.borderColor} ${activeTheme.ui.editorBg} ${activeTheme.ui.editorText}`} />

        <div className={`p-2 text-[10px] text-center opacity-50 ${activeTheme.ui.editorBg} ${activeTheme.ui.editorText} border-t ${activeTheme.ui.borderColor}`}>
          Made by <a href="https://www.linkedin.com/in/anino-zaridze/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100 transition-opacity">Anino Zaridze</a>
        </div>
      </div>

      {/* Viewer Pane */}
      <div className="w-full md:w-1/2 lg:w-3/5 h-1/2 md:h-full relative">
        <div className="absolute top-4 right-4 z-20 hidden md:block">
          <ThemeSelector currentTheme={currentThemeId} onThemeChange={setCurrentThemeId} />
        </div>
        <DiagramViewer
          code={code}
          onError={handleError}
          onSuccess={handleSuccess}
          theme={activeTheme}
        />
      </div>
    </div>
  );
};

export default App;