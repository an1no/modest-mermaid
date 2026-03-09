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
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-[#F7FAFC]/90 backdrop-blur-sm border border-[#FFFFFF] p-2 rounded-full shadow-lg z-10 transition-all hover:bg-[#F7FAFC]">
      <div className="flex items-center gap-1 border-r border-[#FFFFFF] pr-2">
        <Tooltip content="Zoom Out">
          <button
            onClick={onZoomOut}
            className="p-2 hover:bg-[#07A0C3]/10 rounded-full text-[#4A5568]/60 hover:text-[#07A0C3] transition-colors"
          >
            <ZoomOut size={18} />
          </button>
        </Tooltip>
        <Tooltip content="Reset Zoom">
          <button
            onClick={onResetZoom}
            className="text-xs font-medium text-[#4A5568]/50 hover:text-[#07A0C3] px-1 min-w-[4ch] text-center tabular-nums"
          >
            {Math.round(scale * 100)}%
          </button>
        </Tooltip>
        <Tooltip content="Zoom In">
          <button
            onClick={onZoomIn}
            className="p-2 hover:bg-[#07A0C3]/10 rounded-full text-[#4A5568]/60 hover:text-[#07A0C3] transition-colors"
          >
            <ZoomIn size={18} />
          </button>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1 border-r border-[#FFFFFF] pr-2 pl-1">
        <Tooltip content="Download SVG">
          <button
            onClick={onExportSvg}
            className="p-2 hover:bg-[#07A0C3]/10 rounded-full text-[#4A5568]/60 hover:text-[#07A0C3] transition-colors"
          >
            <Download size={18} />
          </button>
        </Tooltip>
        <Tooltip content="Download PNG">
          <button
            onClick={onExportPng}
            className="p-2 hover:bg-[#07A0C3]/10 rounded-full text-[#4A5568]/60 hover:text-[#07A0C3] transition-colors"
          >
            <ImageIcon size={18} />
          </button>
        </Tooltip>
      </div>

      <div className="pl-1">
        <Tooltip content={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}>
          <button
            onClick={onToggleFullscreen}
            className={`p-2 rounded-full transition-colors ${isFullscreen ? 'bg-[#086788]/10 text-[#086788]' : 'hover:bg-[#07A0C3]/10 text-[#4A5568]/60 hover:text-[#07A0C3]'}`}
          >
            {isFullscreen ? <RotateCcw size={18} /> : <Maximize size={18} />}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};