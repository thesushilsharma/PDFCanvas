import { useState, useCallback, useEffect } from 'react';
import { CanvasNode } from '@/components/pdf/visual-editor/types';

interface UseMultiSelectOptions {
  nodes: CanvasNode[];
  onUpdateNodes: (updates: Array<{ id: string; updates: Partial<CanvasNode> }>) => void;
  enabled?: boolean;
}

export function useMultiSelect({
  nodes,
  onUpdateNodes,
  enabled = true,
}: UseMultiSelectOptions) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  // Select single node (with shift for multi-select)
  const selectNode = useCallback((nodeId: string, shiftKey: boolean = false) => {
    if (!enabled) return;

    if (shiftKey) {
      // Toggle selection
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    } else {
      // Single select
      setSelectedIds(new Set([nodeId]));
    }
    setLastSelectedId(nodeId);
  }, [enabled]);

  // Select multiple nodes
  const selectNodes = useCallback((nodeIds: string[]) => {
    setSelectedIds(new Set(nodeIds));
    if (nodeIds.length > 0) {
      setLastSelectedId(nodeIds[nodeIds.length - 1]);
    }
  }, []);

  // Add to selection
  const addToSelection = useCallback((nodeId: string) => {
    setSelectedIds(prev => new Set([...prev, nodeId]));
    setLastSelectedId(nodeId);
  }, []);

  // Remove from selection
  const removeFromSelection = useCallback((nodeId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(nodeId);
      return newSet;
    });
  }, []);

  // Get selected nodes
  const getSelectedNodes = useCallback(() => {
    return nodes.filter(n => selectedIds.has(n.id));
  }, [nodes, selectedIds]);

  // Move all selected nodes by delta
  const moveSelectedNodes = useCallback((deltaX: number, deltaY: number) => {
    const updates = Array.from(selectedIds).map(id => {
      const node = nodes.find(n => n.id === id);
      if (!node) return null;
      return {
        id,
        updates: {
          x: Math.max(0, (node.x ?? 0) + deltaX),
          y: Math.max(0, (node.y ?? 0) + deltaY),
        },
      };
    }).filter(Boolean) as Array<{ id: string; updates: Partial<CanvasNode> }>;

    if (updates.length > 0) {
      onUpdateNodes(updates);
    }
  }, [selectedIds, nodes, onUpdateNodes]);

  // Start drag selection
  const startDragSelection = useCallback((x: number, y: number) => {
    setIsDragSelecting(true);
    setDragStart({ x, y });
    setDragCurrent({ x, y });
  }, []);

  // Update drag selection
  const updateDragSelection = useCallback((x: number, y: number) => {
    if (isDragSelecting) {
      setDragCurrent({ x, y });
    }
  }, [isDragSelecting]);

  // End drag selection
  const endDragSelection = useCallback((nodeBounds: Array<{ id: string; x: number; y: number; width: number; height: number }>) => {
    if (!isDragSelecting || !dragStart || !dragCurrent) {
      setIsDragSelecting(false);
      return;
    }

    // Calculate selection rectangle
    const selectionRect = {
      left: Math.min(dragStart.x, dragCurrent.x),
      right: Math.max(dragStart.x, dragCurrent.x),
      top: Math.min(dragStart.y, dragCurrent.y),
      bottom: Math.max(dragStart.y, dragCurrent.y),
    };

    // Find nodes within selection rectangle
    const selectedNodeIds = nodeBounds
      .filter(bound => {
        const nodeRight = bound.x + bound.width;
        const nodeBottom = bound.y + bound.height;
        return (
          bound.x < selectionRect.right &&
          nodeRight > selectionRect.left &&
          bound.y < selectionRect.bottom &&
          nodeBottom > selectionRect.top
        );
      })
      .map(bound => bound.id);

    if (selectedNodeIds.length > 0) {
      selectNodes(selectedNodeIds);
    }

    setIsDragSelecting(false);
    setDragStart(null);
    setDragCurrent(null);
  }, [isDragSelecting, dragStart, dragCurrent, selectNodes]);

  // Selection rectangle bounds for rendering
  const selectionRect = isDragSelecting && dragStart && dragCurrent
    ? {
        x: Math.min(dragStart.x, dragCurrent.x),
        y: Math.min(dragStart.y, dragCurrent.y),
        width: Math.abs(dragCurrent.x - dragStart.x),
        height: Math.abs(dragCurrent.y - dragStart.y),
      }
    : null;

  // Keyboard shortcuts for selection
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Select all with Ctrl+A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectNodes(nodes.map(n => n.id));
      }
      
      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, nodes, selectNodes, clearSelection]);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    hasSelection: selectedIds.size > 0,
    hasMultipleSelected: selectedIds.size > 1,
    isSelected: (nodeId: string) => selectedIds.has(nodeId),
    selectNode,
    selectNodes,
    addToSelection,
    removeFromSelection,
    clearSelection,
    getSelectedNodes,
    moveSelectedNodes,
    // Drag selection
    isDragSelecting,
    selectionRect,
    startDragSelection,
    updateDragSelection,
    endDragSelection,
    lastSelectedId,
  };
}

export default useMultiSelect;
