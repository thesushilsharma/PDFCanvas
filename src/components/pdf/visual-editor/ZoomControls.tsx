import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
}

const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
  minZoom = 0.25,
  maxZoom = 3,
}) => {
  const zoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, maxZoom);
    onZoomChange(Math.round(newZoom * 100) / 100);
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, minZoom);
    onZoomChange(Math.round(newZoom * 100) / 100);
  };

  const resetZoom = () => {
    onZoomChange(1);
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-sm">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={zoomOut}
              disabled={zoom <= minZoom}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Zoom out</p>
          </TooltipContent>
        </Tooltip>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-mono min-w-[52px]"
            >
              {zoomPercent}%
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" side="top">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Zoom Level</span>
                <span className="text-xs font-mono">{zoomPercent}%</span>
              </div>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => onZoomChange(value)}
                min={minZoom}
                max={maxZoom}
                step={0.05}
                className="w-full"
              />
              <div className="flex flex-wrap gap-1">
                {ZOOM_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    variant={zoom === preset ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => onZoomChange(preset)}
                  >
                    {preset * 100}%
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={zoomIn}
              disabled={zoom >= maxZoom}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Zoom in</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={resetZoom}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Reset to 100%</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ZoomControls;
