import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { AlertCircle, Trash2, Link, Check, Clock, Save, X } from 'lucide-react';
import { SavedDiagram } from '../utils/storage';
import { Tooltip } from './Tooltip';
import { HistoryItem } from '../hooks/useHistory';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import { registerMermaid } from '../utils/mermaid-prism';

// Register Mermaid grammar immediately
registerMermaid();

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  error: string | null;
  onClear?: () => void;
  onShare?: () => void;
  history?: HistoryItem[];
  onRestore?: (code: string, title: string) => void;
  className?: string; // Additional classes for the editor body
  headerClassName?: string; // Classes for the header
  title?: string;
  onTitleChange?: (title: string) => void;
  onSave?: () => void;
  lastSaved?: number | null;
  onDeleteSnapshot?: (id: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  error,
  onClear,
  onShare,
  history = [],
  onRestore,
  className = "bg-slate-900 text-slate-300",
  headerClassName = "border-b border-slate-800 bg-slate-900",
  title,
  onTitleChange,
  onSave,
  lastSaved,
  onDeleteSnapshot
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showSaveTooltip, setShowSaveTooltip] = useState(false);
  const [showAutoSaveBanner, setShowAutoSaveBanner] = useState(false);

  // Ref changed to DivElement because we wrap the editor in a scrolling div
  const textareaRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const handleShareClick = () => {
    if (onShare) {
      onShare();
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  const handleSaveClick = useCallback(() => {
    if (onSave) {
      onSave();
      setShowSaveTooltip(true);
      setTimeout(() => setShowSaveTooltip(false), 2000);
    }
  }, [onSave]);

  const handleSaveClickRef = useRef(handleSaveClick);
  useEffect(() => {
    handleSaveClickRef.current = handleSaveClick;
  }, [handleSaveClick]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveClickRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (lastSaved) {
      setShowAutoSaveBanner(true);
      const timer = setTimeout(() => setShowAutoSaveBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;

    const handleScroll = () => {
      if (lineNumbers && textarea) {
        lineNumbers.scrollTop = textarea.scrollTop;
      }
    };

    if (textarea) {
      textarea.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const lineCount = code.split('\n').length;
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className={`flex flex-col h-full relative ${className}`}>
      {/* Prism Theme Injection */}
      <style>{`
        .token.comment { color: #9ca3af; font-style: italic; }
        .token.keyword { color: #db2777; font-weight: bold; }
        .token.string { color: #16a34a; }
        .token.operator { color: #4f46e5; }
        .token.variable { color: #2563eb; }
        .token.punctuation { color: #6b7280; }
        
        /* Ensure editor text matches line numbers exactly */
        .prism-editor textarea { outline: none !important; }
      `}</style>

      <div className={`flex-none p-4 pl-16 flex justify-between items-center ${headerClassName}`}>
        <div className="flex-1 min-w-0 mr-4">
          {onTitleChange ? (
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="bg-transparent border-none text-sm font-semibold opacity-90 tracking-wider w-full focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-1 -ml-1 placeholder-white/20"
              placeholder="Untitled Diagram"
            />
          ) : (
            <h2 className="text-sm font-semibold opacity-90 tracking-wider">Editor</h2>
          )}
        </div>
        <div className="flex items-center gap-2">

          {/* Save Button */}
          {onSave && (
            <div className="relative">
              <Tooltip content={showSaveTooltip ? "Saved!" : "Save"} position="bottom">
                <button
                  onClick={handleSaveClick}
                  className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors"
                >
                  {showSaveTooltip ? <Check size={16} className="text-green-400" /> : <Save size={16} />}
                </button>
              </Tooltip>
            </div>
          )}

          {/* History Button */}
          {onRestore && (
            <div className="relative">
              <Tooltip content="History" position="bottom">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors"
                >
                  <Clock size={16} />
                </button>
              </Tooltip>

              {/* Backdrop & Modal */}
              {showHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 transition-opacity" onClick={() => setShowHistory(false)}>
                  <div
                    className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden w-full max-w-xl max-h-[80vh] flex flex-col"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-slate-200 tracking-wider flex items-center gap-2">
                        <Clock size={18} className="text-indigo-400" />
                        Version History
                      </h3>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                      {history.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No history available yet.</div>
                      ) : (
                        <div className="grid gap-2">
                          {history.map((item) => {
                            const timeStr = new Date(item.timestamp).toLocaleString();

                            return (
                              <div key={item.id} className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-indigo-900/40 border border-slate-700/50 hover:border-indigo-500/50 transition-all flex flex-col gap-2 group relative">
                                <button
                                  onClick={() => {
                                    onRestore(item.code, item.label);
                                    setShowHistory(false);
                                  }}
                                  className="text-left w-full h-full absolute inset-0 z-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                  aria-label={`Restore version from ${timeStr}`}
                                />
                                <div className="flex justify-between items-start w-full gap-4 relative z-10 pointer-events-none">
                                  <span className="font-semibold text-indigo-300 group-hover:text-indigo-200 truncate">{item.label}</span>
                                  <div className="flex items-center gap-2 pointer-events-auto">
                                    <span className="text-slate-400 text-xs whitespace-nowrap bg-slate-900/50 px-2 py-1 rounded">{timeStr}</span>
                                    {onDeleteSnapshot && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm('Are you sure you want to delete this version?')) {
                                            onDeleteSnapshot(item.id);
                                          }
                                        }}
                                        className="text-slate-500 hover:text-red-400 bg-slate-900/50 hover:bg-red-500/10 p-1 rounded transition-colors"
                                        title="Delete version"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="font-mono text-xs text-slate-500 group-hover:text-slate-400 truncate w-full relative z-10 pointer-events-none">
                                  {(item.code.split('\n')[1] || item.code.split('\n')[0] || '').slice(0, 80)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share Button */}
          {onShare && (
            <div className="relative">
              <Tooltip content={showShareTooltip ? "Copied!" : "Share Link"} position="bottom">
                <button
                  onClick={handleShareClick}
                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                >
                  {showShareTooltip ? <Check size={16} className="text-green-400" /> : <Link size={16} />}
                </button>
              </Tooltip>
            </div>
          )}

          <div className="w-px h-4 bg-slate-700 mx-1" />

          {onClear && (
            <Tooltip content="Clear editor" position="left">
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/20 hover:bg-red-900/30 opacity-70 hover:opacity-100 hover:text-red-400 rounded text-xs font-medium transition-colors border border-transparent hover:border-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="flex-grow relative flex overflow-hidden">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="h-full pt-4 pb-40 pr-3 text-right font-mono text-sm leading-6 select-none opacity-30 overflow-hidden w-12 shrink-0 bg-transparent"
        >
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>

        {/* Scrollable Editor Container */}
        <div
          ref={textareaRef}
          className="flex-1 min-w-0 h-full overflow-auto bg-transparent relative custom-scrollbar"
        >
          <Editor
            value={code}
            onValueChange={onChange}
            highlight={code => Prism.highlight(code, Prism.languages.mermaid || Prism.languages.plain, 'mermaid')}
            padding={16}
            className="prism-editor bg-transparent font-mono"
            textareaClassName="focus:outline-none"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.875rem', // 14px
              lineHeight: '1.5rem', // 24px (leading-6)
              minHeight: '100%',
              paddingBottom: '10rem', // 160px (pb-40)
              whiteSpace: 'pre',
            }}
          />
        </div>
      </div>

      {showAutoSaveBanner && (
        <div className="absolute bottom-4 right-4 z-40 bg-green-900/95 border border-green-700 text-green-200 text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <Check className="w-4 h-4 text-green-400" />
          Auto-saved
        </div>
      )}

      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-900/95 border-t border-red-700 p-3 backdrop-blur-sm transition-all animate-in slide-in-from-bottom-2 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[40vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-red-200 text-xs font-bold uppercase tracking-wide">Syntax Error</h3>
                {onClear && (
                  <button
                    onClick={onClear}
                    className="flex items-center gap-1.5 px-2 py-1 bg-red-950 hover:bg-red-800 text-red-300 hover:text-red-100 rounded text-[10px] font-medium transition-colors border border-red-800/50"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Editor
                  </button>
                )}
              </div>
              <p className="text-red-100 text-xs font-mono whitespace-pre-wrap break-all">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};