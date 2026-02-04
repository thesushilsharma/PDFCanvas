import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Save,
  FolderOpen,
  Trash2,
  Download,
  Upload,
  FileText,
  Clock,
} from 'lucide-react';
import {
  getSavedLayouts,
  saveLayout,
  deleteLayout,
  exportLayoutAsJSON,
  importLayoutFromJSON,
  SavedLayout,
} from '@/lib/pdf/storage';
import { PDFDocumentNode, PDFDataContext } from '@/lib/pdf/types';
import { toast } from 'sonner';

interface SaveLoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'save' | 'load';
  schema: PDFDocumentNode;
  data: PDFDataContext;
  onLoad: (schema: PDFDocumentNode, data: PDFDataContext) => void;
}

export const SaveLoadDialog: React.FC<SaveLoadDialogProps> = ({
  open,
  onOpenChange,
  mode,
  schema,
  data,
  onLoad,
}) => {
  const [layouts, setLayouts] = useState<SavedLayout[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');

  useEffect(() => {
    if (open) {
      setLayouts(getSavedLayouts());
      setSaveName(schema.title || 'My Document');
      setSaveDescription('');
      setSelectedId(null);
    }
  }, [open, schema.title]);

  const handleSave = () => {
    if (!saveName.trim()) {
      toast.error('Please enter a name for the layout');
      return;
    }

    saveLayout(saveName.trim(), schema, data, saveDescription.trim() || undefined);
    toast.success('Layout saved successfully');
    onOpenChange(false);
  };

  const handleLoad = () => {
    if (!selectedId) {
      toast.error('Please select a layout to load');
      return;
    }

    const layout = layouts.find((l) => l.id === selectedId);
    if (layout) {
      onLoad(layout.schema, layout.data);
      toast.success(`Loaded "${layout.name}"`);
      onOpenChange(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLayout(id);
    setLayouts((prev) => prev.filter((l) => l.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success('Layout deleted');
  };

  const handleExport = (layout: SavedLayout, e: React.MouseEvent) => {
    e.stopPropagation();
    exportLayoutAsJSON(layout);
    toast.success('Layout exported');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importLayoutFromJSON(file);
      setLayouts(getSavedLayouts());
      toast.success('Layout imported successfully');
    } catch (error) {
      toast.error('Failed to import layout');
    }

    e.target.value = '';
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'save' ? (
              <>
                <Save className="h-5 w-5" />
                Save Layout
              </>
            ) : (
              <>
                <FolderOpen className="h-5 w-5" />
                Load Layout
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save'
              ? 'Save your current layout to browser storage'
              : 'Load a previously saved layout'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'save' ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Layout Name</Label>
              <Input
                id="name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter layout name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Enter a brief description"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {layouts.length} saved layout{layouts.length !== 1 ? 's' : ''}
              </span>
              <Label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span className="gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </Label>
            </div>

            <ScrollArea className="h-[300px] rounded-md border">
              {layouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[280px] text-center p-4">
                  <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No saved layouts yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Save a layout to see it here
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      type="button"
                      className={`
                        w-full text-left p-3 rounded-lg border cursor-pointer transition-all
                        ${
                          selectedId === layout.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }
                      `}
                      onClick={() => setSelectedId(layout.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {layout.name}
                          </h4>
                          {layout.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {layout.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(layout.updatedAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => handleExport(layout, e)}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => handleDelete(layout.id, e)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {mode === 'save' ? (
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Layout
            </Button>
          ) : (
            <Button onClick={handleLoad} disabled={!selectedId}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Load Selected
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveLoadDialog;
