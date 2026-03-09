import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Menu, X, ChevronRight, FolderPlus, FilePlus, Folder, FolderOpen,
    FileText, Pencil, Trash2, Layout
} from 'lucide-react';
import { DiagramFile, DiagramFolder } from '../types';
import { Tooltip } from './Tooltip';
import { ConfirmDialog } from './ConfirmDialog';

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
    onMoveFile: (fileId: string, targetFolderId: string | null) => void;
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
            className="flex-1 bg-[#F7FAFC] border border-[#086788] rounded px-2 py-0.5 text-sm text-[#4A5568] focus:outline-none focus:ring-1 focus:ring-[#086788] min-w-0"
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
    onMoveFile,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);
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
                        ? 'text-slate-600 hover:text-[#EE6055] hover:bg-[#EE6055]/15'
                        : 'text-slate-600 hover:text-[#4A5568] hover:bg-black/5'
                    }
                `}
            >
                {children}
            </button>
        </Tooltip>
    );

    const FolderRow: React.FC<{ folder: DiagramFolder }> = ({ folder }) => {
        const [isDragOver, setIsDragOver] = useState(false);
        const isExpanded = expandedFolders.has(folder.id);
        const folderFiles = files.filter(f => f.folderId === folder.id);
        const isRenaming = renamingId === folder.id;

        return (
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(false);
                    const fileId = e.dataTransfer.getData('text/plain');
                    if (fileId) {
                        onMoveFile(fileId, folder.id);
                        setExpandedFolders(p => new Set(p).add(folder.id));
                    }
                }}
            >
                {/* Folder header row */}
                <div
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group transition-colors ${isDragOver ? 'bg-[#086788]/20 border border-[#086788]/40' : 'hover:bg-black/5 border border-transparent'
                        }`}
                    onClick={() => toggleFolder(folder.id)}
                >
                    <ChevronRight
                        size={13}
                        className={`shrink-0 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                    {isExpanded
                        ? <FolderOpen size={15} className="shrink-0 text-[#38B000]" />
                        : <Folder size={15} className="shrink-0 text-[#38B000]" />
                    }

                    {isRenaming ? (
                        <InlineRename
                            initialValue={folder.name}
                            onConfirm={v => { onRenameFolder(folder.id, v); setRenamingId(null); }}
                            onCancel={() => setRenamingId(null)}
                        />
                    ) : (
                        <span className="flex-1 text-sm text-slate-800 truncate font-medium">{folder.name}</span>
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
                                setConfirmAction({
                                    message: `Delete folder "${folder.name}" and all its diagrams?`,
                                    onConfirm: () => onDeleteFolder(folder.id),
                                });
                            }}>
                                <Trash2 size={13} />
                            </ActionBtn>
                        </div>
                    )}
                </div>

                {/* Folder contents */}
                {isExpanded && (
                    <div className="ml-5 border-l border-[#086788]/20 pl-2 mt-0.5 mb-1 flex flex-col gap-0.5">
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
                draggable={!isRenaming}
                onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', file.id);
                }}
                className={`
                    flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group transition-colors
                    ${isActive
                        ? 'bg-[#086788]/15 border border-[#086788]/30'
                        : 'hover:bg-black/5 border border-transparent'
                    }
                `}
                onClick={() => onLoadFile(file)}
            >
                <FileText size={13} className={`shrink-0 ${isActive ? 'text-[#086788]' : 'text-slate-500'}`} />

                {isRenaming ? (
                    <InlineRename
                        initialValue={file.name}
                        onConfirm={v => { onRenameFile(file.id, v); setRenamingId(null); }}
                        onCancel={() => setRenamingId(null)}
                    />
                ) : (
                    <span className={`flex-1 text-sm truncate ${isActive ? 'text-[#4A5568] font-medium' : 'text-[#4A5568]'}`}>
                        {file.name}
                    </span>
                )}

                {!isRenaming && (
                    <div className="flex items-center gap-0.5 shrink-0">
                        <ActionBtn tooltip="Rename diagram" onClick={() => setRenamingId(file.id)}>
                            <Pencil size={12} />
                        </ActionBtn>
                        <ActionBtn danger tooltip="Delete diagram" onClick={() => {
                            setConfirmAction({
                                message: `Delete diagram "${file.name}"?`,
                                onConfirm: () => onDeleteFile(file.id),
                            });
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
                        bg-[#FFFFFF] border border-[#086788]/20
                        text-[#4A5568] hover:text-[#4A5568]
                        hover:bg-black/5
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
                style={{ backgroundColor: '#FFFFFF' }}
                className={`
                    fixed top-0 left-0 h-full z-50
                    w-72 flex flex-col
                    border-r border-[#086788]/10
                    shadow-[4px_0_40px_rgba(0,0,0,0.5)]
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Header — single X button on the right */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-[#086788]/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <Layout size={18} className="text-[#086788]" />
                        <span className="font-semibold text-sm tracking-wide text-[#4A5568]">Mermaid Live</span>
                    </div>
                    <Tooltip content="Close sidebar" position="left">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#F7FAFC] hover:bg-black/5 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </Tooltip>
                </div>

                {/* Action bar */}
                <div className="flex gap-2 px-3 py-3 border-b border-[#086788]/10 shrink-0">
                    <Tooltip content="Create a new diagram at root level" position="bottom">
                        <button
                            onClick={() => onCreateFile(null)}
                            className="
                                flex-1 flex items-center justify-center gap-1.5
                                py-2 px-3 rounded-lg text-xs font-semibold
                                bg-[#086788] hover:bg-[#07A0C3]/80
                                text-[#FFFFFF] transition-colors shadow-lg shadow-[#086788]/20
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
                                bg-black/5 hover:bg-black/10
                                text-[#4A5568] hover:text-[#F7FAFC]
                                border border-[#086788]/20
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
                <div
                    className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-0.5 custom-scrollbar min-h-[100px]"
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // This drop zone is the root of the sidebar tree
                        const fileId = e.dataTransfer.getData('text/plain');
                        if (fileId) {
                            onMoveFile(fileId, null);
                        }
                    }}
                >
                    {folders.length === 0 && rootFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <FolderOpen size={36} className="text-slate-600" />
                            <p className="text-xs text-center text-slate-500 leading-relaxed">
                                No diagrams yet.<br />
                                <span className="text-slate-600">Click <strong className="text-[#086788]">New Diagram</strong> to begin.</span>
                            </p>
                        </div>
                    ) : (
                        <>
                            {folders.map(folder => (
                                <FolderRow key={folder.id} folder={folder} />
                            ))}

                            {folders.length > 0 && rootFiles.length > 0 && (
                                <div className="my-2 border-t border-[#086788]/10 mx-2" />
                            )}

                            {rootFiles.map(file => (
                                <FileRow key={file.id} file={file} />
                            ))}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-[#086788]/10 shrink-0">
                    <p className="text-[10px] text-slate-500 text-center">
                        {files.length} diagram{files.length !== 1 ? 's' : ''} · {folders.length} folder{folders.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
            <ConfirmDialog
                isOpen={confirmAction !== null}
                message={confirmAction?.message || ''}
                onConfirm={() => {
                    confirmAction?.onConfirm();
                    setConfirmAction(null);
                }}
                onCancel={() => setConfirmAction(null)}
            />
        </>
    );
};
