import { useEffect, useCallback } from 'react';

interface UseZoomShortcutsOptions {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  enabled?: boolean;
}

export function useZoomShortcuts({
  zoom,
  onZoomChange,
  minZoom = 0.25,
  maxZoom = 3,
  step = 0.1,
  enabled = true,
}: UseZoomShortcutsOptions) {
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + step, maxZoom);
    onZoomChange(Math.round(newZoom * 100) / 100);
  }, [zoom, step, maxZoom, onZoomChange]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - step, minZoom);
    onZoomChange(Math.round(newZoom * 100) / 100);
  }, [zoom, step, minZoom, onZoomChange]);

  const resetZoom = useCallback(() => {
    onZoomChange(1);
  }, [onZoomChange]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd key
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (!isCtrlOrCmd) return;

      // Zoom in: Ctrl + Plus or Ctrl + =
      if (e.key === '+' || e.key === '=' || e.key === 'Equal') {
        e.preventDefault();
        zoomIn();
        return;
      }

      // Zoom out: Ctrl + Minus
      if (e.key === '-' || e.key === 'Minus') {
        e.preventDefault();
        zoomOut();
        return;
      }

      // Reset zoom: Ctrl + 0
      if (e.key === '0' || e.key === 'Digit0') {
        e.preventDefault();
        resetZoom();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, zoomIn, zoomOut, resetZoom]);

  return { zoomIn, zoomOut, resetZoom };
}

export default useZoomShortcuts;
