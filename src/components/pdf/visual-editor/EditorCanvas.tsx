import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CanvasNode as CanvasNodeType } from './types';
import CanvasNodeComponent from './CanvasNode';
import { FileText, Plus } from 'lucide-react';

interface EditorCanvasProps {
  nodes: CanvasNodeType[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onDeleteNode: (id: string) => void;
  onUpdateNode: (id: string, updates: Partial<CanvasNodeType>) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onUpdateNode,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  return (
    <div className="h-full flex flex-col bg-surface-sunken">
      {/* Canvas Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Page 1</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {nodes.length} element{nodes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Canvas Area */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div
            ref={setNodeRef}
            className={`
              min-h-[800px] mx-auto max-w-[600px] bg-card rounded-lg border shadow-sm
              transition-all duration-200
              ${isOver ? 'ring-2 ring-primary border-primary' : 'border-border'}
            `}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onSelectNode(null);
              }
            }}
          >
            <SortableContext
              items={nodes.map((n) => n.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="p-6 space-y-3">
                {nodes.length === 0 ? (
                  <div
                    className={`
                      h-[600px] flex flex-col items-center justify-center text-center
                      border-2 border-dashed rounded-lg transition-colors
                      ${isOver ? 'border-primary bg-primary/5' : 'border-border'}
                    `}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Start Building Your PDF
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[280px]">
                      Drag components from the left panel and drop them here to build your document layout
                    </p>
                  </div>
                ) : (
                  nodes.map((node) => (
                    <CanvasNodeComponent
                      key={node.id}
                      node={node}
                      isSelected={selectedNodeId === node.id}
                      onSelect={onSelectNode}
                      onDelete={onDeleteNode}
                      onUpdate={onUpdateNode}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default EditorCanvas;
