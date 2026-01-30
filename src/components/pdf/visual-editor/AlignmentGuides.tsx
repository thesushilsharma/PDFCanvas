import React from 'react';

export interface Guide {
  type: 'vertical' | 'horizontal';
  position: number;
  start: number;
  end: number;
  alignmentType?: 'edge' | 'center' | 'canvas' | 'spacing' | 'connection';
}

export interface EdgeConnection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'left' | 'right' | 'top' | 'bottom';
}

export interface SpacingIndicator {
  x: number;
  y: number;
  distance: number;
  orientation: 'horizontal' | 'vertical';
  isEqualSpacing?: boolean;
}

interface AlignmentGuidesProps {
  guides: Guide[];
  spacingIndicators?: SpacingIndicator[];
  edgeConnections?: EdgeConnection[];
  zoom?: number;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({ 
  guides, 
  spacingIndicators = [],
  edgeConnections = [],
  zoom = 1 
}) => {
  if (guides.length === 0 && spacingIndicators.length === 0 && edgeConnections.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 100 }}>
      {/* Alignment guides */}
      {guides.map((guide, index) => {
        const isCenter = guide.alignmentType === 'center';
        const isCanvas = guide.alignmentType === 'canvas';
        const isSpacing = guide.alignmentType === 'spacing';
        
        return (
          <div
            key={index}
            className={`absolute ${
              isSpacing 
                ? 'bg-amber-500' 
                : isCenter 
                  ? 'bg-accent-foreground' 
                  : isCanvas 
                    ? 'bg-destructive' 
                    : 'bg-primary'
            }`}
            style={
              guide.type === 'vertical'
                ? {
                    left: guide.position * zoom,
                    top: guide.start * zoom,
                    width: 1,
                    height: (guide.end - guide.start) * zoom,
                  }
                : {
                    left: guide.start * zoom,
                    top: guide.position * zoom,
                    width: (guide.end - guide.start) * zoom,
                    height: 1,
                  }
            }
          >
            {/* Dashed pattern for center guides */}
            {isCenter && (
              <div 
                className="absolute inset-0"
                style={{
                  background: guide.type === 'vertical'
                    ? 'repeating-linear-gradient(to bottom, transparent, transparent 3px, hsl(var(--primary)) 3px, hsl(var(--primary)) 6px)'
                    : 'repeating-linear-gradient(to right, transparent, transparent 3px, hsl(var(--primary)) 3px, hsl(var(--primary)) 6px)',
                }}
              />
            )}
            {/* End markers */}
            <div
              className={`absolute rounded-full ${
                isSpacing 
                  ? 'bg-amber-500' 
                  : isCenter 
                    ? 'bg-accent-foreground' 
                    : isCanvas 
                      ? 'bg-destructive' 
                      : 'bg-primary'
              }`}
              style={
                guide.type === 'vertical'
                  ? { left: -2, top: -2, width: 5, height: 5 }
                  : { left: -2, top: -2, width: 5, height: 5 }
              }
            />
            <div
              className={`absolute rounded-full ${
                isSpacing 
                  ? 'bg-amber-500' 
                  : isCenter 
                    ? 'bg-accent-foreground' 
                    : isCanvas 
                      ? 'bg-destructive' 
                      : 'bg-primary'
              }`}
              style={
                guide.type === 'vertical'
                  ? { left: -2, bottom: -2, width: 5, height: 5 }
                  : { right: -2, top: -2, width: 5, height: 5 }
              }
            />
            {/* Distance indicator */}
            {!isCenter && !isSpacing && (
              <div
                className={`absolute text-[8px] font-mono px-1 rounded ${isCanvas ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}
                style={
                  guide.type === 'vertical'
                    ? { left: 4, top: '50%', transform: 'translateY(-50%)' }
                    : { top: -12, left: '50%', transform: 'translateX(-50%)' }
                }
              >
                {Math.round(guide.position)}
              </div>
            )}
          </div>
        );
      })}

      {/* Spacing indicators between elements */}
      {spacingIndicators.map((indicator, index) => {
        const isEqual = indicator.isEqualSpacing;
        const color = isEqual ? 'hsl(142 71% 45%)' : 'hsl(38 92% 50%)'; // Green for equal, amber for regular
        
        return (
          <div
            key={`spacing-${index}`}
            className="absolute flex items-center justify-center"
            style={{
              left: indicator.x * zoom,
              top: indicator.y * zoom,
            }}
          >
            {/* Distance measurement line */}
            <div className="relative">
              {indicator.orientation === 'horizontal' ? (
                <div className="flex items-center">
                  <div className="w-[1px] h-3" style={{ backgroundColor: color }} />
                  <div 
                    className="h-[1px]" 
                    style={{ 
                      width: indicator.distance * zoom,
                      backgroundColor: color,
                      backgroundImage: `repeating-linear-gradient(to right, ${color}, ${color} 4px, transparent 4px, transparent 8px)`,
                    }}
                  />
                  <div className="w-[1px] h-3" style={{ backgroundColor: color }} />
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-[1px] w-3" style={{ backgroundColor: color }} />
                  <div 
                    className="w-[1px]" 
                    style={{ 
                      height: indicator.distance * zoom,
                      backgroundColor: color,
                      backgroundImage: `repeating-linear-gradient(to bottom, ${color}, ${color} 4px, transparent 4px, transparent 8px)`,
                    }}
                  />
                  <div className="h-[1px] w-3" style={{ backgroundColor: color }} />
                </div>
              )}
              {/* Distance label */}
              <div 
                className="absolute text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap flex items-center gap-1"
                style={{
                  backgroundColor: color,
                  left: indicator.orientation === 'horizontal' ? '50%' : '100%',
                  top: indicator.orientation === 'horizontal' ? '-16px' : '50%',
                  transform: indicator.orientation === 'horizontal' 
                    ? 'translateX(-50%)' 
                    : 'translateY(-50%)',
                  marginLeft: indicator.orientation === 'vertical' ? 4 : 0,
                }}
              >
                {isEqual && <span className="text-[8px]">≡</span>}
                {Math.round(indicator.distance)}px
              </div>
            </div>
          </div>
        );
      })}

      {/* Edge connection lines - show when elements align perfectly at edges */}
      {edgeConnections.map((connection, index) => {
        const isVertical = connection.x1 === connection.x2;
        const length = isVertical 
          ? Math.abs(connection.y2 - connection.y1)
          : Math.abs(connection.x2 - connection.x1);

        return (
          <div
            key={`connection-${index}`}
            className="absolute pointer-events-none"
            style={{
              left: Math.min(connection.x1, connection.x2) * zoom,
              top: Math.min(connection.y1, connection.y2) * zoom,
              width: isVertical ? 2 : length * zoom,
              height: isVertical ? length * zoom : 2,
            }}
          >
            {/* Dashed connection line */}
            <div
              className="absolute inset-0"
              style={{
                background: isVertical
                  ? 'repeating-linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--primary)) 4px, transparent 4px, transparent 8px)'
                  : 'repeating-linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary)) 4px, transparent 4px, transparent 8px)',
                opacity: 0.8,
              }}
            />
            {/* Connection point markers */}
            <div
              className="absolute w-2 h-2 rounded-full bg-primary border border-primary-foreground"
              style={{
                left: isVertical ? -3 : -3,
                top: isVertical ? -3 : -3,
              }}
            />
            <div
              className="absolute w-2 h-2 rounded-full bg-primary border border-primary-foreground"
              style={{
                right: isVertical ? -3 : -3,
                bottom: isVertical ? -3 : -3,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

// Threshold in pixels for snapping
const SNAP_THRESHOLD = 8;
// Threshold for showing spacing indicators
const SPACING_THRESHOLD = 100;

export interface NodeBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

export interface SnapResult {
  x: number | null;
  y: number | null;
  guides: Guide[];
  spacingIndicators: SpacingIndicator[];
  edgeConnections: EdgeConnection[];
}

export const calculateNodeBounds = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number
): NodeBounds => ({
  id,
  left: x,
  right: x + width,
  top: y,
  bottom: y + height,
  centerX: x + width / 2,
  centerY: y + height / 2,
});

export const findAlignmentSnaps = (
  movingNode: NodeBounds,
  otherNodes: NodeBounds[],
  canvasWidth: number,
  canvasHeight: number
): SnapResult => {
  let snapX: number | null = null;
  let snapY: number | null = null;
  const guides: Guide[] = [];
  const spacingIndicators: SpacingIndicator[] = [];
  const edgeConnections: EdgeConnection[] = [];

  // Check canvas edges
  const canvasBounds: NodeBounds = {
    id: 'canvas',
    left: 0,
    right: canvasWidth,
    top: 0,
    bottom: canvasHeight,
    centerX: canvasWidth / 2,
    centerY: canvasHeight / 2,
  };

  const allBounds = [...otherNodes, canvasBounds];

  // Collect all existing gaps between nodes for equal spacing detection
  const existingHorizontalGaps: number[] = [];
  const existingVerticalGaps: number[] = [];

  for (let i = 0; i < otherNodes.length; i++) {
    for (let j = i + 1; j < otherNodes.length; j++) {
      const a = otherNodes[i];
      const b = otherNodes[j];

      // Horizontal gaps
      if (a.right < b.left) {
        existingHorizontalGaps.push(b.left - a.right);
      } else if (b.right < a.left) {
        existingHorizontalGaps.push(a.left - b.right);
      }

      // Vertical gaps
      if (a.bottom < b.top) {
        existingVerticalGaps.push(b.top - a.bottom);
      } else if (b.bottom < a.top) {
        existingVerticalGaps.push(a.top - b.bottom);
      }
    }
  }

  for (const target of allBounds) {
    if (target.id === movingNode.id) continue;
    
    const isCanvas = target.id === 'canvas';

    // Vertical alignments (x-axis)
    const verticalChecks = [
      { moving: movingNode.left, target: target.left, alignmentType: 'edge' as const },
      { moving: movingNode.left, target: target.right, alignmentType: 'edge' as const },
      { moving: movingNode.right, target: target.left, alignmentType: 'edge' as const },
      { moving: movingNode.right, target: target.right, alignmentType: 'edge' as const },
      { moving: movingNode.centerX, target: target.centerX, alignmentType: 'center' as const },
    ];

    for (const check of verticalChecks) {
      if (Math.abs(check.moving - check.target) < SNAP_THRESHOLD) {
        if (snapX === null) {
          const offset = check.target - check.moving;
          snapX = movingNode.left + offset;
        }
        guides.push({
          type: 'vertical',
          position: check.target,
          start: Math.min(movingNode.top, target.top),
          end: Math.max(movingNode.bottom, target.bottom),
          alignmentType: isCanvas ? 'canvas' : check.alignmentType,
        });

        // Add edge connection lines when edges align perfectly (not canvas)
        if (!isCanvas && check.alignmentType === 'edge' && Math.abs(check.moving - check.target) < 2) {
          // Check if there's vertical overlap for a connection line
          const overlapTop = Math.max(movingNode.top, target.top);
          const overlapBottom = Math.min(movingNode.bottom, target.bottom);
          
          if (overlapBottom > overlapTop) {
            edgeConnections.push({
              x1: check.target,
              y1: overlapTop,
              x2: check.target,
              y2: overlapBottom,
              type: check.moving === movingNode.left ? 'left' : 'right',
            });
          }
        }
      }
    }

    // Horizontal alignments (y-axis)
    const horizontalChecks = [
      { moving: movingNode.top, target: target.top, alignmentType: 'edge' as const },
      { moving: movingNode.top, target: target.bottom, alignmentType: 'edge' as const },
      { moving: movingNode.bottom, target: target.top, alignmentType: 'edge' as const },
      { moving: movingNode.bottom, target: target.bottom, alignmentType: 'edge' as const },
      { moving: movingNode.centerY, target: target.centerY, alignmentType: 'center' as const },
    ];

    for (const check of horizontalChecks) {
      if (Math.abs(check.moving - check.target) < SNAP_THRESHOLD) {
        if (snapY === null) {
          const offset = check.target - check.moving;
          snapY = movingNode.top + offset;
        }
        guides.push({
          type: 'horizontal',
          position: check.target,
          start: Math.min(movingNode.left, target.left),
          end: Math.max(movingNode.right, target.right),
          alignmentType: isCanvas ? 'canvas' : check.alignmentType,
        });

        // Add edge connection lines when edges align perfectly (not canvas)
        if (!isCanvas && check.alignmentType === 'edge' && Math.abs(check.moving - check.target) < 2) {
          // Check if there's horizontal overlap for a connection line
          const overlapLeft = Math.max(movingNode.left, target.left);
          const overlapRight = Math.min(movingNode.right, target.right);
          
          if (overlapRight > overlapLeft) {
            edgeConnections.push({
              x1: overlapLeft,
              y1: check.target,
              x2: overlapRight,
              y2: check.target,
              type: check.moving === movingNode.top ? 'top' : 'bottom',
            });
          }
        }
      }
    }
  }

  // Calculate spacing indicators and check for equal spacing
  for (const target of otherNodes) {
    if (target.id === movingNode.id) continue;

    // Check horizontal gap (moving node is to the right of target)
    if (movingNode.left > target.right) {
      const gap = movingNode.left - target.right;
      const verticalOverlap = 
        Math.min(movingNode.bottom, target.bottom) - Math.max(movingNode.top, target.top);
      
      if (gap < SPACING_THRESHOLD && gap > 2 && verticalOverlap > 0) {
        // Check if this gap matches any existing gap (equal spacing)
        const matchingGap = existingHorizontalGaps.find(g => Math.abs(g - gap) < SNAP_THRESHOLD);
        const isEqualSpacing = matchingGap !== undefined;

        // Snap to equal spacing if close
        if (isEqualSpacing && snapX === null) {
          const targetGap = matchingGap;
          const snapPosition = target.right + targetGap;
          if (Math.abs(movingNode.left - snapPosition) < SNAP_THRESHOLD) {
            snapX = snapPosition;
          }
        }

        spacingIndicators.push({
          x: target.right,
          y: Math.max(movingNode.top, target.top) + verticalOverlap / 2 - 6,
          distance: gap,
          orientation: 'horizontal',
          isEqualSpacing,
        });
      }
    }

    // Check horizontal gap (moving node is to the left of target)
    if (movingNode.right < target.left) {
      const gap = target.left - movingNode.right;
      const verticalOverlap = 
        Math.min(movingNode.bottom, target.bottom) - Math.max(movingNode.top, target.top);
      
      if (gap < SPACING_THRESHOLD && gap > 2 && verticalOverlap > 0) {
        const matchingGap = existingHorizontalGaps.find(g => Math.abs(g - gap) < SNAP_THRESHOLD);
        const isEqualSpacing = matchingGap !== undefined;

        if (isEqualSpacing && snapX === null) {
          const targetGap = matchingGap;
          const snapPosition = target.left - targetGap - (movingNode.right - movingNode.left);
          if (Math.abs(movingNode.left - snapPosition) < SNAP_THRESHOLD) {
            snapX = snapPosition;
          }
        }

        spacingIndicators.push({
          x: movingNode.right,
          y: Math.max(movingNode.top, target.top) + verticalOverlap / 2 - 6,
          distance: gap,
          orientation: 'horizontal',
          isEqualSpacing,
        });
      }
    }

    // Check vertical gap (moving node is below target)
    if (movingNode.top > target.bottom) {
      const gap = movingNode.top - target.bottom;
      const horizontalOverlap = 
        Math.min(movingNode.right, target.right) - Math.max(movingNode.left, target.left);
      
      if (gap < SPACING_THRESHOLD && gap > 2 && horizontalOverlap > 0) {
        const matchingGap = existingVerticalGaps.find(g => Math.abs(g - gap) < SNAP_THRESHOLD);
        const isEqualSpacing = matchingGap !== undefined;

        if (isEqualSpacing && snapY === null) {
          const targetGap = matchingGap;
          const snapPosition = target.bottom + targetGap;
          if (Math.abs(movingNode.top - snapPosition) < SNAP_THRESHOLD) {
            snapY = snapPosition;
          }
        }

        spacingIndicators.push({
          x: Math.max(movingNode.left, target.left) + horizontalOverlap / 2 - 6,
          y: target.bottom,
          distance: gap,
          orientation: 'vertical',
          isEqualSpacing,
        });
      }
    }

    // Check vertical gap (moving node is above target)
    if (movingNode.bottom < target.top) {
      const gap = target.top - movingNode.bottom;
      const horizontalOverlap = 
        Math.min(movingNode.right, target.right) - Math.max(movingNode.left, target.left);
      
      if (gap < SPACING_THRESHOLD && gap > 2 && horizontalOverlap > 0) {
        const matchingGap = existingVerticalGaps.find(g => Math.abs(g - gap) < SNAP_THRESHOLD);
        const isEqualSpacing = matchingGap !== undefined;

        if (isEqualSpacing && snapY === null) {
          const targetGap = matchingGap;
          const snapPosition = target.top - targetGap - (movingNode.bottom - movingNode.top);
          if (Math.abs(movingNode.top - snapPosition) < SNAP_THRESHOLD) {
            snapY = snapPosition;
          }
        }

        spacingIndicators.push({
          x: Math.max(movingNode.left, target.left) + horizontalOverlap / 2 - 6,
          y: movingNode.bottom,
          distance: gap,
          orientation: 'vertical',
          isEqualSpacing,
        });
      }
    }
  }

  return { x: snapX, y: snapY, guides, spacingIndicators, edgeConnections };
};

export default AlignmentGuides;
