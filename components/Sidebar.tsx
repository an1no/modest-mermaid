import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Menu, X, ChevronRight, FolderPlus, FilePlus, Folder, FolderOpen,
    FileText, Pencil, Trash2, Layout
} from 'lucide-react';
import { DiagramFile, DiagramFolder } from '../types';
import { Tooltip } from './Tooltip';

interface SidebarProps {
    folders: DiagramFolder[];
    files: DiagramFile[];
    currentFileId: string | null;
    onLoadFile: (file: DiagramFile) => void;
    onCreateFile: (folderId: string | null) => void;
    onDeleteFile: (id: string) => void;
    onRenameFile: (id: string, newName: string) => void;
    onCreateFolder: () => void;
    onDeleteFolder: (id: string) => void;
    onRenameFolder: (id: string, newName: string) => void;
}

interface InlineRenameProps {
    initialValue: string;
    onConfirm: (val: string) => void;
    onCancel: () => void;
}

const InlineRename: React.FC<InlineRenameProps> = ({ initialValue, onConfirm, onCancel }) => {
    const ref = useRef<HTMLInputElement>(null);
    const [val, setVal] = useState(initialValue);

    useEffect(() => {
        ref.current?.select();
    }, []);

    const confirm = () => {
        const trimmed = val.trim();
        if (trimmed) onConfirm(trimmed);
        else onCancel();
    };

    return (
        <input
            ref={ref}
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={confirm}
            onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); confirm(); }
                if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
            }}
            className="flex-1 bg-[#2a2d3e] border border-violet-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-400 min-w-0"
            onClick={e => e.stopPropagation()}
        />
    );
};

export const Sidebar: React.FC<SidebarProps> = ({
    folders,
    files,
    currentFileId,
    onLoadFile,
    onCreateFile,
    onDeleteFile,
    onRenameFile,
    onCreateFolder,
    onDeleteFolder,
    onRenameFolder,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
                const target = e.target as HTMLElement;
                if (!target.closest('[data-hamburger]')) {
                    setIsOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const toggleFolder = useCallback((id: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const rootFiles = files.filter(f => f.folderId === null);

    // ──────────────────────────────────────────────────────────────────────────
    // Shared action button with tooltip
    // ──────────────────────────────────────────────────────────────────────────
    const ActionBtn = ({
        onClick,
        tooltip,
        children,
        danger = false,
    }: {
        onClick: (e: React.MouseEvent) => void;
        tooltip: string;
        children: React.ReactNode;
        danger?: boolean;
    }) => (
        <Tooltip content={tooltip} position="top">
            <button
                onClick={e => { e.stopPropagation(); onClick(e); }}
                className={`
                    p-1.5 rounded transition-all duration-150
                    opacity-0 group-hover:opacity-100
                    ${danger
                        ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/15'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }
                `}
            >
                {children}
            </button>
        </Tooltip>
    );

    const FolderRow: React.FC<{ folder: DiagramFolder }> = ({ folder }) => {
        const isExpanded = expandedFolders.has(folder.id);
        const folderFiles = files.filter(f => f.folderId === folder.id);
        const isRenaming = renamingId === folder.id;

        return (
            <div>
                {/* Folder header row */}
                <div
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group hover:bg-white/8 transition-colors"
                    onClick={() => toggleFolder(folder.id)}
                >
                    <ChevronRight
                        size={13}
                        className={`shrink-0 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                    {isExpanded
                        ? <FolderOpen size={15} className="shrink-0 text-amber-400" />
                        : <Folder size={15} className="shrink-0 text-amber-400" />
                    }

                    {isRenaming ? (
                        <InlineRename
                            initialValue={folder.name}
                            onConfirm={v => { onRenameFolder(folder.id, v); setRenamingId(null); }}
                            onCancel={() => setRenamingId(null)}
                        />
                    ) : (
                        <span className="flex-1 text-sm text-slate-200 truncate font-medium">{folder.name}</span>
                    )}

                    {!isRenaming && (
                        <div className="flex items-center gap-0.5 shrink-0">
                            <ActionBtn tooltip="New diagram in folder" onClick={() => {
                                onCreateFile(folder.id);
                                setExpandedFolders(p => new Set(p).add(folder.id));
                            }}>
                                <FilePlus size={13} />
                            </ActionBtn>
                            <ActionBtn tooltip="Rename folder" onClick={() => setRenamingId(folder.id)}>
                                <Pencil size={13} />
                            </ActionBtn>
                            <ActionBtn danger tooltip="Delete folder" onClick={() => {
                                if (window.confirm(`Delete folder "${folder.name}" and all its diagrams?`)) {
                                    onDeleteFolder(folder.id);
                                }
                            }}>
                                <Trash2 size={13} />
                            </ActionBtn>
                        </div>
                    )}
                </div>

                {/* Folder contents */}
                {isExpanded && (
                    <div className="ml-5 border-l border-white/10 pl-2 mt-0.5 mb-1 flex flex-col gap-0.5">
                        {folderFiles.length === 0 ? (
                            <div className="text-xs px-2 py-1.5 italic text-slate-500">No diagrams yet</div>
                        ) : (
                            folderFiles.map(file => (
                                <FileRow key={file.id} file={file} />
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    };

    const FileRow: React.FC<{ file: DiagramFile }> = ({ file }) => {
        const isActive = file.id === currentFileId;
        const isRenaming = renamingId === file.id;

        return (
            <div
                className={`
                    flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group transition-colors
                    ${isActive
                        ? 'bg-violet-600/30 border border-violet-500/40'
                        : 'hover:bg-white/8 border border-transparent'
                    }
                `}
                onClick={() => onLoadFile(file)}
            >
                <FileText size={13} className={`shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />

                {isRenaming ? (
                    <InlineRename
                        initialValue={file.name}
                        onConfirm={v => { onRenameFile(file.id, v); setRenamingId(null); }}
                        onCancel={() => setRenamingId(null)}
                    />
                ) : (
                    <span className={`flex-1 text-sm truncate ${isActive ? 'text-violet-200 font-medium' : 'text-slate-300'}`}>
                        {file.name}
                    </span>
                )}

                {!isRenaming && (
                    <div className="flex items-center gap-0.5 shrink-0">
                        <ActionBtn tooltip="Rename diagram" onClick={() => setRenamingId(file.id)}>
                            <Pencil size={12} />
                        </ActionBtn>
                        <ActionBtn danger tooltip="Delete diagram" onClick={() => {
                            if (window.confirm(`Delete diagram "${file.name}"?`)) {
                                onDeleteFile(file.id);
                            }
                        }}>
                            <Trash2 size={12} />
                        </ActionBtn>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* ── Hamburger button — always shows ☰, never X ───────────── */}
            <Tooltip content="Open diagrams" position="right">
                <button
                    data-hamburger="true"
                    onClick={() => setIsOpen(o => !o)}
                    className={`
                        fixed top-3 left-3 z-[60] p-2 rounded-lg
                        bg-[#1a1b26] border border-white/10
                        text-slate-300 hover:text-white
                        hover:bg-white/10
                        shadow-lg transition-all duration-200
                        hover:scale-105 active:scale-95
                        ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}
                    `}
                >
                    <Menu size={18} />
                </button>
            </Tooltip>

            {/* ── Backdrop ─────────────────────────────────────────────── */}
            <div
                className={`
                    fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
                    transition-opacity duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                onClick={() => setIsOpen(false)}
            />

            {/* ── Sidebar panel ─────────────────────────────────────────── */}
            <div
                ref={sidebarRef}
                style={{ background: 'linear-gradient(160deg, #13141f 0%, #1a1b2e 100%)' }}
                className={`
                    fixed top-0 left-0 h-full z-50
                    w-72 flex flex-col
                    border-r border-white/8
                    shadow-[4px_0_40px_rgba(0,0,0,0.5)]
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Header — single X button on the right */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/8 shrink-0">
                    <div className="flex items-center gap-2">
                        <Layout size={18} className="text-violet-400" />
                        <span className="font-semibold text-sm tracking-wide text-white">Mermaid Live</span>
                    </div>
                    <Tooltip content="Close sidebar" position="left">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </Tooltip>
                </div>

                {/* Action bar */}
                <div className="flex gap-2 px-3 py-3 border-b border-white/8 shrink-0">
                    <Tooltip content="Create a new diagram at root level" position="bottom">
                        <button
                            onClick={() => onCreateFile(null)}
                            className="
                                flex-1 flex items-center justify-center gap-1.5
                                py-2 px-3 rounded-lg text-xs font-semibold
                                bg-violet-600 hover:bg-violet-500
                                text-white transition-colors shadow-lg shadow-violet-900/40
                            "
                        >
                            <FilePlus size={14} />
                            New Diagram
                        </button>
                    </Tooltip>
                    <Tooltip content="Create a new folder" position="bottom">
                        <button
                            onClick={onCreateFolder}
                            className="
                                flex items-center justify-center gap-1.5
                                py-2 px-3 rounded-lg text-xs font-semibold
                                bg-white/8 hover:bg-white/15
                                text-slate-300 hover:text-white
                                border border-white/10
                                transition-colors
                            "
                        >
                            <FolderPlus size={14} />
                        </button>
                    </Tooltip>
                </div>

                {/* Section label */}
                <div className="px-4 pt-3 pb-1 shrink-0">
                    <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Diagrams</span>
                </div>

                {/* Tree */}
                <div className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-0.5 custom-scrollbar">
                    {folders.length === 0 && rootFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <FolderOpen size={36} className="text-slate-600" />
                            <p className="text-xs text-center text-slate-500 leading-relaxed">
                                No diagrams yet.<br />
                                <span className="text-slate-400">Click <strong className="text-violet-400">New Diagram</strong> to begin.</span>
                            </p>
                        </div>
                    ) : (
                        <>
                            {folders.map(folder => (
                                <FolderRow key={folder.id} folder={folder} />
                            ))}

                            {folders.length > 0 && rootFiles.length > 0 && (
                                <div className="my-2 border-t border-white/8 mx-2" />
                            )}

                            {rootFiles.map(file => (
                                <FileRow key={file.id} file={file} />
                            ))}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-white/8 shrink-0">
                    <p className="text-[10px] text-slate-500 text-center">
                        {files.length} diagram{files.length !== 1 ? 's' : ''} · {folders.length} folder{folders.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        </>
    );
};
