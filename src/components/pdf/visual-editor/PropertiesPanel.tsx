import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CanvasNode, DraggableNodeType } from './types';
import { Settings, Palette, Box, Type as TypeIcon, Move } from 'lucide-react';
import { pixelsToMm } from './GridOverlay';

// Convert mm to pixels (assuming 96 DPI, 1 inch = 25.4mm)
const mmToPixels = (mm: number) => (mm / 25.4) * 96;

interface PropertiesPanelProps {
  selectedNode: CanvasNode | null;
  onUpdateNode: (id: string, updates: Partial<CanvasNode>) => void;
  showPositionControls?: boolean;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onUpdateNode,
  showPositionControls = false,
}) => {
  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col border-l border-border bg-card">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <Settings className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Select an element to edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  const updateStyle = (key: string, value: unknown) => {
    onUpdateNode(selectedNode.id, {
      style: { ...selectedNode.style, [key]: value },
    });
  };

  return (
    <div className="h-full flex flex-col border-l border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Properties</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Edit {selectedNode.type} properties
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Typography Section */}
          {(selectedNode.type === 'text' || selectedNode.type === 'heading') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TypeIcon className="h-4 w-4 text-primary" />
                Typography
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    type="number"
                    min={8}
                    max={72}
                    value={(selectedNode.style?.fontSize as number) || (selectedNode.type === 'heading' ? 24 : 14)}
                    onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Font Weight</Label>
                  <Select
                    value={(selectedNode.style?.fontWeight as string) || 'normal'}
                    onValueChange={(value) => updateStyle('fontWeight', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="semibold">Semibold</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Text Align</Label>
                  <Select
                    value={(selectedNode.style?.textAlign as string) || 'left'}
                    onValueChange={(value) => updateStyle('textAlign', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Colors Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="h-4 w-4 text-primary" />
              Colors
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={(selectedNode.style?.color as string) || '#000000'}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="w-10 h-8 p-0.5 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={(selectedNode.style?.color as string) || '#000000'}
                    onChange={(e) => updateStyle('color', e.target.value)}
                    className="h-8 flex-1 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={(selectedNode.style?.backgroundColor as string) || '#ffffff'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="w-10 h-8 p-0.5 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={(selectedNode.style?.backgroundColor as string) || '#ffffff'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="h-8 flex-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Position Section (Freeform mode) */}
          {showPositionControls && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Move className="h-4 w-4 text-primary" />
                  Position
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">X (mm)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={Math.round(pixelsToMm(selectedNode.x ?? 0))}
                      onChange={(e) => onUpdateNode(selectedNode.id, { x: mmToPixels(parseInt(e.target.value) || 0) })}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Y (mm)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={Math.round(pixelsToMm(selectedNode.y ?? 0))}
                      onChange={(e) => onUpdateNode(selectedNode.id, { y: mmToPixels(parseInt(e.target.value) || 0) })}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Width (mm)</Label>
                    <Input
                      type="number"
                      min={20}
                      value={Math.round(pixelsToMm(selectedNode.width ?? 200))}
                      onChange={(e) => onUpdateNode(selectedNode.id, { width: mmToPixels(parseInt(e.target.value) || 50) })}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Spacing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Box className="h-4 w-4 text-primary" />
              Spacing
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Padding</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={(selectedNode.style?.padding as number) || 0}
                  onChange={(e) => updateStyle('padding', parseInt(e.target.value))}
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Margin Top</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={(selectedNode.style?.marginTop as number) || 0}
                  onChange={(e) => updateStyle('marginTop', parseInt(e.target.value))}
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Margin Bottom</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={(selectedNode.style?.marginBottom as number) || 0}
                  onChange={(e) => updateStyle('marginBottom', parseInt(e.target.value))}
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PropertiesPanel;
