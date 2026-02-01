import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Layers,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Type,
  Heading,
  Image,
  Table,
  Minus,
  MoveVertical,
  Square,
  Group,
} from 'lucide-react';
import { CanvasNode, DraggableNodeType } from './types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const iconMap: Record<DraggableNodeType, React.ReactNode> = {
  text: <Type className="h-3.5 w-3.5" />,
  heading: <Heading className="h-3.5 w-3.5" />,
  image: <Image className="h-3.5 w-3.5" />,
  table: <Table className="h-3.5 w-3.5" />,
  divider: <Minus className="h-3.5 w-3.5" />,
  spacer: <MoveVertical className="h-3.5 w-3.5" />,
  view: <Square className="h-3.5 w-3.5" />,
  group: <Group className="h-3.5 w-3.5" />,
};

const labelMap: Record<DraggableNodeType, string> = {
  text: 'Text',
  heading: 'Heading',
  image: 'Image',
  table: 'Table',
  divider: 'Divider',
  spacer: 'Spacer',
  view: 'Container',
  group: 'Group',
};

interface LayersPanelProps {
  nodes: CanvasNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void;
  onDeleteNode: (id: string) => void;
  onReorderNodes: (nodes: CanvasNode[]) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  onDeleteNode,
  onReorderNodes,
}) => {
  // Layers are ordered by z-index (last in array = highest z-index)
  // We reverse for display so top layer shows first
  const reversedNodes = [...nodes].reverse();

  const moveLayerUp = (nodeId: string) => {
    const index = nodes.findIndex((n) => n.id === nodeId);
    if (index < nodes.length - 1) {
      const newNodes = [...nodes];
      [newNodes[index], newNodes[index + 1]] = [newNodes[index + 1], newNodes[index]];
      onReorderNodes(newNodes);
    }
  };

  const moveLayerDown = (nodeId: string) => {
    const index = nodes.findIndex((n) => n.id === nodeId);
    if (index > 0) {
      const newNodes = [...nodes];
      [newNodes[index], newNodes[index - 1]] = [newNodes[index - 1], newNodes[index]];
      onReorderNodes(newNodes);
    }
  };

  const moveToTop = (nodeId: string) => {
    const index = nodes.findIndex((n) => n.id === nodeId);
    if (index < nodes.length - 1) {
      const newNodes = [...nodes];
      const [node] = newNodes.splice(index, 1);
      newNodes.push(node);
      onReorderNodes(newNodes);
    }
  };

  const moveToBottom = (nodeId: string) => {
    const index = nodes.findIndex((n) => n.id === nodeId);
    if (index > 0) {
      const newNodes = [...nodes];
      const [node] = newNodes.splice(index, 1);
      newNodes.unshift(node);
      onReorderNodes(newNodes);
    }
  };

  const toggleLock = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      onUpdateNode(nodeId, { locked: !node.locked });
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="h-full flex flex-col border-l border-border bg-card">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Layers</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div>
            <Layers className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No layers yet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-l border-border bg-card">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Layers</h3>
        </div>
        <span className="text-xs text-muted-foreground">{nodes.length}</span>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <TooltipProvider delayDuration={300}>
            {reversedNodes.map((node, displayIndex) => {
              const actualIndex = nodes.length - 1 - displayIndex;
              const isSelected = selectedNodeId === node.id;
              const isTop = actualIndex === nodes.length - 1;
              const isBottom = actualIndex === 0;

              return (
                <div
                  key={node.id}
                  className={`
                    group flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer
                    transition-colors text-sm
                    ${isSelected 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'hover:bg-accent border border-transparent'
                    }
                    ${node.locked ? 'opacity-60' : ''}
                  `}
                  onClick={() => onSelectNode(node.id)}
                >
                  {/* Layer Icon */}
                  <div className={`p-1 rounded ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                    {iconMap[node.type]}
                  </div>

                  {/* Layer Name */}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium truncate block">
                      {labelMap[node.type]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      z: {actualIndex + 1}
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayerUp(node.id);
                          }}
                          disabled={isTop}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Move up</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayerDown(node.id);
                          }}
                          disabled={isBottom}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Move down</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLock(node.id);
                          }}
                        >
                          {node.locked ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Unlock className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{node.locked ? 'Unlock' : 'Lock'}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNode(node.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </TooltipProvider>
        </div>
      </ScrollArea>

      {/* Layer Actions Footer */}
      {selectedNodeId && (
        <div className="p-2 border-t border-border">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => moveToTop(selectedNodeId)}
              disabled={nodes.findIndex((n) => n.id === selectedNodeId) === nodes.length - 1}
            >
              Bring to Front
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => moveToBottom(selectedNodeId)}
              disabled={nodes.findIndex((n) => n.id === selectedNodeId) === 0}
            >
              Send to Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayersPanel;
