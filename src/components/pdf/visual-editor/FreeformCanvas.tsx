import React, { useRef, useState, useCallback, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CanvasNode as CanvasNodeType, DraggableNodeType } from './types';
import FreeformNode from './FreeformNode';
import GridOverlay, { snapToGrid } from './GridOverlay';
import { InteractiveRuler, GuideLine, CustomGuide } from './InteractiveRuler';
import ZoomControls from './ZoomControls';
import LayersPanel from './LayersPanel';
import CanvasMinimap from './CanvasMinimap';
import MultiSelectToolbar, { calculateToolbarPosition } from './MultiSelectToolbar';
import ShortcutsOverlay from './ShortcutsOverlay';
import AlignmentGuides, { 
  Guide,
  SpacingIndicator,
  EdgeConnection,
  calculateNodeBounds, 
  findAlignmentSnaps, 
  NodeBounds 
} from './AlignmentGuides';
import { useZoomShortcuts } from '@/hooks/use-zoom-shortcuts';
import { FileText, Plus, Grid3X3, Layers, Map } from 'lucide-react';
import { PageTemplate } from './PageTemplateDialog';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FreeformCanvasProps {
  nodes: CanvasNodeType[];
  selectedNodeId: string | null;
  selectedNodeIds: Set<string>;
  onSelectNode: (id: string | null, shiftKey?: boolean) => void;
  onSelectNodes: (ids: string[]) => void;
  onDeleteNode: (id: string) => void;
  onUpdateNode: (id: string, updates: Partial<CanvasNodeType>) => void;
  onAddNode: (type: DraggableNodeType, x: number, y: number) => void;
  onReorderNodes: (nodes: CanvasNodeType[]) => void;
  onCopyNode: (node: CanvasNodeType) => void;
  onPasteNode: () => void;
  onDuplicateNode: (id: string) => void;
  onGroupNodes: () => void;
  onUngroupNodes: (groupId: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDistributeNodes?: (nodes: CanvasNodeType[]) => void;
  canPaste: boolean;
  gridSize: number;
  showGrid: boolean;
  snapEnabled: boolean;
  showRulers?: boolean;
  pageTemplate?: PageTemplate;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  showLayersPanel?: boolean;
  onToggleLayersPanel?: () => void;
}

// A4 dimensions in pixels (at 96 DPI)
const A4_WIDTH = 595; // 210mm
const A4_HEIGHT = 842; // 297mm

// Default node height estimate for alignment calculations
const DEFAULT_NODE_HEIGHT = 80;

// Page template background styles
const getPageTemplateStyle = (template?: PageTemplate): React.CSSProperties => {
  switch (template) {
    case 'lined':
      return {
        backgroundImage: `repeating-linear-gradient(
          to bottom,
          transparent,
          transparent 23px,
          hsl(var(--muted-foreground) / 0.15) 23px,
          hsl(var(--muted-foreground) / 0.15) 24px
        )`,
        backgroundSize: '100% 24px',
      };
    case 'grid':
      return {
        backgroundImage: `
          linear-gradient(to right, hsl(var(--muted-foreground) / 0.12) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--muted-foreground) / 0.12) 1px, transparent 1px)
        `,
        backgroundSize: '18.9px 18.9px', // 5mm grid at 96 DPI
      };
    case 'dotgrid':
      return {
        backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.25) 1px, transparent 1px)`,
        backgroundSize: '18.9px 18.9px', // 5mm grid at 96 DPI
      };
    default:
      return {};
  }
};

// Selection rectangle state
interface SelectionRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const FreeformCanvas: React.FC<FreeformCanvasProps> = ({
  nodes,
  selectedNodeId,
  selectedNodeIds,
  onSelectNode,
  onSelectNodes,
  onDeleteNode,
  onUpdateNode,
  onAddNode,
  onReorderNodes,
  onCopyNode,
  onPasteNode,
  onDuplicateNode,
  onGroupNodes,
  onUngroupNodes,
  onBringToFront,
  onSendToBack,
  onMoveUp,
  onMoveDown,
  onDistributeNodes,
  canPaste,
  gridSize,
  showGrid,
  snapEnabled,
  showRulers = true,
  pageTemplate = 'blank',
  zoom: externalZoom,
  onZoomChange: externalOnZoomChange,
  showLayersPanel = false,
  onToggleLayersPanel,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalZoom, setInternalZoom] = useState(1);
  const [alignmentGuides, setAlignmentGuides] = useState<Guide[]>([]);
  const [spacingIndicators, setSpacingIndicators] = useState<SpacingIndicator[]>([]);
  const [edgeConnections, setEdgeConnections] = useState<EdgeConnection[]>([]);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [customGuides, setCustomGuides] = useState<CustomGuide[]>([]);

  // Guide management
  const handleAddGuide = useCallback((position: number, orientation: 'horizontal' | 'vertical') => {
    const newGuide: CustomGuide = {
      id: `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position,
      orientation,
    };
    setCustomGuides(prev => [...prev, newGuide]);
  }, []);

  const handleRemoveGuide = useCallback((id: string) => {
    setCustomGuides(prev => prev.filter(g => g.id !== id));
  }, []);

  // Use external zoom if provided, otherwise use internal
  const zoom = externalZoom ?? internalZoom;
  const onZoomChange = externalOnZoomChange ?? setInternalZoom;

  // Keyboard shortcuts for zoom
  useZoomShortcuts({
    zoom,
    onZoomChange,
    enabled: true,
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-canvas-background]')) {
      onSelectNode(null);
    }
  };

  // Drag selection handlers
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start selection if clicking on canvas background
    const target = e.target as HTMLElement;
    if (!target.closest('[data-canvas-background]') && e.target !== canvasRef.current) {
      return;
    }

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = (e.clientX - canvasRect.left) / zoom;
    const y = (e.clientY - canvasRect.top) / zoom;

    setSelectionRect({ startX: x, startY: y, currentX: x, currentY: y });
    setIsSelecting(true);
  }, [zoom]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionRect) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = (e.clientX - canvasRect.left) / zoom;
    const y = (e.clientY - canvasRect.top) / zoom;

    setSelectionRect(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
  }, [isSelecting, selectionRect, zoom]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!isSelecting || !selectionRect) {
      setIsSelecting(false);
      setSelectionRect(null);
      return;
    }

    // Calculate selection bounds
    const left = Math.min(selectionRect.startX, selectionRect.currentX);
    const right = Math.max(selectionRect.startX, selectionRect.currentX);
    const top = Math.min(selectionRect.startY, selectionRect.currentY);
    const bottom = Math.max(selectionRect.startY, selectionRect.currentY);

    // Only select if the rectangle is big enough (not just a click)
    if (right - left > 5 && bottom - top > 5) {
      // Find nodes within selection rectangle
      const selectedIds = nodes
        .filter(node => {
          const nodeLeft = node.x ?? 0;
          const nodeTop = node.y ?? 0;
          const nodeRight = nodeLeft + (node.width ?? 200);
          const nodeBottom = nodeTop + DEFAULT_NODE_HEIGHT;

          // Check if node intersects with selection rectangle
          return (
            nodeLeft < right &&
            nodeRight > left &&
            nodeTop < bottom &&
            nodeBottom > top
          );
        })
        .map(node => node.id);

      if (selectedIds.length > 0) {
        onSelectNodes(selectedIds);
      }
    }

    setIsSelecting(false);
    setSelectionRect(null);
  }, [isSelecting, selectionRect, nodes, onSelectNodes]);

  // Calculate selection rectangle bounds for rendering
  const selectionRectBounds = selectionRect && isSelecting ? {
    x: Math.min(selectionRect.startX, selectionRect.currentX),
    y: Math.min(selectionRect.startY, selectionRect.currentY),
    width: Math.abs(selectionRect.currentX - selectionRect.startX),
    height: Math.abs(selectionRect.currentY - selectionRect.startY),
  } : null;

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const type = e.dataTransfer.getData('node-type') as DraggableNodeType;
    if (!type) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    let x = (e.clientX - canvasRect.left) / zoom;
    let y = (e.clientY - canvasRect.top) / zoom;

    if (snapEnabled) {
      x = snapToGrid(x, gridSize);
      y = snapToGrid(y, gridSize);
    }

    onAddNode(type, x, y);
  }, [onAddNode, gridSize, snapEnabled, zoom]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Calculate alignment when a node is being dragged
  const handleNodeDrag = useCallback((
    nodeId: string, 
    newX: number, 
    newY: number, 
    width: number
  ) => {
    const movingBounds = calculateNodeBounds(
      nodeId, 
      newX, 
      newY, 
      width, 
      DEFAULT_NODE_HEIGHT
    );

    const otherBounds: NodeBounds[] = nodes
      .filter(n => n.id !== nodeId)
      .map(n => calculateNodeBounds(
        n.id,
        n.x || 0,
        n.y || 0,
        n.width || 200,
        DEFAULT_NODE_HEIGHT
      ));

    const { guides } = findAlignmentSnaps(
      movingBounds,
      otherBounds,
      A4_WIDTH,
      A4_HEIGHT
    );

    setAlignmentGuides(guides);
  }, [nodes]);

  const handleNodeDragEnd = useCallback(() => {
    setAlignmentGuides([]);
    setSpacingIndicators([]);
    setEdgeConnections([]);
  }, []);

  // Enhanced update handler that calculates alignment
  const handleUpdateNodeWithAlignment = useCallback((
    id: string, 
    updates: Partial<CanvasNodeType>
  ) => {
    const node = nodes.find(n => n.id === id);
    if (!node) {
      onUpdateNode(id, updates);
      return;
    }

    const newX = updates.x ?? node.x ?? 0;
    const newY = updates.y ?? node.y ?? 0;
    const width = updates.width ?? node.width ?? 200;

    // Calculate alignment snaps if position is changing
    if (updates.x !== undefined || updates.y !== undefined) {
      const movingBounds = calculateNodeBounds(id, newX, newY, width, DEFAULT_NODE_HEIGHT);
      const otherBounds: NodeBounds[] = nodes
        .filter(n => n.id !== id)
        .map(n => calculateNodeBounds(
          n.id,
          n.x || 0,
          n.y || 0,
          n.width || 200,
          DEFAULT_NODE_HEIGHT
        ));

      const { x: snapX, y: snapY, guides, spacingIndicators: spacing, edgeConnections: connections } = findAlignmentSnaps(
        movingBounds,
        otherBounds,
        A4_WIDTH,
        A4_HEIGHT
      );

      setAlignmentGuides(guides);
      setSpacingIndicators(spacing);
      setEdgeConnections(connections);

      // Apply snapped positions if available
      const finalUpdates = { ...updates };
      if (snapX !== null && updates.x !== undefined) {
        finalUpdates.x = snapX;
      }
      if (snapY !== null && updates.y !== undefined) {
        finalUpdates.y = snapY;
      }

      onUpdateNode(id, finalUpdates);
    } else {
      onUpdateNode(id, updates);
    }
  }, [nodes, onUpdateNode]);

  // Calculate multi-select toolbar position
  const selectedNodesForToolbar = useMemo(() => 
    nodes.filter(n => selectedNodeIds.has(n.id)),
    [nodes, selectedNodeIds]
  );

  const toolbarPosition = useMemo(() => 
    calculateToolbarPosition(selectedNodesForToolbar, zoom),
    [selectedNodesForToolbar, zoom]
  );

  // Alignment handlers for multi-select toolbar
  const handleAlign = useCallback((type: 'left' | 'right' | 'centerH' | 'top' | 'bottom' | 'centerV') => {
    if (selectedNodesForToolbar.length < 2 || !onDistributeNodes) return;

    let updated: CanvasNodeType[];
    switch (type) {
      case 'left': {
        const minX = Math.min(...selectedNodesForToolbar.map(n => n.x ?? 0));
        updated = selectedNodesForToolbar.map(node => ({ ...node, x: minX }));
        break;
      }
      case 'right': {
        const maxRight = Math.max(...selectedNodesForToolbar.map(n => (n.x ?? 0) + (n.width ?? 200)));
        updated = selectedNodesForToolbar.map(node => ({ 
          ...node, 
          x: maxRight - (node.width ?? 200) 
        }));
        break;
      }
      case 'centerH': {
        const centers = selectedNodesForToolbar.map(n => (n.x ?? 0) + (n.width ?? 200) / 2);
        const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
        updated = selectedNodesForToolbar.map(node => ({ 
          ...node, 
          x: avgCenter - (node.width ?? 200) / 2 
        }));
        break;
      }
      case 'top': {
        const minY = Math.min(...selectedNodesForToolbar.map(n => n.y ?? 0));
        updated = selectedNodesForToolbar.map(node => ({ ...node, y: minY }));
        break;
      }
      case 'bottom': {
        const maxBottom = Math.max(...selectedNodesForToolbar.map(n => (n.y ?? 0) + DEFAULT_NODE_HEIGHT));
        updated = selectedNodesForToolbar.map(node => ({ 
          ...node, 
          y: maxBottom - DEFAULT_NODE_HEIGHT 
        }));
        break;
      }
      case 'centerV': {
        const centers = selectedNodesForToolbar.map(n => (n.y ?? 0) + DEFAULT_NODE_HEIGHT / 2);
        const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
        updated = selectedNodesForToolbar.map(node => ({ 
          ...node, 
          y: avgCenter - DEFAULT_NODE_HEIGHT / 2 
        }));
        break;
      }
    }
    onDistributeNodes(updated);
  }, [selectedNodesForToolbar, onDistributeNodes]);

  const handleDistribute = useCallback((type: 'horizontal' | 'vertical') => {
    if (selectedNodesForToolbar.length < 3 || !onDistributeNodes) return;

    if (type === 'horizontal') {
      const sorted = [...selectedNodesForToolbar].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
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
      onDistributeNodes(updated);
    } else {
      const sorted = [...selectedNodesForToolbar].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      
      const startY = first.y ?? 0;
      const endY = (last.y ?? 0) + DEFAULT_NODE_HEIGHT;
      const totalHeight = endY - startY;
      const nodeHeights = sorted.length * DEFAULT_NODE_HEIGHT;
      const spacing = (totalHeight - nodeHeights) / (sorted.length - 1);

      let currentY = startY;
      const updated = sorted.map((node, idx) => {
        const newNode = { ...node, y: idx === 0 ? node.y : currentY };
        currentY = (idx === 0 ? (node.y ?? 0) : currentY) + DEFAULT_NODE_HEIGHT + spacing;
        return newNode;
      });
      onDistributeNodes(updated);
    }
  }, [selectedNodesForToolbar, onDistributeNodes]);

  const handleDeleteMultiple = useCallback(() => {
    selectedNodeIds.forEach(id => onDeleteNode(id));
  }, [selectedNodeIds, onDeleteNode]);

  const handleDuplicateMultiple = useCallback(() => {
    // Duplicate the first selected node (or could implement multi-duplicate)
    const firstId = Array.from(selectedNodeIds)[0];
    if (firstId) onDuplicateNode(firstId);
  }, [selectedNodeIds, onDuplicateNode]);

  return (
    <div className="h-full flex">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-surface-sunken">
        {/* Canvas Header */}
        <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Page 1</span>
          <span className="text-xs text-muted-foreground">• A4 Portrait</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>{nodes.length} element{nodes.length !== 1 ? 's' : ''}</span>
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showMinimap ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowMinimap(!showMinimap)}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Toggle minimap</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showLayersPanel ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={onToggleLayersPanel}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Toggle layers panel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ZoomControls zoom={zoom} onZoomChange={onZoomChange} />
        </div>
      </div>

      {/* Canvas Area with Rulers */}
      <ScrollArea className="flex-1">
        <div className="p-6 flex justify-center" style={{ minWidth: A4_WIDTH * zoom + 100 }}>
          <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            {/* Interactive Rulers */}
            {showRulers && (
              <>
                <InteractiveRuler
                  orientation="horizontal"
                  length={A4_WIDTH}
                  gridSize={gridSize}
                  guides={customGuides}
                  onAddGuide={handleAddGuide}
                  onRemoveGuide={handleRemoveGuide}
                  zoom={zoom}
                />
                <InteractiveRuler
                  orientation="vertical"
                  length={A4_HEIGHT}
                  gridSize={gridSize}
                  guides={customGuides}
                  onAddGuide={handleAddGuide}
                  onRemoveGuide={handleRemoveGuide}
                  zoom={zoom}
                />
              </>
            )}

            {/* Canvas with ruler offset */}
            <div
              ref={canvasRef}
              className={`
                relative bg-card rounded-lg border shadow-sm
                transition-all duration-200 overflow-hidden
                ${isDragOver ? 'ring-2 ring-primary border-primary' : 'border-border'}
              `}
              style={{
                width: A4_WIDTH,
                minHeight: A4_HEIGHT,
                marginLeft: showRulers ? 24 : 0,
                marginTop: showRulers ? 24 : 0,
                ...getPageTemplateStyle(pageTemplate),
              }}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {/* Grid Overlay */}
              <GridOverlay
                gridSize={gridSize}
                visible={showGrid}
                width={A4_WIDTH}
                height={A4_HEIGHT}
              />

              {/* Custom Guide Lines */}
              {customGuides.map(guide => (
                <GuideLine
                  key={guide.id}
                  guide={guide}
                  canvasWidth={A4_WIDTH}
                  canvasHeight={A4_HEIGHT}
                />
              ))}

              {/* Alignment Guides with Spacing Indicators and Edge Connections */}
              <AlignmentGuides 
                guides={alignmentGuides} 
                spacingIndicators={spacingIndicators}
                edgeConnections={edgeConnections}
              />

              {/* Drag Selection Rectangle */}
              {selectionRectBounds && (
                <div
                  className="absolute pointer-events-none border-2 border-primary bg-primary/10 rounded"
                  style={{
                    left: selectionRectBounds.x,
                    top: selectionRectBounds.y,
                    width: selectionRectBounds.width,
                    height: selectionRectBounds.height,
                    zIndex: 50,
                  }}
                />
              )}

              {/* Canvas background click area */}
              <div 
                data-canvas-background
                className="absolute inset-0"
                style={{ zIndex: 1 }}
              />

              {/* Empty State */}
              {nodes.length === 0 && (
                <div
                  className={`
                    absolute inset-0 flex flex-col items-center justify-center text-center p-6
                    ${isDragOver ? 'bg-primary/5' : ''}
                  `}
                  style={{ zIndex: 2 }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Free-form Canvas
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[280px]">
                    Drag components here and position them anywhere with precise control
                  </p>
                </div>
              )}

              {/* Nodes */}
              <div 
                className="relative" 
                style={{ zIndex: 10, minHeight: A4_HEIGHT }}
                onMouseUp={handleNodeDragEnd}
              >
                {nodes.map((node, index) => (
                  <FreeformNode
                    key={node.id}
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    isMultiSelected={selectedNodeIds.has(node.id)}
                    onSelect={onSelectNode}
                    onDelete={onDeleteNode}
                    onUpdate={handleUpdateNodeWithAlignment}
                    gridSize={gridSize}
                    snapEnabled={snapEnabled}
                    onDragEnd={handleNodeDragEnd}
                    onCopy={() => onCopyNode(node)}
                    onPaste={onPasteNode}
                    onDuplicate={() => onDuplicateNode(node.id)}
                    onBringToFront={() => onBringToFront(node.id)}
                    onSendToBack={() => onSendToBack(node.id)}
                    onMoveUp={() => onMoveUp(node.id)}
                    onMoveDown={() => onMoveDown(node.id)}
                    onGroup={onGroupNodes}
                    onUngroup={() => onUngroupNodes(node.id)}
                    canPaste={canPaste}
                    canMoveUp={index < nodes.length - 1}
                    canMoveDown={index > 0}
                    hasMultipleSelected={selectedNodeIds.size > 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      </div>

      {/* Layers Panel */}
      {showLayersPanel && (
        <div className="w-56 flex-shrink-0">
          <LayersPanel
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            onUpdateNode={onUpdateNode}
            onDeleteNode={onDeleteNode}
            onReorderNodes={onReorderNodes}
          />
        </div>
      )}

      {/* Minimap */}
      {showMinimap && (
        <div className="absolute bottom-4 right-4 z-50">
          <CanvasMinimap
            nodes={nodes}
            canvasWidth={A4_WIDTH}
            canvasHeight={A4_HEIGHT}
            selectedNodeIds={selectedNodeIds}
          />
        </div>
      )}

      {/* Multi-select floating toolbar */}
      {selectedNodeIds.size >= 2 && onDistributeNodes && (
        <MultiSelectToolbar
          selectedNodes={selectedNodesForToolbar}
          onAlign={handleAlign}
          onDistribute={handleDistribute}
          onGroup={onGroupNodes}
          onDuplicate={handleDuplicateMultiple}
          onDelete={handleDeleteMultiple}
          onClearSelection={() => onSelectNode(null)}
          position={toolbarPosition}
        />
      )}

      {/* Keyboard Shortcuts Overlay */}
      <ShortcutsOverlay
        hasSelection={selectedNodeId !== null || selectedNodeIds.size > 0}
        hasMultipleSelected={selectedNodeIds.size >= 2}
      />
    </div>
  );
};

export default FreeformCanvas;
