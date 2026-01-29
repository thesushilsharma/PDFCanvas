import { useEffect, useCallback } from 'react';

type AlignType = 'left' | 'right' | 'centerH' | 'top' | 'bottom' | 'centerV';
type DistributeType = 'horizontal' | 'vertical';

interface UseEditorShortcutsOptions {
  onDelete?: () => void;
  onDuplicate?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onNudge?: (dx: number, dy: number) => void;
  onAlign?: (type: AlignType) => void;
  onDistribute?: (type: DistributeType) => void;
  enabled?: boolean;
  hasSelection?: boolean;
  hasMultipleSelected?: boolean;
  canUngroup?: boolean;
  gridSize?: number;
}

export function useEditorShortcuts({
  onDelete,
  onDuplicate,
  onGroup,
  onUngroup,
  onCopy,
  onPaste,
  onSelectAll,
  onNudge,
  onAlign,
  onDistribute,
  enabled = true,
  hasSelection = false,
  hasMultipleSelected = false,
  canUngroup = false,
  gridSize = 5,
}: UseEditorShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      // Delete or Backspace - delete selected elements
      if ((key === 'delete' || key === 'backspace') && hasSelection) {
        event.preventDefault();
        onDelete?.();
        return;
      }

      // Ctrl+D - duplicate
      if (isCtrlOrCmd && key === 'd' && hasSelection) {
        event.preventDefault();
        onDuplicate?.();
        return;
      }

      // Ctrl+G - group selected elements
      if (isCtrlOrCmd && !isShift && key === 'g' && hasMultipleSelected) {
        event.preventDefault();
        onGroup?.();
        return;
      }

      // Ctrl+Shift+G - ungroup
      if (isCtrlOrCmd && isShift && key === 'g' && canUngroup) {
        event.preventDefault();
        onUngroup?.();
        return;
      }

      // Ctrl+A - select all
      if (isCtrlOrCmd && key === 'a') {
        event.preventDefault();
        onSelectAll?.();
        return;
      }

      // Multi-select alignment shortcuts (Shift + key)
      if (isShift && hasMultipleSelected && onAlign) {
        switch (key) {
          case 'l':
            event.preventDefault();
            onAlign('left');
            return;
          case 'r':
            event.preventDefault();
            onAlign('right');
            return;
          case 'c':
            event.preventDefault();
            onAlign('centerH');
            return;
          case 't':
            event.preventDefault();
            onAlign('top');
            return;
          case 'b':
            event.preventDefault();
            onAlign('bottom');
            return;
          case 'm':
            event.preventDefault();
            onAlign('centerV');
            return;
        }
      }

      // Multi-select distribution shortcuts (Shift+H/V)
      if (isShift && hasMultipleSelected && onDistribute) {
        if (key === 'h') {
          event.preventDefault();
          onDistribute('horizontal');
          return;
        }
        if (key === 'v') {
          event.preventDefault();
          onDistribute('vertical');
          return;
        }
      }

      // Arrow keys - nudge selected elements
      if (hasSelection && onNudge) {
        const nudgeAmount = isShift ? gridSize * 3.78 : 1; // grid size in pixels or 1px
        
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            onNudge(0, -nudgeAmount);
            return;
          case 'ArrowDown':
            event.preventDefault();
            onNudge(0, nudgeAmount);
            return;
          case 'ArrowLeft':
            event.preventDefault();
            onNudge(-nudgeAmount, 0);
            return;
          case 'ArrowRight':
            event.preventDefault();
            onNudge(nudgeAmount, 0);
            return;
        }
      }
    },
    [
      enabled,
      hasSelection,
      hasMultipleSelected,
      canUngroup,
      gridSize,
      onDelete,
      onDuplicate,
      onGroup,
      onUngroup,
      onCopy,
      onPaste,
      onSelectAll,
      onNudge,
      onAlign,
      onDistribute,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}

export default useEditorShortcuts;
