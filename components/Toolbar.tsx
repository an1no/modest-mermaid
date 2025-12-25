import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  scale: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onExportSvg,
  onExportPng,
  onToggleFullscreen,
  isFullscreen,
  scale
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 p-2 rounded-full shadow-lg z-10 transition-all hover:bg-white">
      <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
        <Tooltip content="Zoom Out">
          <button
            onClick={onZoomOut}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ZoomOut size={18} />
          </button>
        </Tooltip>
        <Tooltip content="Reset Zoom">
          <button
            onClick={onResetZoom}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 px-1 min-w-[4ch] text-center tabular-nums"
          >
            {Math.round(scale * 100)}%
          </button>
        </Tooltip>
        <Tooltip content="Zoom In">
          <button
            onClick={onZoomIn}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ZoomIn size={18} />
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1 border-r border-slate-200 pr-2 pl-1">
        <Tooltip content="Download SVG">
          <button
            onClick={onExportSvg}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Download size={18} />
          </button>
        </Tooltip>
        <Tooltip content="Download PNG">
          <button
            onClick={onExportPng}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ImageIcon size={18} />
          </button>
        </Tooltip>
      </div>

      <div className="pl-1">
        <Tooltip content={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}>
          <button
            onClick={onToggleFullscreen}
            className={`p-2 rounded-full transition-colors ${isFullscreen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'}`}
          >
            {isFullscreen ? <RotateCcw size={18} /> : <Maximize size={18} />}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};