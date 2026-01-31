import React from 'react';

interface GridOverlayProps {
  gridSize: number; // in mm
  visible: boolean;
  width: number;
  height: number;
}

// Convert mm to pixels (assuming 96 DPI, 1 inch = 25.4mm)
const mmToPixels = (mm: number) => (mm / 25.4) * 96;

export const GridOverlay: React.FC<GridOverlayProps> = ({
  gridSize,
  visible,
  width,
  height,
}) => {
  if (!visible) return null;

  const gridPixels = mmToPixels(gridSize);
  const cols = Math.ceil(width / gridPixels);
  const rows = Math.ceil(height / gridPixels);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width={gridPixels}
            height={gridPixels}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridPixels} 0 L 0 0 0 ${gridPixels}`}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </pattern>
          {/* Major grid lines every 10mm */}
          <pattern
            id="grid-pattern-major"
            width={gridPixels * 2}
            height={gridPixels * 2}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridPixels * 2} 0 L 0 0 0 ${gridPixels * 2}`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        <rect width="100%" height="100%" fill="url(#grid-pattern-major)" />
      </svg>
      
      {/* Corner indicator */}
      <div className="absolute top-0 left-0 px-1.5 py-0.5 bg-primary/10 text-[9px] text-primary font-mono rounded-br">
        {gridSize}mm grid
      </div>
    </div>
  );
};

// Snap value to grid
export const snapToGrid = (value: number, gridSize: number): number => {
  const gridPixels = mmToPixels(gridSize);
  return Math.round(value / gridPixels) * gridPixels;
};

// Convert pixels to mm
export const pixelsToMm = (pixels: number): number => {
  return (pixels / 96) * 25.4;
};

export default GridOverlay;
