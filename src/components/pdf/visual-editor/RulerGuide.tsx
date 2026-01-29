import React from 'react';
import { cn } from '@/lib/utils';

interface RulerGuideProps {
  orientation: 'horizontal' | 'vertical';
  length: number; // in pixels
  gridSize: number; // grid size in pixels (for major ticks)
}

// Conversion: 1mm ≈ 3.78 pixels at 96 DPI
const MM_TO_PX = 3.78;
const MAJOR_TICK_INTERVAL = 10; // Major tick every 10mm
const MINOR_TICK_INTERVAL = 5; // Medium tick every 5mm

export const RulerGuide: React.FC<RulerGuideProps> = ({
  orientation,
  length,
  gridSize,
}) => {
  const isHorizontal = orientation === 'horizontal';
  const totalMm = Math.ceil(length / MM_TO_PX);
  
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

  return (
    <div
      className={cn(
        'absolute bg-muted/80 backdrop-blur-sm select-none pointer-events-none',
        isHorizontal ? 'left-6 top-0 h-6' : 'left-0 top-6 w-6'
      )}
      style={{
        [isHorizontal ? 'width' : 'height']: length,
      }}
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
            'absolute',
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
                'absolute text-[9px] text-muted-foreground font-mono',
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

export default RulerGuide;
