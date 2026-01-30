import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from '@/components/ui/context-menu';
import {
  Copy,
  ClipboardPaste,
  Trash2,
  Lock,
  Unlock,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  Group,
  Ungroup,
  Layers,
} from 'lucide-react';
import { CanvasNode } from './types';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  node: CanvasNode;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onLock: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  canPaste: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isGrouped?: boolean;
  hasMultipleSelected?: boolean;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  children,
  node,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onLock,
  onBringToFront,
  onSendToBack,
  onMoveUp,
  onMoveDown,
  onGroup,
  onUngroup,
  canPaste,
  canMoveUp,
  canMoveDown,
  isGrouped = false,
  hasMultipleSelected = false,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onPaste} disabled={!canPaste}>
          <ClipboardPaste className="mr-2 h-4 w-4" />
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Layers className="mr-2 h-4 w-4" />
            Layer Order
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={onBringToFront}>
              <ArrowUpToLine className="mr-2 h-4 w-4" />
              Bring to Front
            </ContextMenuItem>
            <ContextMenuItem onClick={onMoveUp} disabled={!canMoveUp}>
              <ChevronUp className="mr-2 h-4 w-4" />
              Move Up
            </ContextMenuItem>
            <ContextMenuItem onClick={onMoveDown} disabled={!canMoveDown}>
              <ChevronDown className="mr-2 h-4 w-4" />
              Move Down
            </ContextMenuItem>
            <ContextMenuItem onClick={onSendToBack}>
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Send to Back
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSeparator />
        
        {hasMultipleSelected && onGroup && (
          <ContextMenuItem onClick={onGroup}>
            <Group className="mr-2 h-4 w-4" />
            Group Elements
            <ContextMenuShortcut>⌘G</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        
        {isGrouped && onUngroup && (
          <ContextMenuItem onClick={onUngroup}>
            <Ungroup className="mr-2 h-4 w-4" />
            Ungroup
            <ContextMenuShortcut>⇧⌘G</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        
        <ContextMenuItem onClick={onLock}>
          {node.locked ? (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              Unlock
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Lock
            </>
          )}
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default CanvasContextMenu;
