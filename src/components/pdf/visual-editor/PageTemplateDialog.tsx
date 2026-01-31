import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Grid3X3, Minus, LayoutGrid } from 'lucide-react';

export type PageTemplate = 'blank' | 'lined' | 'grid' | 'dotgrid';

interface PageTemplateOption {
  id: PageTemplate;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
}

const templates: PageTemplateOption[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty page with no background',
    icon: <FileText className="h-5 w-5" />,
    preview: (
      <div className="w-full h-full bg-white rounded border border-border" />
    ),
  },
  {
    id: 'lined',
    name: 'Lined',
    description: 'Horizontal lines for writing',
    icon: <Minus className="h-5 w-5" />,
    preview: (
      <div className="w-full h-full bg-white rounded border border-border overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-muted-foreground/20"
            style={{ height: '12.5%' }}
          />
        ))}
      </div>
    ),
  },
  {
    id: 'grid',
    name: 'Grid',
    description: 'Square grid pattern',
    icon: <Grid3X3 className="h-5 w-5" />,
    preview: (
      <div 
        className="w-full h-full bg-white rounded border border-border"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '10px 10px',
        }}
      />
    ),
  },
  {
    id: 'dotgrid',
    name: 'Dot Grid',
    description: 'Subtle dot pattern',
    icon: <LayoutGrid className="h-5 w-5" />,
    preview: (
      <div 
        className="w-full h-full bg-white rounded border border-border"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '10px 10px',
        }}
      />
    ),
  },
];

interface PageTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: PageTemplate) => void;
}

export const PageTemplateDialog: React.FC<PageTemplateDialogProps> = ({
  open,
  onOpenChange,
  onSelectTemplate,
}) => {
  const handleSelect = (template: PageTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Page Template</DialogTitle>
          <DialogDescription>
            Select a background template for your new page
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelect(template.id)}
              className={cn(
                'group relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-border',
                'transition-all duration-200 hover:border-primary hover:bg-accent/50',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
              )}
            >
              {/* Preview */}
              <div className="w-full aspect-[3/4] rounded overflow-hidden shadow-sm">
                {template.preview}
              </div>

              {/* Info */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground group-hover:text-primary transition-colors">
                  {template.icon}
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageTemplateDialog;
