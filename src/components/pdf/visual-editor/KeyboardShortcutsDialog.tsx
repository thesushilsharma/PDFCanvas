import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Keyboard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutItem[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'A'], description: 'Select all elements' },
      { keys: ['Delete'], description: 'Delete selected element(s)' },
      { keys: ['Backspace'], description: 'Delete selected element(s)' },
    ],
  },
  {
    title: 'Clipboard',
    shortcuts: [
      { keys: ['Ctrl', 'C'], description: 'Copy element' },
      { keys: ['Ctrl', 'V'], description: 'Paste element' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate element' },
      { keys: ['Ctrl', 'Alt', 'C'], description: 'Copy style' },
      { keys: ['Ctrl', 'Alt', 'V'], description: 'Paste style' },
    ],
  },
  {
    title: 'Grouping',
    shortcuts: [
      { keys: ['Ctrl', 'G'], description: 'Group selected elements' },
      { keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup elements' },
    ],
  },
  {
    title: 'Movement & Nudging',
    shortcuts: [
      { keys: ['↑', '↓', '←', '→'], description: 'Nudge by 1px' },
      { keys: ['Shift', '↑', '↓', '←', '→'], description: 'Nudge by grid size' },
    ],
  },
  {
    title: 'Alignment (Multi-select)',
    shortcuts: [
      { keys: ['Shift', 'L'], description: 'Align left' },
      { keys: ['Shift', 'R'], description: 'Align right' },
      { keys: ['Shift', 'C'], description: 'Center horizontally' },
      { keys: ['Shift', 'T'], description: 'Align top' },
      { keys: ['Shift', 'B'], description: 'Align bottom' },
      { keys: ['Shift', 'M'], description: 'Center vertically (middle)' },
    ],
  },
  {
    title: 'Distribution (Multi-select)',
    shortcuts: [
      { keys: ['Shift', 'H'], description: 'Distribute horizontally' },
      { keys: ['Shift', 'V'], description: 'Distribute vertically' },
    ],
  },
  {
    title: 'Zoom',
    shortcuts: [
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' },
      { keys: ['Ctrl', '0'], description: 'Reset zoom to 100%' },
    ],
  },
];

const KeyBadge: React.FC<{ keyName: string }> = ({ keyName }) => (
  <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-medium bg-muted border border-border rounded shadow-sm">
    {keyName}
  </kbd>
);

const ShortcutRow: React.FC<{ shortcut: ShortcutItem }> = ({ shortcut }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
    <div className="flex items-center gap-1">
      {shortcut.keys.map((key, index) => (
        <React.Fragment key={index}>
          <KeyBadge keyName={key} />
          {index < shortcut.keys.length - 1 && (
            <span className="text-xs text-muted-foreground">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

interface KeyboardShortcutsDialogProps {
  trigger?: React.ReactNode;
}

export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({ trigger }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Keyboard className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcutCategories.map((category, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{category.title}</h3>
                <Separator />
                <div className="space-y-1">
                  {category.shortcuts.map((shortcut, sIdx) => (
                    <ShortcutRow key={sIdx} shortcut={shortcut} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for inline keyboard shortcut display in tooltips
export const ShortcutHint: React.FC<{ keys: string[] }> = ({ keys }) => (
  <span className="inline-flex items-center gap-0.5 ml-2 opacity-70">
    {keys.map((key, index) => (
      <React.Fragment key={index}>
        <kbd className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-medium bg-muted/50 border border-border/50 rounded">
          {key}
        </kbd>
        {index < keys.length - 1 && <span className="text-[10px]">+</span>}
      </React.Fragment>
    ))}
  </span>
);

export default KeyboardShortcutsDialog;
