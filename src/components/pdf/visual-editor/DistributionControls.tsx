import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterHorizontal,
  AlignCenterVertical,
} from 'lucide-react';
import { CanvasNode } from './types';

interface DistributionControlsProps {
  selectedNodes: CanvasNode[];
  onDistribute: (nodes: CanvasNode[]) => void;
  disabled?: boolean;
}

const DEFAULT_NODE_HEIGHT = 80;

export const DistributionControls: React.FC<DistributionControlsProps> = ({
  selectedNodes,
  onDistribute,
  disabled = false,
}) => {
  const canDistribute = selectedNodes.length >= 3;
  const canAlign = selectedNodes.length >= 2;

  const distributeHorizontally = () => {
    if (!canDistribute) return;

    const sorted = [...selectedNodes].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    const startX = first.x ?? 0;
    const endX = (last.x ?? 0) + (last.width ?? 200);
    const totalWidth = endX - startX;
    const nodeWidths = sorted.reduce((sum, n) => sum + (n.width ?? 200), 0);
    const spacing = (totalWidth - nodeWidths) / (sorted.length - 1);

    let currentX = startX;
    const updated = sorted.map((node, idx) => {
      const newNode = { ...node, x: idx === 0 ? node.x : currentX };
      currentX = (idx === 0 ? (node.x ?? 0) : currentX) + (node.width ?? 200) + spacing;
      return newNode;
    });

    onDistribute(updated);
  };

  const distributeVertically = () => {
    if (!canDistribute) return;

    const sorted = [...selectedNodes].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    const startY = first.y ?? 0;
    const endY = (last.y ?? 0) + (last.height ?? DEFAULT_NODE_HEIGHT);
    const totalHeight = endY - startY;
    const nodeHeights = sorted.reduce((sum, n) => sum + (n.height ?? DEFAULT_NODE_HEIGHT), 0);
    const spacing = (totalHeight - nodeHeights) / (sorted.length - 1);

    let currentY = startY;
    const updated = sorted.map((node, idx) => {
      const newNode = { ...node, y: idx === 0 ? node.y : currentY };
      currentY = (idx === 0 ? (node.y ?? 0) : currentY) + (node.height ?? DEFAULT_NODE_HEIGHT) + spacing;
      return newNode;
    });

    onDistribute(updated);
  };

  const alignLeft = () => {
    if (!canAlign) return;
    const minX = Math.min(...selectedNodes.map(n => n.x ?? 0));
    const updated = selectedNodes.map(node => ({ ...node, x: minX }));
    onDistribute(updated);
  };

  const alignRight = () => {
    if (!canAlign) return;
    const maxRight = Math.max(...selectedNodes.map(n => (n.x ?? 0) + (n.width ?? 200)));
    const updated = selectedNodes.map(node => ({ 
      ...node, 
      x: maxRight - (node.width ?? 200) 
    }));
    onDistribute(updated);
  };

  const alignCenterH = () => {
    if (!canAlign) return;
    const centers = selectedNodes.map(n => (n.x ?? 0) + (n.width ?? 200) / 2);
    const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
    const updated = selectedNodes.map(node => ({ 
      ...node, 
      x: avgCenter - (node.width ?? 200) / 2 
    }));
    onDistribute(updated);
  };

  const alignTop = () => {
    if (!canAlign) return;
    const minY = Math.min(...selectedNodes.map(n => n.y ?? 0));
    const updated = selectedNodes.map(node => ({ ...node, y: minY }));
    onDistribute(updated);
  };

  const alignBottom = () => {
    if (!canAlign) return;
    const maxBottom = Math.max(...selectedNodes.map(n => (n.y ?? 0) + (n.height ?? DEFAULT_NODE_HEIGHT)));
    const updated = selectedNodes.map(node => ({ 
      ...node, 
      y: maxBottom - (node.height ?? DEFAULT_NODE_HEIGHT) 
    }));
    onDistribute(updated);
  };

  const alignCenterV = () => {
    if (!canAlign) return;
    const centers = selectedNodes.map(n => (n.y ?? 0) + (n.height ?? DEFAULT_NODE_HEIGHT) / 2);
    const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
    const updated = selectedNodes.map(node => ({ 
      ...node, 
      y: avgCenter - (node.height ?? DEFAULT_NODE_HEIGHT) / 2 
    }));
    onDistribute(updated);
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={disabled || !canAlign}
            >
              <AlignHorizontalSpaceAround className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Align & Distribute</p>
        </TooltipContent>
      </Tooltip>
      
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs">Align</DropdownMenuLabel>
        <DropdownMenuItem onClick={alignLeft} disabled={!canAlign}>
          <AlignStartHorizontal className="mr-2 h-4 w-4" />
          Align Left
        </DropdownMenuItem>
        <DropdownMenuItem onClick={alignCenterH} disabled={!canAlign}>
          <AlignCenterHorizontal className="mr-2 h-4 w-4" />
          Align Center Horizontal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={alignRight} disabled={!canAlign}>
          <AlignEndHorizontal className="mr-2 h-4 w-4" />
          Align Right
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={alignTop} disabled={!canAlign}>
          <AlignStartVertical className="mr-2 h-4 w-4" />
          Align Top
        </DropdownMenuItem>
        <DropdownMenuItem onClick={alignCenterV} disabled={!canAlign}>
          <AlignCenterVertical className="mr-2 h-4 w-4" />
          Align Center Vertical
        </DropdownMenuItem>
        <DropdownMenuItem onClick={alignBottom} disabled={!canAlign}>
          <AlignEndVertical className="mr-2 h-4 w-4" />
          Align Bottom
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Distribute (3+ elements)</DropdownMenuLabel>
        <DropdownMenuItem onClick={distributeHorizontally} disabled={!canDistribute}>
          <AlignHorizontalJustifyCenter className="mr-2 h-4 w-4" />
          Distribute Horizontally
        </DropdownMenuItem>
        <DropdownMenuItem onClick={distributeVertically} disabled={!canDistribute}>
          <AlignVerticalJustifyCenter className="mr-2 h-4 w-4" />
          Distribute Vertically
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DistributionControls;
