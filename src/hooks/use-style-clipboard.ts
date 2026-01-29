import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface StyleData {
  style?: Record<string, unknown>;
  // Additional style-related properties that can be copied
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
}

interface UseStyleClipboardReturn {
  copiedStyle: StyleData | null;
  copyStyle: (style: StyleData) => void;
  pasteStyle: (onPaste: (style: StyleData) => void) => void;
  hasStyle: boolean;
}

export function useStyleClipboard(): UseStyleClipboardReturn {
  const [copiedStyle, setCopiedStyle] = useState<StyleData | null>(null);

  const copyStyle = useCallback((style: StyleData) => {
    setCopiedStyle(style);
    toast.success('Style copied', { duration: 1500 });
  }, []);

  const pasteStyle = useCallback((onPaste: (style: StyleData) => void) => {
    if (copiedStyle) {
      onPaste(copiedStyle);
      toast.success('Style applied', { duration: 1500 });
    }
  }, [copiedStyle]);

  return {
    copiedStyle,
    copyStyle,
    pasteStyle,
    hasStyle: copiedStyle !== null,
  };
}

interface UseStyleShortcutsOptions {
  onCopyStyle?: () => void;
  onPasteStyle?: () => void;
  enabled?: boolean;
  hasSelection?: boolean;
  hasStyle?: boolean;
}

export function useStyleShortcuts({
  onCopyStyle,
  onPasteStyle,
  enabled = true,
  hasSelection = false,
  hasStyle = false,
}: UseStyleShortcutsOptions) {
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
      const isAlt = event.altKey;

      // Ctrl+Alt+C - copy style
      if (isCtrlOrCmd && isAlt && key === 'c' && hasSelection) {
        event.preventDefault();
        onCopyStyle?.();
        return;
      }

      // Ctrl+Alt+V - paste style
      if (isCtrlOrCmd && isAlt && key === 'v' && hasSelection && hasStyle) {
        event.preventDefault();
        onPasteStyle?.();
        return;
      }
    },
    [enabled, hasSelection, hasStyle, onCopyStyle, onPasteStyle]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}

export default useStyleClipboard;
