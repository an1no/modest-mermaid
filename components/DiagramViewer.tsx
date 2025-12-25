import React, { useRef, useEffect, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import { Toolbar } from './Toolbar';
import { Theme } from '../themes';

interface DiagramViewerProps {
  code: string;
  onError: (error: string) => void;
  onSuccess: () => void;
  theme: Theme;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ code, onError, onSuccess, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformComponentRef = useRef<ReactZoomPanPinchContentRef>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const renderDiagram = useCallback(async () => {
    if (!code.trim()) {
      setSvgContent('');
      return;
    }

    try {
      // Re-initialize mermaid with new theme settings
      // We must do this before parsing/rendering to ensure style changes take effect
      mermaid.initialize({
        startOnLoad: false,
        theme: theme.mermaid.theme,
        look: theme.mermaid.look,
        themeVariables: theme.mermaid.themeVariables || {},
        securityLevel: 'loose',
        fontFamily: theme.id === 'notion' ? 'Inter, sans-serif' : 'JetBrains Mono, monospace',
        flowchart: { useMaxWidth: false, htmlLabels: false },
        sequence: { useMaxWidth: false },
        gantt: { useMaxWidth: false },
        journey: { useMaxWidth: false },
        class: { useMaxWidth: false },
        state: { useMaxWidth: false },
        er: { useMaxWidth: false },
        pie: { useMaxWidth: false },
      });

      await mermaid.parse(code);
      // Generate a unique ID to prevent internal caching issues
      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, code);
      setSvgContent(svg);
      onSuccess();
    } catch (error: any) {
      console.error('Mermaid Error:', error);
      const errorMessage = error.message || 'Unknown syntax error';
      onError(errorMessage);
    }
  }, [code, onError, onSuccess, theme]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderDiagram();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [renderDiagram]);

  // Center the view whenever the diagram content changes
  useEffect(() => {
    if (svgContent && transformComponentRef.current) {
      // Small delay to ensure DOM has updated with new SVG dimensions before centering
      const timer = setTimeout(() => {
        transformComponentRef.current?.centerView(1, 0); // scale 1, duration 0
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [svgContent]);

  const handleZoomIn = () => transformComponentRef.current?.zoomIn();
  const handleZoomOut = () => transformComponentRef.current?.zoomOut();
  const handleResetZoom = () => transformComponentRef.current?.centerView(1);

  const handleExportSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mermaid-diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPng = () => {
    if (!svgContent) {
      console.error('Export PNG: No SVG content found');
      return;
    }

    console.log('Export PNG: Starting export...');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Export PNG: Could not get 2D context');
      return;
    }

    const img = new Image();

    // Ensure xmlns is present for standalone parsing
    let svgData = svgContent.includes('xmlns')
      ? svgContent
      : svgContent.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');

    // Parse viewBox to ensure width/height are set
    const viewBoxMatch = svgData.match(/viewBox="([\d\s.-]+)"/);
    if (viewBoxMatch) {
      const [, viewBox] = viewBoxMatch;
      const parts = viewBox.split(/\s+/).map(parseFloat);
      if (parts.length === 4) {
        const width = parts[2];
        const height = parts[3];

        // If width/height are missing or set to 100%, force them to match viewBox for proper Canvas scaling
        if (!svgData.includes('width="') || svgData.includes('width="100%"')) {
          svgData = svgData.replace('<svg', `<svg width="${width}" height="${height}"`);
        }
      }
    }

    // Use data URL instead of blob URL to avoid CORS/tainting issues
    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

    img.onload = () => {
      console.log('Export PNG: Image loaded', img.width, img.height);
      // Determine dimensions
      let width = img.width;
      let height = img.height;

      // Ensure we have valid dimensions
      if (width === 0 || height === 0) {
        if (viewBoxMatch) {
          const [, viewBox] = viewBoxMatch;
          const parts = viewBox.split(/\s+/).map(parseFloat);
          if (parts.length === 4) {
            width = parts[2];
            height = parts[3];
          }
        }
      }

      // Final fallback
      if (!width || !height) {
        width = 800;
        height = 600;
      }

      console.log('Export PNG: Canvas dimensions', width, height);

      const scale = 2; // Export at 2x resolution
      canvas.width = width * scale;
      canvas.height = height * scale;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = 'mermaid-diagram.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Export PNG: Download triggered');
      } catch (err: any) {
        console.error('Export PNG: Error creating data URL', err);
      }
    };

    img.onerror = (err) => {
      console.error('Export PNG: Error loading SVG image', err);
    };

    img.src = svgDataUrl;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${theme.ui.diagramBg} bg-dot-pattern flex flex-col overflow-hidden`}
    >
      <style>{`
        .mermaid-output svg {
          max-width: none !important;
          height: auto;
        }
      `}</style>

      <TransformWrapper
        ref={transformComponentRef}
        initialScale={1}
        minScale={0.1}
        maxScale={8}
        centerOnInit={true}
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        onTransformed={(ref) => setZoomScale(ref.state.scale)}
      >
        <TransformComponent
          wrapperClass="w-full h-full overflow-hidden"
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "fit-content", height: "fit-content" }}
        >
          <div className="p-20 mermaid-output">
            <div
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>

      <Toolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onExportSvg={handleExportSvg}
        onExportPng={handleExportPng}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        scale={zoomScale}
      />
    </div>
  );
};