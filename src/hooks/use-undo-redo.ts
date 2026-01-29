import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface HistoryEntry<T> {
  state: T;
  actionType?: string;
  timestamp: number;
}

interface UndoRedoState<T> {
  past: HistoryEntry<T>[];
  present: HistoryEntry<T>;
  future: HistoryEntry<T>[];
}

interface UseUndoRedoOptions {
  showToasts?: boolean;
}

interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T, actionType?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  jumpTo: (index: number) => void;
  history: {
    past: HistoryEntry<T>[];
    present: { actionType?: string; timestamp: number };
    future: HistoryEntry<T>[];
  };
}

export function useUndoRedo<T>(
  initialState: T,
  maxHistoryLength: number = 50,
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn<T> {
  const { showToasts = true } = options;
  
  const [history, setHistory] = useState<UndoRedoState<T>>({
    past: [],
    present: { state: initialState, actionType: 'initial', timestamp: Date.now() },
    future: [],
  });

  const setState = useCallback((newState: T, actionType?: string) => {
    setHistory((prev) => ({
      past: [...prev.past.slice(-maxHistoryLength + 1), prev.present],
      present: { state: newState, actionType, timestamp: Date.now() },
      future: [],
    }));
  }, [maxHistoryLength]);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      if (showToasts) {
        toast.success('Undo', { duration: 1500 });
      }

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, [showToasts]);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      if (showToasts) {
        toast.success('Redo', { duration: 1500 });
      }

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, [showToasts]);

  const clearHistory = useCallback(() => {
    setHistory((prev) => ({
      past: [],
      present: prev.present,
      future: [],
    }));
  }, []);

  const jumpTo = useCallback((index: number) => {
    setHistory((prev) => {
      const allEntries = [...prev.past, prev.present, ...prev.future];
      const currentIndex = prev.past.length;
      
      if (index === currentIndex || index < 0 || index >= allEntries.length) {
        return prev;
      }

      const targetEntry = allEntries[index];
      const newPast = allEntries.slice(0, index);
      const newFuture = allEntries.slice(index + 1);

      if (showToasts) {
        const direction = index < currentIndex ? 'Jumped back' : 'Jumped forward';
        toast.success(direction, { duration: 1500 });
      }

      return {
        past: newPast,
        present: targetEntry,
        future: newFuture,
      };
    });
  }, [showToasts]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state: history.present.state,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    clearHistory,
    jumpTo,
    history: {
      past: history.past,
      present: { actionType: history.present.actionType, timestamp: history.present.timestamp },
      future: history.future,
    },
  };
}

export default useUndoRedo;
