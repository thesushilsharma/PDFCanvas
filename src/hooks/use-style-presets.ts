import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface StylePreset {
  id: string;
  name: string;
  style: Record<string, unknown>;
  createdAt: number;
}

export interface StylePresetsExport {
  version: 1;
  exportedAt: number;
  presets: StylePreset[];
}

const STORAGE_KEY = 'pdf-editor-style-presets';

interface UseStylePresetsReturn {
  presets: StylePreset[];
  savePreset: (name: string, style: Record<string, unknown>) => void;
  applyPreset: (presetId: string, onApply: (style: Record<string, unknown>) => void) => void;
  deletePreset: (presetId: string) => void;
  renamePreset: (presetId: string, newName: string) => void;
  exportPresets: () => void;
  importPresets: (file: File) => Promise<void>;
}

export function useStylePresets(): UseStylePresetsReturn {
  const [presets, setPresets] = useState<StylePreset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPresets(parsed);
      }
    } catch (error) {
      console.error('Failed to load style presets:', error);
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error('Failed to save style presets:', error);
    }
  }, [presets]);

  const savePreset = useCallback((name: string, style: Record<string, unknown>) => {
    const newPreset: StylePreset = {
      id: `preset-${Date.now()}`,
      name,
      style,
      createdAt: Date.now(),
    };
    setPresets(prev => [...prev, newPreset]);
    toast.success(`Style preset "${name}" saved`);
  }, []);

  const applyPreset = useCallback((
    presetId: string, 
    onApply: (style: Record<string, unknown>) => void
  ) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      onApply(preset.style);
      toast.success(`Applied "${preset.name}" preset`);
    }
  }, [presets]);

  const deletePreset = useCallback((presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    toast.success('Style preset deleted');
  }, []);

  const renamePreset = useCallback((presetId: string, newName: string) => {
    setPresets(prev => prev.map(p => 
      p.id === presetId ? { ...p, name: newName } : p
    ));
    toast.success('Style preset renamed');
  }, []);

  const exportPresets = useCallback(() => {
    if (presets.length === 0) {
      toast.error('No presets to export');
      return;
    }

    const exportData: StylePresetsExport = {
      version: 1,
      exportedAt: Date.now(),
      presets,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `style-presets-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${presets.length} preset(s)`);
  }, [presets]);

  const importPresets = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as StylePresetsExport;

      // Validate import data
      if (!data.version || !Array.isArray(data.presets)) {
        throw new Error('Invalid preset file format');
      }

      // Validate each preset has required fields
      for (const preset of data.presets) {
        if (!preset.id || !preset.name || !preset.style) {
          throw new Error('Invalid preset data in file');
        }
      }

      // Generate new IDs to avoid conflicts
      const importedPresets = data.presets.map(preset => ({
        ...preset,
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      }));

      setPresets(prev => [...prev, ...importedPresets]);
      toast.success(`Imported ${importedPresets.length} preset(s)`);
    } catch (error) {
      console.error('Failed to import presets:', error);
      toast.error('Failed to import presets. Please check the file format.');
    }
  }, []);

  return {
    presets,
    savePreset,
    applyPreset,
    deletePreset,
    renamePreset,
    exportPresets,
    importPresets,
  };
}

export default useStylePresets;
