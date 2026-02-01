import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterHorizontal,
  AlignCenterVertical,
  Group,
  Trash2,
  Copy,
  X,
} from 'lucide-react';
import { CanvasNode } from './types';

interface MultiSelectToolbarProps {
  selectedNodes: CanvasNode[];
  onAlign: (type: 'left' | 'right' | 'centerH' | 'top' | 'bottom' | 'centerV') => void;
  onDistribute: (type: 'horizontal' | 'vertical') => void;
  onGroup: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  position: { x: number; y: number };
}

const DEFAULT_NODE_HEIGHT = 80;

export const MultiSelectToolbar: React.FC<MultiSelectToolbarProps> = ({
  selectedNodes,
  onAlign,
  onDistribute,
  onGroup,
  onDuplicate,
  onDelete,
  onClearSelection,
  position,
}) => {
  const canDistribute = selectedNodes.length >= 3;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="absolute z-50 flex items-center gap-1 p-1.5 bg-card border border-border rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
        style={{
          left: position.x,
          top: position.y - 50,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Selection count badge */}
        <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded mr-1">
          {selectedNodes.length} selected
        </div>

        {/* Alignment buttons */}
        <div className="flex items-center border-r border-border pr-1 mr-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onAlign('left')}
              >
                <AlignStartHorizontal className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Align Left
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onAlign('centerH')}
              >
                <AlignCenterHorizontal className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Align Center
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onAlign('right')}
              >
                <AlignEndHorizontal className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Align Right
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onAlign('top')}
              >
                <AlignStartVertical className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Align Top
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onAlign('centerV')}
              >
                <AlignCenterVertical className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Align Middle
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onAlign('bottom')}
              >
                <AlignEndVertical className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Align Bottom
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Distribution buttons */}
        <div className="flex items-center border-r border-border pr-1 mr-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onDistribute('horizontal')}
                disabled={!canDistribute}
              >
                <AlignHorizontalSpaceAround className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Distribute Horizontally
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onDistribute('vertical')}
                disabled={!canDistribute}
              >
                <AlignVerticalSpaceAround className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Distribute Vertically
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onGroup}
              >
                <Group className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Group (Ctrl+G)
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onDuplicate}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Duplicate
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Delete
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onClearSelection}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Clear Selection
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

// Helper to calculate toolbar position based on selected nodes
export const calculateToolbarPosition = (
  nodes: CanvasNode[],
  zoom: number = 1
): { x: number; y: number } => {
  if (nodes.length === 0) {
    return { x: 0, y: 0 };
  }

  const minX = Math.min(...nodes.map(n => n.x ?? 0));
  const maxX = Math.max(...nodes.map(n => (n.x ?? 0) + (n.width ?? 200)));
  const minY = Math.min(...nodes.map(n => n.y ?? 0));

  return {
    x: ((minX + maxX) / 2) * zoom,
    y: minY * zoom,
  };
};

export default MultiSelectToolbar;
