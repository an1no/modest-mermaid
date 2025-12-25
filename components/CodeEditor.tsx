import React, { useState, useRef, useLayoutEffect } from 'react';
import { AlertCircle, Trash2, History, Link, Check, Clock } from 'lucide-react';
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
  onRestore?: (code: string) => void;
  className?: string; // Additional classes for the editor body
  headerClassName?: string; // Classes for the header
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
  headerClassName = "border-b border-slate-800 bg-slate-900"
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

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

      <div className={`flex-none p-4 flex justify-between items-center ${headerClassName}`}>
        <h2 className="text-sm font-semibold opacity-90 uppercase tracking-wider">Editor</h2>
        <div className="flex items-center gap-2">

          {/* History Button */}
          {history.length > 0 && onRestore && (
            <div className="relative">
              <Tooltip content="History" position="bottom">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors"
                >
                  <Clock size={16} />
                </button>
              </Tooltip>

              {showHistory && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-700 bg-slate-900/50">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">History Snapshots</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onRestore(item.code);
                          setShowHistory(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 border-b border-slate-700/50 last:border-0 transition-colors flex flex-col gap-0.5"
                      >
                        <span className="font-medium text-indigo-400">{item.date}</span>
                        <span className="font-mono opacity-50 truncate w-full">{item.code.slice(0, 30)}...</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Backdrop to close history */}
              {showHistory && (
                <div className="fixed inset-0 z-40" onClick={() => setShowHistory(false)} />
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

          <span className="text-xs opacity-60 hidden sm:inline">Mermaid</span>
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

      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-900/90 border-t border-red-700 p-3 backdrop-blur-sm transition-all animate-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-200 text-xs font-bold uppercase tracking-wide mb-1">Syntax Error</h3>
              <p className="text-red-100 text-xs font-mono whitespace-pre-wrap break-all">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};