import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Settings,
  Group,
} from 'lucide-react';
import { CanvasNode as CanvasNodeType, DraggableNodeType } from './types';
import RichTextEditor from './RichTextEditor';

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

interface CanvasNodeProps {
  node: CanvasNodeType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasNodeType>) => void;
}

export const CanvasNodeComponent: React.FC<CanvasNodeProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleContentChange = (content: string) => {
    onUpdate(node.id, { content });
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
              <div className="h-32 bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
                <Image className="h-8 w-8 opacity-50" />
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
                  className="w-16 h-7 text-xs"
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
                  className="w-16 h-7 text-xs"
                />
              </label>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    {Array.from({ length: cols }).map((_, i) => (
                      <th key={i} className="border-r border-border last:border-r-0 p-2 text-left font-medium">
                        Column {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rows - 1 }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-border">
                      {Array.from({ length: cols }).map((_, colIndex) => (
                        <td key={colIndex} className="border-r border-border last:border-r-0 p-2 text-muted-foreground">
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
        return (
          <div className="py-2">
            <hr className="border-border border-t-2" />
          </div>
        );

      case 'spacer':
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Height:</span>
            <Input
              type="number"
              min={10}
              max={200}
              value={node.height || 40}
              onChange={(e) => onUpdate(node.id, { height: parseInt(e.target.value) || 40 })}
              className="w-20 h-7 text-xs"
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        );

      case 'view':
        return (
          <div className="min-h-[60px] border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground text-sm">
            Container - Drop elements here
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative rounded-lg border transition-all duration-150
        ${isDragging ? 'opacity-50 z-50' : ''}
        ${isSelected 
          ? 'border-primary ring-2 ring-primary/20 bg-card' 
          : 'border-border bg-card hover:border-primary/50'
        }
      `}
      onClick={() => onSelect(node.id)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30 rounded-t-lg">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-accent"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <div className="text-primary">{iconMap[node.type]}</div>
          <span className="text-xs font-medium text-muted-foreground">
            {labelMap[node.type]}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {renderNodeContent()}
      </div>
    </div>
  );
};

export default CanvasNodeComponent;
