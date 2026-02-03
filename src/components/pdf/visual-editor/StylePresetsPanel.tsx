import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Palette,
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
  Sparkles,
  X,
  Download,
  Upload,
} from 'lucide-react';
import { StylePreset } from '@/hooks/use-style-presets';
import { CanvasNode } from './types';

interface StylePresetsPanelProps {
  presets: StylePreset[];
  selectedNode: CanvasNode | null;
  onSavePreset: (name: string, style: Record<string, unknown>) => void;
  onApplyPreset: (presetId: string, onApply: (style: Record<string, unknown>) => void) => void;
  onDeletePreset: (presetId: string) => void;
  onRenamePreset: (presetId: string, newName: string) => void;
  onExportPresets: () => void;
  onImportPresets: (file: File) => Promise<void>;
  onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void;
  onClose: () => void;
}

export const StylePresetsPanel: React.FC<StylePresetsPanelProps> = ({
  presets,
  selectedNode,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
  onRenamePreset,
  onExportPresets,
  onImportPresets,
  onUpdateNode,
  onClose,
}) => {
  const [newPresetName, setNewPresetName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onImportPresets(file);
      // Reset the input so the same file can be imported again
      e.target.value = '';
    }
  };

  const handleSave = () => {
    if (!selectedNode?.style || !newPresetName.trim()) return;
    onSavePreset(newPresetName.trim(), selectedNode.style);
    setNewPresetName('');
    setIsDialogOpen(false);
  };

  const handleApply = (presetId: string) => {
    if (!selectedNode) return;
    onApplyPreset(presetId, (style) => {
      onUpdateNode(selectedNode.id, { style });
    });
  };

  const handleRename = (presetId: string) => {
    if (!editingName.trim()) return;
    onRenamePreset(presetId, editingName.trim());
    setEditingId(null);
    setEditingName('');
  };

  const startEditing = (preset: StylePreset) => {
    setEditingId(preset.id);
    setEditingName(preset.name);
  };

  // Helper to generate a visual preview of the style
  const renderStylePreview = (style: Record<string, unknown>) => {
    const fontSize = style.fontSize as number | undefined;
    const fontWeight = style.fontWeight as string | undefined;
    const color = style.color as string | undefined;
    const backgroundColor = style.backgroundColor as string | undefined;

    return (
      <div 
        className="w-full h-8 rounded flex items-center justify-center text-xs border border-border"
        style={{
          fontSize: fontSize ? `${Math.min(fontSize, 14)}px` : '12px',
          fontWeight: fontWeight || 'normal',
          color: color || 'inherit',
          backgroundColor: backgroundColor || 'transparent',
        }}
      >
        Aa
      </div>
    );
  };

  return (
    <div className="w-64 h-full border-l border-border bg-card flex flex-col">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Style Presets</span>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={handleImportClick}
                >
                  <Upload className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Import presets</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={onExportPresets}
                  disabled={presets.length === 0}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Export presets</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Save new preset */}
      <div className="p-3 border-b border-border">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
              disabled={!selectedNode?.style}
            >
              <Plus className="h-4 w-4" />
              Save Current Style
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Save Style Preset</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Input
                placeholder="Enter preset name..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              {selectedNode?.style && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  {renderStylePreview(selectedNode.style)}
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={!newPresetName.trim()}>
                Save Preset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Presets list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {presets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No presets saved yet</p>
              <p className="text-xs mt-1">Select an element and save its style</p>
            </div>
          ) : (
            presets.map((preset) => (
              <div
                key={preset.id}
                className="group p-2 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                {editingId === preset.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(preset.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      className="h-7"
                      onClick={() => handleRename(preset.id)}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">{preset.name}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditing(preset)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeletePreset(preset.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {renderStylePreview(preset.style)}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-2 h-7"
                      onClick={() => handleApply(preset.id)}
                      disabled={!selectedNode}
                    >
                      Apply to Selection
                    </Button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StylePresetsPanel;
