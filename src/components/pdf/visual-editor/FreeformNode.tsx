import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CanvasContextMenu from './CanvasContextMenu';
import {
  GripVertical, 
  Trash2, 
  Type, 
  Image, 
  Table, 
  Minus, 
  MoveVertical, 
  Square,
  Heading,
  Lock,
  Unlock,
  Move,
  Group,
} from 'lucide-react';
import { CanvasNode as CanvasNodeType, DraggableNodeType } from './types';
import RichTextEditor from './RichTextEditor';
import { snapToGrid, pixelsToMm } from './GridOverlay';

const iconMap: Record<DraggableNodeType, React.ReactNode> = {
  text: <Type className="h-4 w-4" />,
  heading: <Heading className="h-4 w-4" />,
  image: <Image className="h-4 w-4" />,
  table: <Table className="h-4 w-4" />,
  divider: <Minus className="h-4 w-4" />,
  spacer: <MoveVertical className="h-4 w-4" />,
  view: <Square className="h-4 w-4" />,
  group: <Group className="h-4 w-4" />,
};

const labelMap: Record<DraggableNodeType, string> = {
  text: 'Text Block',
  heading: 'Heading',
  image: 'Image',
  table: 'Table',
  divider: 'Divider',
  spacer: 'Spacer',
  view: 'Container',
  group: 'Group',
};

interface FreeformNodeProps {
  node: CanvasNodeType;
  isSelected: boolean;
  isMultiSelected?: boolean;
  onSelect: (id: string, shiftKey?: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasNodeType>) => void;
  gridSize: number;
  snapEnabled: boolean;
  onDragEnd?: () => void;
  // Context menu actions
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  canPaste?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  hasMultipleSelected?: boolean;
}

export const FreeformNode: React.FC<FreeformNodeProps> = ({
  node,
  isSelected,
  isMultiSelected = false,
  onSelect,
  onDelete,
  onUpdate,
  gridSize,
  snapEnabled,
  onDragEnd,
  onCopy,
  onPaste,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onMoveUp,
  onMoveDown,
  onGroup,
  onUngroup,
  canPaste = false,
  canMoveUp = true,
  canMoveDown = true,
  hasMultipleSelected = false,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 });

  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const width = node.width ?? 200;

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newX = dragStart.nodeX + (e.clientX - dragStart.x);
      let newY = dragStart.nodeY + (e.clientY - dragStart.y);

      if (snapEnabled) {
        newX = snapToGrid(newX, gridSize);
        newY = snapToGrid(newY, gridSize);
      }

      // Ensure minimum position
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      onUpdate(node.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragEnd?.();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, node.id, onUpdate, gridSize, snapEnabled]);

  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = resizeStart.width + (e.clientX - resizeStart.x);

      if (snapEnabled) {
        newWidth = snapToGrid(newWidth, gridSize);
      }

      // Ensure minimum width
      newWidth = Math.max(100, newWidth);

      onUpdate(node.id, { width: newWidth });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, node.id, onUpdate, gridSize, snapEnabled]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (node.locked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      nodeX: x,
      nodeY: y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (node.locked) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      width: width,
    });
  };

  const handleContentChange = (content: string) => {
    onUpdate(node.id, { content });
  };

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(node.id, { locked: !node.locked });
  };

  const renderNodeContent = () => {
    switch (node.type) {
      case 'heading':
        return isEditing ? (
          <Input
            value={node.content || ''}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="text-xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
            placeholder="Enter heading..."
          />
        ) : (
          <h2 
            className="text-xl font-bold cursor-text" 
            onClick={() => setIsEditing(true)}
          >
            {node.content || 'Click to edit heading...'}
          </h2>
        );

      case 'text':
        return (
          <RichTextEditor
            content={node.content || '<p>Click to edit text...</p>'}
            onChange={handleContentChange}
            showToolbar={isSelected}
          />
        );

      case 'image':
        return (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Image URL"
              value={node.src || ''}
              onChange={(e) => onUpdate(node.id, { src: e.target.value })}
              className="text-sm"
            />
            {node.src ? (
              <img 
                src={node.src} 
                alt={node.alt || 'PDF Image'} 
                className="max-w-full h-auto rounded border border-border"
              />
            ) : (
              <div className="h-24 bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
                <Image className="h-6 w-6 opacity-50" />
              </div>
            )}
          </div>
        );

      case 'table':
        const cols = node.columns || 3;
        const rows = node.rows || 3;
        return (
          <div className="space-y-2">
            <div className="flex gap-2 text-xs">
              <label className="flex items-center gap-1">
                Cols:
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={cols}
                  onChange={(e) => onUpdate(node.id, { columns: parseInt(e.target.value) || 3 })}
                  className="w-14 h-6 text-xs"
                />
              </label>
              <label className="flex items-center gap-1">
                Rows:
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={rows}
                  onChange={(e) => onUpdate(node.id, { rows: parseInt(e.target.value) || 3 })}
                  className="w-14 h-6 text-xs"
                />
              </label>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted">
                    {Array.from({ length: cols }).map((_, i) => (
                      <th key={i} className="border-r border-border last:border-r-0 p-1.5 text-left font-medium">
                        Col {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.min(rows - 1, 2) }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-border">
                      {Array.from({ length: cols }).map((_, colIndex) => (
                        <td key={colIndex} className="border-r border-border last:border-r-0 p-1.5 text-muted-foreground">
                          Cell
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'divider':
        return <hr className="border-border border-t-2 my-2" />;

      case 'spacer':
        return (
          <div 
            className="bg-muted/50 border border-dashed border-border rounded flex items-center justify-center text-xs text-muted-foreground"
            style={{ height: node.height || 40 }}
          >
            {node.height || 40}px
          </div>
        );

      case 'view':
        return (
          <div className="min-h-[40px] border-2 border-dashed border-border rounded p-2 text-center text-muted-foreground text-xs">
            Container
          </div>
        );

      default:
        return null;
    }
  };

  const nodeContent = (
    <div
      ref={nodeRef}
      className={`
        absolute group rounded-lg border transition-shadow
        ${isDragging ? 'z-50 shadow-xl cursor-grabbing' : ''}
        ${isResizing ? 'z-50' : ''}
        ${isSelected || isMultiSelected
          ? 'border-primary ring-2 ring-primary/20 bg-card shadow-lg' 
          : 'border-border bg-card hover:border-primary/50 hover:shadow-md'
        }
        ${node.locked ? 'opacity-80' : ''}
      `}
      style={{
        left: x,
        top: y,
        width: width,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id, e.shiftKey);
      }}
    >
      {/* Position indicator */}
      {isSelected && (
        <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-mono rounded-t">
          x:{Math.round(pixelsToMm(x))}mm y:{Math.round(pixelsToMm(y))}mm w:{Math.round(pixelsToMm(width))}mm
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border bg-muted/30 rounded-t-lg">
        <div
          onMouseDown={handleDragStart}
          className={`p-0.5 -ml-0.5 rounded ${node.locked ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing hover:bg-accent'}`}
        >
          <Move className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="text-primary">{iconMap[node.type]}</div>
          <span className="text-[10px] font-medium text-muted-foreground truncate">
            {labelMap[node.type]}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={toggleLock}
          >
            {node.locked ? (
              <Lock className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Unlock className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 text-sm">
        {renderNodeContent()}
      </div>

      {/* Resize handle */}
      {!node.locked && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg viewBox="0 0 16 16" className="w-full h-full text-muted-foreground">
            <path
              d="M14 14H10M14 14V10M14 14L8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      )}
    </div>
  );

  // Wrap with context menu if handlers provided
  if (onCopy && onPaste && onDuplicate) {
    return (
      <CanvasContextMenu
        node={node}
        onCopy={onCopy}
        onPaste={onPaste}
        onDuplicate={onDuplicate}
        onDelete={() => onDelete(node.id)}
        onLock={() => onUpdate(node.id, { locked: !node.locked })}
        onBringToFront={onBringToFront || (() => {})}
        onSendToBack={onSendToBack || (() => {})}
        onMoveUp={onMoveUp || (() => {})}
        onMoveDown={onMoveDown || (() => {})}
        onGroup={onGroup}
        onUngroup={node.type === 'group' ? onUngroup : undefined}
        canPaste={canPaste}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        isGrouped={node.type === 'group'}
        hasMultipleSelected={hasMultipleSelected}
      >
        {nodeContent}
      </CanvasContextMenu>
    );
  }

  return nodeContent;
};

export default FreeformNode;
