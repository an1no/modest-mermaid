import React, { useState, useEffect } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { DiagramViewer } from './components/DiagramViewer';
import { Layout } from 'lucide-react';
import { themes, ThemeId } from './themes';
import { ThemeSelector } from './components/ThemeSelector';
import { useHistory } from './hooks/useHistory';
import { getShareLink, loadFromURL } from './utils/urlManager';

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
  const [error, setError] = useState<string | null>(null);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('notion');

  const activeTheme = themes[currentThemeId];
  const { history } = useHistory(code);

  // Handle loading initial code (URL -> LocalStorage -> Default)
  useEffect(() => {
    const urlCode = loadFromURL();
    if (urlCode) {
      setCode(urlCode);
      // Clear hash to clean up URL, or keep it. User didn't specify, but keeping might be useful for reloads.
      // However, usually clean apps remove it or update it. Let's keep it simple.
    } else {
      const savedCode = localStorage.getItem('mermaid-code');
      if (savedCode) {
        setCode(savedCode);
      }
    }
  }, []);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    localStorage.setItem('mermaid-code', newCode);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSuccess = () => {
    setError(null);
  };

  const handleClear = () => {
    setCode('');
    localStorage.setItem('mermaid-code', '');
  };

  const handleShare = () => {
    const link = getShareLink(code);
    navigator.clipboard.writeText(link).catch((err) => {
      console.error('Failed to copy link:', err);
    });
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen w-screen overflow-hidden ${activeTheme.ui.background} ${activeTheme.ui.text}`}>
      {/* Header/Nav for Mobile only */}
      <div className={`md:hidden ${activeTheme.ui.headerBg} border-b ${activeTheme.ui.borderColor} p-3 flex items-center justify-between`}>
        <h1 className="flex items-center gap-2 font-semibold text-base">
          <Layout className={`w-5 h-5 ${activeTheme.ui.accent}`} />
          <span>Mermaid Live</span>
        </h1>
        <ThemeSelector currentTheme={currentThemeId} onThemeChange={setCurrentThemeId} />
      </div>

      {/* Editor Pane */}
      <div className={`w-full md:w-1/2 lg:w-2/5 h-1/2 md:h-full border-b md:border-b-0 md:border-r ${activeTheme.ui.borderColor} shadow-xl z-20 flex flex-col`}>
        <div className="flex-1 min-h-0 relative">
          <CodeEditor
            code={code}
            onChange={handleCodeChange}
            error={error}
            onClear={handleClear}
            onShare={handleShare}
            history={history}
            onRestore={handleCodeChange}
            // Passing raw classes effectively themes it without deep changes
            className={`${activeTheme.ui.editorBg} ${activeTheme.ui.editorText}`}
            headerClassName={`${activeTheme.ui.headerBg} border-b ${activeTheme.ui.borderColor}`}
          />
        </div>
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