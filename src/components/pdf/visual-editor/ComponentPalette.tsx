import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Type, 
  Image, 
  Table, 
  Minus, 
  MoveVertical, 
  Square,
  Heading,
  GripVertical,
} from 'lucide-react';
import { paletteItems, DraggableNodeType } from './types';

const iconMap: Record<string, React.ReactNode> = {
  Type: <Type className="h-4 w-4" />,
  Image: <Image className="h-4 w-4" />,
  Table: <Table className="h-4 w-4" />,
  Minus: <Minus className="h-4 w-4" />,
  MoveVertical: <MoveVertical className="h-4 w-4" />,
  Square: <Square className="h-4 w-4" />,
  Heading: <Heading className="h-4 w-4" />,
};

interface DraggablePaletteItemProps {
  type: DraggableNodeType;
  label: string;
  icon: string;
  description: string;
  enableDragData?: boolean;
}

const DraggablePaletteItem: React.FC<DraggablePaletteItemProps> = ({
  type,
  label,
  icon,
  description,
  enableDragData,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true },
  });

  const handleDragStart = (e: React.DragEvent) => {
    if (enableDragData) {
      e.dataTransfer.setData('node-type', type);
      e.dataTransfer.effectAllowed = 'copy';
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      draggable={enableDragData}
      onDragStart={handleDragStart}
      className={`
        group flex items-center gap-3 p-3 rounded-lg border border-border 
        bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing
        transition-all duration-150
        ${isDragging ? 'opacity-50 ring-2 ring-primary' : ''}
      `}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
        {iconMap[icon]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

interface ComponentPaletteProps {
  enableDragData?: boolean;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ enableDragData }) => {
  return (
    <div className="h-full flex flex-col border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Components</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Drag components onto the canvas
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {paletteItems.map((item) => (
            <DraggablePaletteItem
              key={item.type}
              type={item.type}
              label={item.label}
              icon={item.icon}
              description={item.description}
              enableDragData={enableDragData}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ComponentPalette;
