import React, { useRef, useEffect, useState } from 'react';
import { CanvasNode } from './types';
import { 
  Type, 
  Image, 
  Table, 
  Minus, 
  MoveVertical, 
  Square,
  Heading,
  Group,
} from 'lucide-react';

interface CanvasMinimapProps {
  nodes: CanvasNode[];
  canvasWidth: number;
  canvasHeight: number;
  viewportRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  selectedNodeIds: Set<string>;
  onViewportChange?: (x: number, y: number) => void;
}

// Scale factor for minimap
const MINIMAP_WIDTH = 140;
const MINIMAP_HEIGHT = 198; // Maintain A4 aspect ratio

export const CanvasMinimap: React.FC<CanvasMinimapProps> = ({
  nodes,
  canvasWidth,
  canvasHeight,
  viewportRect,
  selectedNodeIds,
  onViewportChange,
}) => {
  const minimapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const scaleX = MINIMAP_WIDTH / canvasWidth;
  const scaleY = MINIMAP_HEIGHT / canvasHeight;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.type === 'mousemove') return;
    if (!minimapRef.current || !viewportRect || !onViewportChange) return;

    const rect = minimapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scaleX - viewportRect.width / 2;
    const y = (e.clientY - rect.top) / scaleY - viewportRect.height / 2;

    onViewportChange(
      Math.max(0, Math.min(canvasWidth - viewportRect.width, x)),
      Math.max(0, Math.min(canvasHeight - viewportRect.height, y))
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  // Get color for node type
  const getNodeColor = (type: string, isSelected: boolean) => {
    if (isSelected) return 'hsl(var(--primary))';
    
    switch (type) {
      case 'heading':
        return 'hsl(var(--primary) / 0.7)';
      case 'text':
        return 'hsl(var(--muted-foreground) / 0.6)';
      case 'image':
        return 'hsl(220 70% 50% / 0.6)';
      case 'table':
        return 'hsl(150 60% 40% / 0.6)';
      case 'divider':
        return 'hsl(var(--border))';
      case 'group':
        return 'hsl(280 60% 50% / 0.5)';
      default:
        return 'hsl(var(--muted-foreground) / 0.4)';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-2 py-1.5 border-b border-border bg-muted/30">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Overview
        </span>
      </div>

      {/* Minimap Canvas */}
      <div
        ref={minimapRef}
        className="relative bg-background cursor-crosshair"
        style={{
          width: MINIMAP_WIDTH,
          height: MINIMAP_HEIGHT,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * scaleX}px ${20 * scaleY}px`,
          }}
        />

        {/* Nodes */}
        {nodes.map((node) => {
          const x = (node.x ?? 0) * scaleX;
          const y = (node.y ?? 0) * scaleY;
          const width = Math.max(4, (node.width ?? 200) * scaleX);
          const height = Math.max(3, (node.height ?? 60) * scaleY);
          const isSelected = selectedNodeIds.has(node.id);

          return (
            <div
              key={node.id}
              className={`absolute rounded-sm transition-colors ${isSelected ? 'ring-1 ring-primary' : ''}`}
              style={{
                left: x,
                top: y,
                width,
                height,
                backgroundColor: getNodeColor(node.type, isSelected),
                minWidth: 4,
                minHeight: 3,
              }}
              title={`${node.type}: ${node.content?.slice(0, 20) || node.id}`}
            />
          );
        })}

        {/* Viewport indicator */}
        {viewportRect && (
          <div
            className="absolute border-2 border-primary bg-primary/10 rounded pointer-events-none"
            style={{
              left: viewportRect.x * scaleX,
              top: viewportRect.y * scaleY,
              width: viewportRect.width * scaleX,
              height: viewportRect.height * scaleY,
            }}
          />
        )}
      </div>

      {/* Stats */}
      <div className="px-2 py-1.5 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">
          {nodes.length} element{nodes.length !== 1 ? 's' : ''}
        </span>
        {selectedNodeIds.size > 0 && (
          <span className="text-[9px] text-primary font-medium">
            {selectedNodeIds.size} selected
          </span>
        )}
      </div>
    </div>
  );
};

export default CanvasMinimap;
