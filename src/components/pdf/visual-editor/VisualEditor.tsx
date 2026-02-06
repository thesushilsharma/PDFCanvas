import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ComponentPalette from './ComponentPalette';
import EditorCanvas from './EditorCanvas';
import FreeformCanvas from './FreeformCanvas';
import PropertiesPanel from './PropertiesPanel';
import PageNavigator, { PageData } from './PageNavigator';
import HistoryPanel from './HistoryPanel';
import DistributionControls from './DistributionControls';
import StylePresetsPanel from './StylePresetsPanel';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { ContextualTooltip, getGroupingHint, getCopyStyleHint } from './ContextualTooltip';
import { CanvasNode, DraggableNodeType } from './types';
import { 
  PDFDocumentNode, 
  PDFNode, 
  PDFTextNode, 
  PDFViewNode, 
  PDFImageNode, 
  PDFTableNode, 
  PDFDividerNode, 
  PDFSpacerNode 
} from '@/lib/pdf/types';
import useUndoRedo from '@/hooks/use-undo-redo';
import { useClipboard, useClipboardShortcuts } from '@/hooks/use-clipboard';
import { useEditorShortcuts } from '@/hooks/use-editor-shortcuts';
import { useStyleClipboard } from '@/hooks/use-style-clipboard';
import { useStylePresets } from '@/hooks/use-style-presets';
import { toast } from 'sonner';
import {
  Undo2,
  Redo2,
  Grid3X3,
  Magnet,
  LayoutList,
  Move,
  Copy,
  ClipboardPaste,
  Group,
  Ungroup,
  History,
  Paintbrush,
  Palette,
  Keyboard,
} from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_NODE_HEIGHT = 80;
const DEFAULT_GRID_SIZE = 5;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = () => `node-${Math.random().toString(36).substring(2, 9)}`;

const createDefaultNode = (type: DraggableNodeType, x?: number, y?: number): CanvasNode => {
  const id = generateId();
  const baseNode = { x: x ?? 20, y: y ?? 20, width: 200 };

  switch (type) {
    case 'heading':
      return { 
        id, 
        type, 
        ...baseNode, 
        content: 'New Heading', 
        style: { fontSize: 24, fontWeight: 'bold' } 
      };
    case 'text':
      return { 
        id, 
        type, 
        ...baseNode, 
        content: '<p>New paragraph text. Click to edit with rich text formatting.</p>' 
      };
    case 'image':
      return { id, type, ...baseNode, src: '', alt: 'Image' };
    case 'table':
      return { id, type, ...baseNode, width: 300, columns: 3, rows: 3 };
    case 'divider':
      return { id, type, ...baseNode, width: 250 };
    case 'spacer':
      return { id, type, ...baseNode, height: 40 };
    case 'view':
      return { id, type, ...baseNode, children: [] };
    default:
      return { id, type, ...baseNode };
  }
};

// Convert canvas nodes to PDF schema
const canvasNodeToPDFNode = (node: CanvasNode): PDFNode => {
  const baseStyle = node.style || {};

  switch (node.type) {
    case 'heading':
      return {
        id: node.id,
        type: 'text',
        content: node.content || '',
        style: { fontSize: 24, fontWeight: 'bold', ...baseStyle },
      } as PDFTextNode;

    case 'text': {
      const plainText = (node.content || '').replace(/<[^>]*>/g, '');
      return {
        id: node.id,
        type: 'text',
        content: plainText,
        style: { fontSize: 12, ...baseStyle },
      } as PDFTextNode;
    }

    case 'image':
      return {
        id: node.id,
        type: 'image',
        src: node.src || '',
        alt: node.alt,
        style: baseStyle,
      } as PDFImageNode;

    case 'table': {
      const cols = node.columns || 3;
      const rows = node.rows || 3;
      return {
        id: node.id,
        type: 'table',
        columns: Array.from({ length: cols }, (_, i) => ({
          width: `${100 / cols}%`,
          header: `Column ${i + 1}`
        })),
        rows: Array.from({ length: rows }, () => ({
          id: generateId(),
          type: 'table-row',
          cells: Array.from({ length: cols }, () => ({
            id: generateId(),
            type: 'table-cell',
            children: [{ id: generateId(), type: 'text', content: 'Cell' }],
          })),
        })),
        style: baseStyle,
      } as unknown as PDFTableNode;
    }

    case 'divider':
      return {
        id: node.id,
        type: 'divider',
        thickness: 1,
        color: '#e5e5e5',
      } as PDFDividerNode;

    case 'spacer':
      return {
        id: node.id,
        type: 'spacer',
        height: node.height || 40,
      } as PDFSpacerNode;

    case 'view':
      return {
        id: node.id,
        type: 'view',
        children: (node.children || []).map(canvasNodeToPDFNode),
        style: baseStyle,
      } as PDFViewNode;

    default:
      return {
        id: node.id,
        type: 'text',
        content: '',
      } as PDFTextNode;
  }
};

// ============================================================================
// TYPES
// ============================================================================

type CanvasMode = 'flow' | 'freeform';

interface PageState {
  id: string;
  name: string;
  nodes: CanvasNode[];
}

interface VisualEditorProps {
  schema: PDFDocumentNode;
  onSchemaChange: (schema: PDFDocumentNode) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const VisualEditor: React.FC<VisualEditorProps> = ({
  schema,
  onSchemaChange,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  // Canvas settings
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('freeform');
  const [showGrid, setShowGrid] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [gridSize] = useState(DEFAULT_GRID_SIZE);

  // Panel visibility
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showStylePresets, setShowStylePresets] = useState(false);

  // Multi-page state
  const [pages, setPages] = useState<PageState[]>([
    { id: generateId(), name: 'Page 1', nodes: [] }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Get current page
  const currentPage = pages[currentPageIndex] || pages[0];

  // Undo/Redo for current page nodes
  const {
    state: nodes,
    setState: setNodes,
    undo,
    redo,
    canUndo,
    canRedo,
    jumpTo,
    history: undoRedoHistory,
  } = useUndoRedo<CanvasNode[]>(currentPage?.nodes || []);

  // Selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  // Clipboard
  const { clipboard, copy, hasClipboard } = useClipboard<CanvasNode>();

  // Style clipboard
  const { copyStyle, pasteStyle, hasStyle } = useStyleClipboard();

  // Style presets
  const {
    presets: stylePresets,
    savePreset: saveStylePreset,
    applyPreset: applyStylePreset,
    deletePreset: deleteStylePreset,
    renamePreset: renameStylePreset,
    exportPresets: exportStylePresets,
    importPresets: importStylePresets,
  } = useStylePresets();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedNodesForDistribution = nodes.filter(n => selectedNodeIds.has(n.id));
  const canUngroup = selectedNode?.type === 'group';
  const pageDataForNavigator: PageData[] = pages.map(p => ({
    id: p.id,
    name: p.name,
  }));

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Sync nodes back to pages when they change
  useEffect(() => {
    setPages(prev => prev.map((page, idx) =>
      idx === currentPageIndex ? { ...page, nodes } : page
    ));
  }, [nodes, currentPageIndex]);

  // Load nodes when switching pages
  useEffect(() => {
    const page = pages[currentPageIndex];
    if (page && JSON.stringify(page.nodes) !== JSON.stringify(nodes)) {
      setNodes(page.nodes, 'switch-page');
    }
  }, [currentPageIndex, pages]);

  // Update schema whenever pages change
  useEffect(() => {
    const newSchema: PDFDocumentNode = {
      ...schema,
      pages: pages.map((page, idx) => ({
        ...(schema.pages[idx] || { id: page.id, type: 'page' as const }),
        id: page.id,
        type: 'page' as const,
        children: page.nodes.map(canvasNodeToPDFNode),
      })),
    };

    // Prevent infinite loop by checking if schema actually changed
    if (JSON.stringify(newSchema) !== JSON.stringify(schema)) {
      onSchemaChange(newSchema);
    }
  }, [pages]);

  // ============================================================================
  // PAGE MANAGEMENT HANDLERS
  // ============================================================================

  const handleAddPage = useCallback(() => {
    const newPage: PageState = {
      id: generateId(),
      name: `Page ${pages.length + 1}`,
      nodes: [],
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
    setSelectedNodeId(null);
    setSelectedNodeIds(new Set());
    toast.success('New page added');
  }, [pages.length]);

  const handleDeletePage = useCallback((index: number) => {
    if (pages.length <= 1) {
      toast.error('Cannot delete the last page');
      return;
    }

    setPages(prev => prev.filter((_, idx) => idx !== index));
    if (currentPageIndex >= index && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
    setSelectedNodeId(null);
    setSelectedNodeIds(new Set());
    toast.success('Page deleted');
  }, [pages.length, currentPageIndex]);

  const handleDuplicatePage = useCallback((index: number) => {
    const sourcePage = pages[index];
    const newPage: PageState = {
      id: generateId(),
      name: `${sourcePage.name} (Copy)`,
      nodes: sourcePage.nodes.map(node => ({
        ...node,
        id: generateId(),
      })),
    };
    setPages(prev => [
      ...prev.slice(0, index + 1),
      newPage,
      ...prev.slice(index + 1),
    ]);
    setCurrentPageIndex(index + 1);
    toast.success('Page duplicated');
  }, [pages]);

  const handleReorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPages(prev => arrayMove(prev, fromIndex, toIndex));
    setCurrentPageIndex(toIndex);
  }, []);

  const handleRenamePage = useCallback((index: number, name: string) => {
    setPages(prev => prev.map((page, idx) =>
      idx === index ? { ...page, name } : page
    ));
  }, []);

  // ============================================================================
  // NODE MANAGEMENT HANDLERS
  // ============================================================================

  const handleAddNodeFreeform = useCallback((type: DraggableNodeType, x: number, y: number) => {
    const newNode = createDefaultNode(type, x, y);
    const newNodes = [...nodes, newNode];
    setNodes(newNodes, 'add-node');
    setSelectedNodeId(newNode.id);
    setSelectedNodeIds(new Set([newNode.id]));
  }, [nodes, setNodes]);

  const handleSelectNode = useCallback((id: string | null, shiftKey: boolean = false) => {
    if (id === null) {
      setSelectedNodeId(null);
      setSelectedNodeIds(new Set());
      return;
    }

    if (shiftKey) {
      setSelectedNodeIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
      setSelectedNodeId(id);
    } else {
      setSelectedNodeId(id);
      setSelectedNodeIds(new Set([id]));
    }
  }, []);

  const handleSelectNodes = useCallback((ids: string[]) => {
    setSelectedNodeIds(new Set(ids));
    setSelectedNodeId(ids.length > 0 ? ids[ids.length - 1] : null);
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id);
    
    // If deleting a group, ungroup children first
    if (node?.type === 'group' && node.childIds) {
      const newNodes = nodes
        .filter(n => n.id !== id)
        .map(n => n.groupId === id ? { ...n, groupId: undefined } : n);
      setNodes(newNodes, 'delete-group');
    } else {
      const newNodes = nodes.filter((n) => n.id !== id);
      setNodes(newNodes, 'delete-node');
    }

    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
    setSelectedNodeIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, [nodes, selectedNodeId, setNodes]);

  const handleUpdateNode = useCallback((id: string, updates: Partial<CanvasNode>) => {
    const newNodes = nodes.map((n) =>
      n.id === id ? { ...n, ...updates } : n
    );
    setNodes(newNodes, 'update-node');
  }, [nodes, setNodes]);

  const handleDuplicateNode = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return;

    const newNode: CanvasNode = {
      ...node,
      id: generateId(),
      x: (node.x ?? 20) + 20,
      y: (node.y ?? 20) + 20,
      groupId: undefined,
    };

    const newNodes = [...nodes, newNode];
    setNodes(newNodes, 'duplicate-node');
    setSelectedNodeId(newNode.id);
    setSelectedNodeIds(new Set([newNode.id]));
    toast.success('Element duplicated');
  }, [nodes, setNodes]);

  // ============================================================================
  // CLIPBOARD HANDLERS
  // ============================================================================

  const handleCopyNode = useCallback((node: CanvasNode) => {
    copy(node);
    toast.success('Element copied');
  }, [copy]);

  const handlePasteNode = useCallback(() => {
    if (clipboard) {
      const newNode: CanvasNode = {
        ...clipboard,
        id: generateId(),
        x: (clipboard.x || 20) + 20,
        y: (clipboard.y || 20) + 20,
      };
      const newNodes = [...nodes, newNode];
      setNodes(newNodes, 'paste-node');
      setSelectedNodeId(newNode.id);
      setSelectedNodeIds(new Set([newNode.id]));
      toast.success('Element pasted');
    }
  }, [clipboard, nodes, setNodes]);

  const handleCopyStyle = useCallback(() => {
    if (selectedNode) {
      copyStyle({ style: selectedNode.style });
      toast.success('Style copied');
    }
  }, [selectedNode, copyStyle]);

  const handlePasteStyle = useCallback(() => {
    if (selectedNode && hasStyle && selectedNodeId) {
      pasteStyle((copiedStyle) => {
        handleUpdateNode(selectedNodeId, { style: copiedStyle.style });
      });
      toast.success('Style applied');
    }
  }, [selectedNode, hasStyle, pasteStyle, selectedNodeId, handleUpdateNode]);

  // ============================================================================
  // GROUPING HANDLERS
  // ============================================================================

  const handleGroupNodes = useCallback(() => {
    if (selectedNodeIds.size < 2) return;

    const selectedNodes = nodes.filter(n => selectedNodeIds.has(n.id));
    if (selectedNodes.length < 2) return;

    // Calculate group bounds
    const minX = Math.min(...selectedNodes.map(n => n.x ?? 0));
    const minY = Math.min(...selectedNodes.map(n => n.y ?? 0));
    const maxX = Math.max(...selectedNodes.map(n => (n.x ?? 0) + (n.width ?? 200)));
    const maxY = Math.max(...selectedNodes.map(n => (n.y ?? 0) + DEFAULT_NODE_HEIGHT));

    const groupId = generateId();
    const groupNode: CanvasNode = {
      id: groupId,
      type: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      childIds: Array.from(selectedNodeIds),
    };

    // Update children with groupId and relative positions
    const newNodes = [
      ...nodes.map(n => {
        if (selectedNodeIds.has(n.id)) {
          return {
            ...n,
            groupId,
            x: (n.x ?? 0) - minX,
            y: (n.y ?? 0) - minY,
          };
        }
        return n;
      }),
      groupNode,
    ];

    setNodes(newNodes, 'group-nodes');
    setSelectedNodeId(groupId);
    setSelectedNodeIds(new Set([groupId]));
    toast.success('Elements grouped');
  }, [nodes, selectedNodeIds, setNodes]);

  const handleUngroupNodes = useCallback((groupId: string) => {
    const groupNode = nodes.find(n => n.id === groupId && n.type === 'group');
    if (!groupNode || !groupNode.childIds) return;

    const groupX = groupNode.x ?? 0;
    const groupY = groupNode.y ?? 0;

    // Restore absolute positions for children
    const newNodes = nodes
      .filter(n => n.id !== groupId)
      .map(n => {
        if (n.groupId === groupId) {
          return {
            ...n,
            groupId: undefined,
            x: (n.x ?? 0) + groupX,
            y: (n.y ?? 0) + groupY,
          };
        }
        return n;
      });

    setNodes(newNodes, 'ungroup-nodes');
    setSelectedNodeIds(new Set(groupNode.childIds));
    toast.success('Elements ungrouped');
  }, [nodes, setNodes]);

  // ============================================================================
  // LAYER ORDERING HANDLERS
  // ============================================================================

  const handleBringToFront = useCallback((id: string) => {
    const index = nodes.findIndex(n => n.id === id);
    if (index < nodes.length - 1) {
      const newNodes = [...nodes];
      const [node] = newNodes.splice(index, 1);
      newNodes.push(node);
      setNodes(newNodes, 'bring-to-front');
    }
  }, [nodes, setNodes]);

  const handleSendToBack = useCallback((id: string) => {
    const index = nodes.findIndex(n => n.id === id);
    if (index > 0) {
      const newNodes = [...nodes];
      const [node] = newNodes.splice(index, 1);
      newNodes.unshift(node);
      setNodes(newNodes, 'send-to-back');
    }
  }, [nodes, setNodes]);

  const handleMoveUp = useCallback((id: string) => {
    const index = nodes.findIndex(n => n.id === id);
    if (index < nodes.length - 1) {
      const newNodes = arrayMove(nodes, index, index + 1);
      setNodes(newNodes, 'move-up');
    }
  }, [nodes, setNodes]);

  const handleMoveDown = useCallback((id: string) => {
    const index = nodes.findIndex(n => n.id === id);
    if (index > 0) {
      const newNodes = arrayMove(nodes, index, index - 1);
      setNodes(newNodes, 'move-down');
    }
  }, [nodes, setNodes]);

  const handleReorderNodes = useCallback((reordered: CanvasNode[]) => {
    setNodes(reordered, 'reorder-layers');
  }, [setNodes]);

  // ============================================================================
  // ALIGNMENT & DISTRIBUTION HANDLERS
  // ============================================================================

  const handleDistributeNodes = useCallback((updatedNodes: CanvasNode[]) => {
    const newNodes = nodes.map(node => {
      const updated = updatedNodes.find(u => u.id === node.id);
      return updated || node;
    });
    setNodes(newNodes, 'distribute-nodes');
    toast.success('Elements arranged');
  }, [nodes, setNodes]);

  const handleAlignShortcut = useCallback((type: 'left' | 'right' | 'centerH' | 'top' | 'bottom' | 'centerV') => {
    if (selectedNodesForDistribution.length < 2) return;

    let updated: CanvasNode[];
    switch (type) {
      case 'left': {
        const minX = Math.min(...selectedNodesForDistribution.map(n => n.x ?? 0));
        updated = selectedNodesForDistribution.map(node => ({ ...node, x: minX }));
        break;
      }
      case 'right': {
        const maxRight = Math.max(...selectedNodesForDistribution.map(n => (n.x ?? 0) + (n.width ?? 200)));
        updated = selectedNodesForDistribution.map(node => ({
          ...node,
          x: maxRight - (node.width ?? 200)
        }));
        break;
      }
      case 'centerH': {
        const centers = selectedNodesForDistribution.map(n => (n.x ?? 0) + (n.width ?? 200) / 2);
        const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
        updated = selectedNodesForDistribution.map(node => ({
          ...node,
          x: avgCenter - (node.width ?? 200) / 2
        }));
        break;
      }
      case 'top': {
        const minY = Math.min(...selectedNodesForDistribution.map(n => n.y ?? 0));
        updated = selectedNodesForDistribution.map(node => ({ ...node, y: minY }));
        break;
      }
      case 'bottom': {
        const maxBottom = Math.max(...selectedNodesForDistribution.map(n => (n.y ?? 0) + DEFAULT_NODE_HEIGHT));
        updated = selectedNodesForDistribution.map(node => ({
          ...node,
          y: maxBottom - DEFAULT_NODE_HEIGHT
        }));
        break;
      }
      case 'centerV': {
        const centers = selectedNodesForDistribution.map(n => (n.y ?? 0) + DEFAULT_NODE_HEIGHT / 2);
        const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
        updated = selectedNodesForDistribution.map(node => ({
          ...node,
          y: avgCenter - DEFAULT_NODE_HEIGHT / 2
        }));
        break;
      }
    }
    handleDistributeNodes(updated);
  }, [selectedNodesForDistribution, handleDistributeNodes]);

  const handleDistributeShortcut = useCallback((type: 'horizontal' | 'vertical') => {
    if (selectedNodesForDistribution.length < 3) return;

    if (type === 'horizontal') {
      const sorted = [...selectedNodesForDistribution].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
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
      handleDistributeNodes(updated);
    } else {
      const sorted = [...selectedNodesForDistribution].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
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
      handleDistributeNodes(updated);
    }
  }, [selectedNodesForDistribution, handleDistributeNodes]);

  // ============================================================================
  // NUDGE HANDLER
  // ============================================================================

  const handleNudgeNodes = useCallback((dx: number, dy: number) => {
    const idsToNudge = selectedNodeIds.size > 0
      ? Array.from(selectedNodeIds)
      : selectedNodeId ? [selectedNodeId] : [];

    if (idsToNudge.length === 0) return;

    const newNodes = nodes.map(node => {
      if (idsToNudge.includes(node.id)) {
        return {
          ...node,
          x: Math.max(0, (node.x ?? 0) + dx),
          y: Math.max(0, (node.y ?? 0) + dy),
        };
      }
      return node;
    });

    setNodes(newNodes, 'nudge-nodes');
  }, [nodes, selectedNodeId, selectedNodeIds, setNodes]);

  // ============================================================================
  // DRAG AND DROP HANDLERS
  // ============================================================================

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Handle dropping from palette
    const activeData = active.data.current;
    if (activeData?.fromPalette && canvasMode === 'flow') {
      const nodeType = activeData.type as DraggableNodeType;
      const newNode = createDefaultNode(nodeType);

      const newNodes = [...nodes, newNode];
      setNodes(newNodes, 'add-node');
      setSelectedNodeId(newNode.id);
      setSelectedNodeIds(new Set([newNode.id]));
      return;
    }

    // Handle reordering in flow mode
    if (canvasMode === 'flow' && active.id !== over.id) {
      const oldIndex = nodes.findIndex((n) => n.id === active.id);
      const newIndex = nodes.findIndex((n) => n.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newNodes = arrayMove(nodes, oldIndex, newIndex);
        setNodes(newNodes, 'reorder');
      }
    }
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useClipboardShortcuts(
    selectedNode,
    handleCopyNode,
    handlePasteNode,
    true
  );

  useEditorShortcuts({
    onDelete: () => {
      if (selectedNodeIds.size > 0) {
        selectedNodeIds.forEach(id => handleDeleteNode(id));
      } else if (selectedNodeId) {
        handleDeleteNode(selectedNodeId);
      }
    },
    onDuplicate: () => {
      if (selectedNodeId) {
        handleDuplicateNode(selectedNodeId);
      }
    },
    onGroup: handleGroupNodes,
    onUngroup: () => {
      if (selectedNodeId && canUngroup) {
        handleUngroupNodes(selectedNodeId);
      }
    },
    onSelectAll: () => {
      const allIds = new Set(nodes.map(n => n.id));
      setSelectedNodeIds(allIds);
      if (nodes.length > 0) {
        setSelectedNodeId(nodes[nodes.length - 1].id);
      }
    },
    onNudge: handleNudgeNodes,
    onAlign: handleAlignShortcut,
    onDistribute: handleDistributeShortcut,
    enabled: true,
    hasSelection: selectedNodeId !== null || selectedNodeIds.size > 0,
    hasMultipleSelected: selectedNodeIds.size >= 2,
    canUngroup,
    gridSize,
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="h-10 px-3 border-b border-border bg-card flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={300}>
              {/* Undo/Redo */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={undo}
                      disabled={!canUndo}
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <ContextualTooltip
                    label="Undo"
                    shortcut={[{ key: 'Ctrl' }, { key: 'Z' }]}
                    disabled={!canUndo}
                  />
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={redo}
                      disabled={!canRedo}
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <ContextualTooltip
                    label="Redo"
                    shortcut={[{ key: 'Ctrl' }, { key: 'Y' }]}
                    disabled={!canRedo}
                  />
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-5" />

              {/* Copy/Paste */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => selectedNode && handleCopyNode(selectedNode)}
                      disabled={!selectedNode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <ContextualTooltip
                    label="Copy"
                    shortcut={[{ key: 'Ctrl' }, { key: 'C' }]}
                    contextHint={!selectedNode ? 'Select an element first' : undefined}
                    disabled={!selectedNode}
                  />
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handlePasteNode}
                      disabled={!hasClipboard}
                    >
                      <ClipboardPaste className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <ContextualTooltip
                    label="Paste"
                    shortcut={[{ key: 'Ctrl' }, { key: 'V' }]}
                    contextHint={!hasClipboard ? 'Nothing to paste yet' : undefined}
                    disabled={!hasClipboard}
                  />
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-5" />

              {/* Group/Ungroup */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleGroupNodes}
                      disabled={selectedNodeIds.size < 2}
                    >
                      <Group className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <ContextualTooltip
                    label="Group"
                    shortcut={[{ key: 'Ctrl' }, { key: 'G' }]}
                    contextHint={getGroupingHint(selectedNodeIds.size >= 2, false)}
                    disabled={selectedNodeIds.size < 2}
                  />
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => selectedNodeId && handleUngroupNodes(selectedNodeId)}
                      disabled={!canUngroup}
                    >
                      <Ungroup className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <ContextualTooltip
                    label="Ungroup"
                    shortcut={[{ key: 'Ctrl' }, { key: 'Shift' }, { key: 'G' }]}
                    contextHint={!canUngroup ? 'Select a group to ungroup' : undefined}
                    disabled={!canUngroup}
                  />
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-5" />

              {/* Style & Distribution */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={hasStyle ? "secondary" : "ghost"}
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleCopyStyle}
                      disabled={!selectedNode}
                    >
                      <Paintbrush className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <ContextualTooltip
                    label="Copy Style"
                    shortcut={[{ key: 'Ctrl' }, { key: 'Alt' }, { key: 'C' }]}
                    contextHint={getCopyStyleHint(!!selectedNode, hasStyle)}
                    disabled={!selectedNode}
                  />
                </Tooltip>

                <DistributionControls
                  selectedNodes={selectedNodesForDistribution}
                  onDistribute={handleDistributeNodes}
                  disabled={selectedNodeIds.size < 2}
                />
              </div>

              <Separator orientation="vertical" className="h-5" />

              {/* Panels */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showHistoryPanel ? "secondary" : "ghost"}
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>History Panel</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showStylePresets ? "secondary" : "ghost"}
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowStylePresets(!showStylePresets)}
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Style Presets</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={300}>
              {/* Canvas Mode */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      pressed={canvasMode === 'flow'}
                      onPressedChange={() => setCanvasMode('flow')}
                      size="sm"
                      className="h-7 px-2 gap-1"
                    >
                      <LayoutList className="h-3.5 w-3.5" />
                      <span className="text-xs">Flow</span>
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Flow layout (vertical stacking)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      pressed={canvasMode === 'freeform'}
                      onPressedChange={() => setCanvasMode('freeform')}
                      size="sm"
                      className="h-7 px-2 gap-1"
                    >
                      <Move className="h-3.5 w-3.5" />
                      <span className="text-xs">Freeform</span>
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Absolute positioning</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {canvasMode === 'freeform' && (
                <>
                  <Separator orientation="vertical" className="h-5" />

                  {/* Grid Controls */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={showGrid}
                          onPressedChange={setShowGrid}
                          size="sm"
                          className="h-7 w-7"
                        >
                          <Grid3X3 className="h-3.5 w-3.5" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Toggle grid ({gridSize}mm)</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={snapEnabled}
                          onPressedChange={setSnapEnabled}
                          size="sm"
                          className="h-7 w-7"
                        >
                          <Magnet className="h-3.5 w-3.5" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Snap to grid</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}

              <Separator orientation="vertical" className="h-5" />

              {/* Keyboard Shortcuts */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <KeyboardShortcutsDialog
                    trigger={
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Keyboard className="h-4 w-4" />
                      </Button>
                    }
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Keyboard Shortcuts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Page Navigator */}
        <PageNavigator
          pages={pageDataForNavigator}
          currentPageIndex={currentPageIndex}
          onSelectPage={setCurrentPageIndex}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          onReorderPages={handleReorderPages}
          onRenamePage={handleRenamePage}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Component Palette */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <ComponentPalette enableDragData={canvasMode === 'freeform'} />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Canvas */}
            <ResizablePanel defaultSize={55} minSize={40}>
              {canvasMode === 'flow' ? (
                <EditorCanvas
                  nodes={nodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={handleSelectNode}
                  onDeleteNode={handleDeleteNode}
                  onUpdateNode={handleUpdateNode}
                />
              ) : (
                <FreeformCanvas
                  nodes={nodes}
                  selectedNodeId={selectedNodeId}
                  selectedNodeIds={selectedNodeIds}
                  onSelectNode={handleSelectNode}
                  onSelectNodes={handleSelectNodes}
                  onDeleteNode={handleDeleteNode}
                  onUpdateNode={handleUpdateNode}
                  onAddNode={handleAddNodeFreeform}
                  onReorderNodes={handleReorderNodes}
                  onCopyNode={handleCopyNode}
                  onPasteNode={handlePasteNode}
                  onDuplicateNode={handleDuplicateNode}
                  onGroupNodes={handleGroupNodes}
                  onUngroupNodes={handleUngroupNodes}
                  onBringToFront={handleBringToFront}
                  onSendToBack={handleSendToBack}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onDistributeNodes={handleDistributeNodes}
                  canPaste={hasClipboard}
                  gridSize={gridSize}
                  showGrid={showGrid}
                  snapEnabled={snapEnabled}
                  showLayersPanel={showLayersPanel}
                  onToggleLayersPanel={() => setShowLayersPanel(!showLayersPanel)}
                />
              )}
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Properties & Panels */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={showHistoryPanel || showStylePresets ? 60 : 100}>
                  <PropertiesPanel
                    selectedNode={selectedNode}
                    onUpdateNode={handleUpdateNode}
                    showPositionControls={canvasMode === 'freeform'}
                  />
                </ResizablePanel>

                {showHistoryPanel && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={40} minSize={20}>
                      <HistoryPanel
                        past={undoRedoHistory.past}
                        present={undoRedoHistory.present}
                        future={undoRedoHistory.future}
                        onJumpTo={jumpTo}
                        onClose={() => setShowHistoryPanel(false)}
                      />
                    </ResizablePanel>
                  </>
                )}

                {showStylePresets && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={40} minSize={20}>
                      <StylePresetsPanel
                        presets={stylePresets}
                        selectedNode={selectedNode}
                        onSavePreset={saveStylePreset}
                        onApplyPreset={applyStylePreset}
                        onDeletePreset={deleteStylePreset}
                        onRenamePreset={renameStylePreset}
                        onExportPresets={exportStylePresets}
                        onImportPresets={importStylePresets}
                        onUpdateNode={handleUpdateNode}
                        onClose={() => setShowStylePresets(false)}
                      />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeId.startsWith('palette-') && (
          <div className="px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg text-sm font-medium opacity-90">
            Dragging component...
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default VisualEditor;