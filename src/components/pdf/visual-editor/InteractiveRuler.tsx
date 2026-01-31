import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface CustomGuide {
  id: string;
  position: number; // in pixels
  orientation: 'horizontal' | 'vertical';
}

interface InteractiveRulerProps {
  orientation: 'horizontal' | 'vertical';
  length: number; // in pixels
  gridSize: number; // grid size in pixels (for major ticks)
  guides: CustomGuide[];
  onAddGuide: (position: number, orientation: 'horizontal' | 'vertical') => void;
  onRemoveGuide: (id: string) => void;
  zoom?: number;
}

// Conversion: 1mm ≈ 3.78 pixels at 96 DPI
const MM_TO_PX = 3.78;
const MAJOR_TICK_INTERVAL = 10; // Major tick every 10mm
const MINOR_TICK_INTERVAL = 5; // Medium tick every 5mm

export const InteractiveRuler: React.FC<InteractiveRulerProps> = ({
  orientation,
  length,
  gridSize,
  guides,
  onAddGuide,
  onRemoveGuide,
  zoom = 1,
}) => {
  const isHorizontal = orientation === 'horizontal';
  const totalMm = Math.ceil(length / MM_TO_PX);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [previewGuide, setPreviewGuide] = useState<number | null>(null);
  
  // Generate tick marks
  const ticks: { position: number; type: 'major' | 'medium' | 'minor'; label?: string }[] = [];
  
  for (let mm = 0; mm <= totalMm; mm++) {
    const position = mm * MM_TO_PX;
    if (position > length) break;
    
    if (mm % MAJOR_TICK_INTERVAL === 0) {
      ticks.push({ position, type: 'major', label: `${mm}` });
    } else if (mm % MINOR_TICK_INTERVAL === 0) {
      ticks.push({ position, type: 'medium' });
    } else {
      ticks.push({ position, type: 'minor' });
    }
  }

  // Filter guides for this orientation
  const orientationGuides = guides.filter(g => g.orientation === orientation);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = isHorizontal 
      ? (e.clientX - rect.left) 
      : (e.clientY - rect.top);
    
    // Snap to grid
    const snappedPosition = Math.round(position / (gridSize * MM_TO_PX)) * (gridSize * MM_TO_PX);
    onAddGuide(snappedPosition, orientation);
    setPreviewGuide(null);
  }, [isHorizontal, gridSize, onAddGuide, orientation]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = isHorizontal 
      ? (e.clientX - rect.left)
      : (e.clientY - rect.top);
    
    // Snap to grid for preview
    const snappedPosition = Math.round(position / (gridSize * MM_TO_PX)) * (gridSize * MM_TO_PX);
    setHoverPosition(position);
    setPreviewGuide(snappedPosition);
  }, [isHorizontal, gridSize]);

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
    setPreviewGuide(null);
  }, []);

  return (
    <div
      className={cn(
        'absolute bg-muted/80 backdrop-blur-sm select-none cursor-crosshair group',
        isHorizontal ? 'left-6 top-0 h-6' : 'left-0 top-6 w-6'
      )}
      style={{
        [isHorizontal ? 'width' : 'height']: length,
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ruler background */}
      <div className={cn(
        'absolute inset-0 border-border',
        isHorizontal ? 'border-b' : 'border-r'
      )} />
      
      {/* Ticks and labels */}
      {ticks.map((tick, index) => (
        <div
          key={index}
          className={cn(
            'absolute pointer-events-none',
            isHorizontal ? 'bottom-0' : 'right-0'
          )}
          style={{
            [isHorizontal ? 'left' : 'top']: tick.position,
          }}
        >
          {/* Tick mark */}
          <div
            className={cn(
              'bg-muted-foreground/60',
              isHorizontal ? 'w-px' : 'h-px',
              tick.type === 'major' && (isHorizontal ? 'h-3' : 'w-3'),
              tick.type === 'medium' && (isHorizontal ? 'h-2' : 'w-2'),
              tick.type === 'minor' && (isHorizontal ? 'h-1' : 'w-1')
            )}
          />
          
          {/* Label for major ticks */}
          {tick.type === 'major' && tick.label && (
            <span
              className={cn(
                'absolute text-[9px] text-muted-foreground font-mono pointer-events-none',
                isHorizontal 
                  ? 'top-0.5 -translate-x-1/2' 
                  : 'left-0.5 -translate-y-1/2 -rotate-90 origin-left'
              )}
              style={{
                [isHorizontal ? 'left' : 'top']: 0,
              }}
            >
              {tick.label}
            </span>
          )}
        </div>
      ))}

      {/* Preview guide line */}
      {previewGuide !== null && (
        <div
          className={cn(
            'absolute bg-primary/40 pointer-events-none',
            isHorizontal ? 'w-px h-full top-0' : 'h-px w-full left-0'
          )}
          style={{
            [isHorizontal ? 'left' : 'top']: previewGuide,
          }}
        />
      )}

      {/* Guide markers on ruler */}
      {orientationGuides.map((guide) => (
        <div
          key={guide.id}
          className={cn(
            'absolute flex items-center justify-center group/guide',
            isHorizontal 
              ? 'bottom-0 h-full w-3 -translate-x-1/2' 
              : 'right-0 w-full h-3 -translate-y-1/2'
          )}
          style={{
            [isHorizontal ? 'left' : 'top']: guide.position,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemoveGuide(guide.id);
          }}
        >
          <div 
            className={cn(
              'bg-primary transition-colors hover:bg-destructive',
              isHorizontal ? 'w-0.5 h-full' : 'h-0.5 w-full'
            )} 
          />
          <div className={cn(
            'absolute bg-primary text-primary-foreground rounded-sm opacity-0 group-hover/guide:opacity-100 transition-opacity flex items-center justify-center',
            isHorizontal ? 'top-0 w-3 h-3' : 'left-0 w-3 h-3'
          )}>
            <X className="h-2 w-2" />
          </div>
        </div>
      ))}
      
      {/* Corner piece */}
      <div
        className={cn(
          'absolute bg-muted/80 border-border flex items-center justify-center',
          isHorizontal 
            ? 'left-[-24px] top-0 w-6 h-6 border-b border-r' 
            : 'left-0 top-[-24px] w-6 h-6 border-b border-r'
        )}
      >
        {isHorizontal && (
          <span className="text-[8px] text-muted-foreground font-medium">mm</span>
        )}
      </div>
    </div>
  );
};

// Separate component for rendering guide lines on canvas
interface GuideLineProps {
  guide: CustomGuide;
  canvasWidth: number;
  canvasHeight: number;
}

export const GuideLine: React.FC<GuideLineProps> = ({
  guide,
  canvasWidth,
  canvasHeight,
}) => {
  const isHorizontal = guide.orientation === 'horizontal';
  
  return (
    <div
      className={cn(
        'absolute pointer-events-none z-20',
        isHorizontal 
          ? 'h-px w-full left-0' 
          : 'w-px h-full top-0'
      )}
      style={{
        [isHorizontal ? 'top' : 'left']: guide.position,
        [isHorizontal ? 'width' : 'height']: isHorizontal ? canvasWidth : canvasHeight,
        background: 'hsl(var(--primary) / 0.6)',
        boxShadow: '0 0 2px hsl(var(--primary) / 0.4)',
      }}
    >
      {/* Dashed pattern */}
      <div 
        className={cn(
          'absolute inset-0',
          isHorizontal ? 'h-px' : 'w-px'
        )}
        style={{
          background: `repeating-linear-gradient(
            ${isHorizontal ? '90deg' : '180deg'},
            hsl(var(--primary)),
            hsl(var(--primary)) 4px,
            transparent 4px,
            transparent 8px
          )`,
        }}
      />
    </div>
  );
};

export default InteractiveRuler;
