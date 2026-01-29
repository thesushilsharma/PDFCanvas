import { useState, useCallback, useEffect } from 'react';

interface UseClipboardOptions<T> {
  onPaste?: (item: T) => void;
}

interface UseClipboardReturn<T> {
  clipboard: T | null;
  copy: (item: T) => void;
  paste: () => T | null;
  hasClipboard: boolean;
  clear: () => void;
}

export function useClipboard<T>(
  options: UseClipboardOptions<T> = {}
): UseClipboardReturn<T> {
  const [clipboard, setClipboard] = useState<T | null>(null);
  const { onPaste } = options;

  const copy = useCallback((item: T) => {
    setClipboard(item);
  }, []);

  const paste = useCallback(() => {
    if (clipboard && onPaste) {
      onPaste(clipboard);
    }
    return clipboard;
  }, [clipboard, onPaste]);

  const clear = useCallback(() => {
    setClipboard(null);
  }, []);

  return {
    clipboard,
    copy,
    paste,
    hasClipboard: clipboard !== null,
    clear,
  };
}

// Hook for keyboard shortcuts
export function useClipboardShortcuts<T>(
  selectedItem: T | null,
  onCopy: (item: T) => void,
  onPaste: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey) {
        if (selectedItem) {
          e.preventDefault();
          onCopy(selectedItem);
        }
      }

      // Ctrl/Cmd + V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !e.shiftKey) {
        e.preventDefault();
        onPaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, onCopy, onPaste, enabled]);
}

export default useClipboard;
