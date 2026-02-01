import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  History, 
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Move,
  Layers,
  Group,
  Ungroup,
  Edit,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HistoryEntry<T> {
  state: T;
  actionType?: string;
  timestamp: number;
}

interface HistoryPanelProps {
  past: HistoryEntry<unknown>[];
  present: { actionType?: string; timestamp: number };
  future: HistoryEntry<unknown>[];
  onJumpTo: (index: number) => void;
  onClose: () => void;
}

const getActionIcon = (actionType?: string) => {
  if (!actionType) return <History className="h-3.5 w-3.5" />;
  
  const type = actionType.toLowerCase();
  if (type.includes('add') || type.includes('paste')) return <Plus className="h-3.5 w-3.5" />;
  if (type.includes('delete') || type.includes('remove')) return <Trash2 className="h-3.5 w-3.5" />;
  if (type.includes('duplicate') || type.includes('copy')) return <Copy className="h-3.5 w-3.5" />;
  if (type.includes('move') || type.includes('nudge') || type.includes('drag')) return <Move className="h-3.5 w-3.5" />;
  if (type.includes('reorder') || type.includes('layer')) return <Layers className="h-3.5 w-3.5" />;
  if (type.includes('group')) return <Group className="h-3.5 w-3.5" />;
  if (type.includes('ungroup')) return <Ungroup className="h-3.5 w-3.5" />;
  if (type.includes('update') || type.includes('edit')) return <Edit className="h-3.5 w-3.5" />;
  if (type.includes('bring') || type.includes('up')) return <ArrowUp className="h-3.5 w-3.5" />;
  if (type.includes('send') || type.includes('down')) return <ArrowDown className="h-3.5 w-3.5" />;
  
  return <History className="h-3.5 w-3.5" />;
};

const formatActionType = (actionType?: string): string => {
  if (!actionType) return 'Initial state';
  
  return actionType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  past,
  present,
  future,
  onJumpTo,
  onClose,
}) => {
  const allEntries = [
    ...past.map((entry, idx) => ({ ...entry, index: idx, isCurrent: false, isFuture: false })),
    { ...present, index: past.length, isCurrent: true, isFuture: false },
    ...future.map((entry, idx) => ({ ...entry, index: past.length + 1 + idx, isCurrent: false, isFuture: true })),
  ];

  return (
    <div className="w-64 border-l border-border bg-card flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">History</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <span className="sr-only">Close</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {allEntries.length === 1 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No history yet. Make changes to see them here.
            </p>
          )}
          
          {allEntries.map((entry, idx) => (
            <button
              key={idx}
              onClick={() => !entry.isCurrent && onJumpTo(entry.index)}
              disabled={entry.isCurrent}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors",
                entry.isCurrent && "bg-primary/10 text-primary font-medium cursor-default",
                !entry.isCurrent && !entry.isFuture && "hover:bg-muted text-foreground",
                entry.isFuture && "opacity-50 hover:bg-muted text-muted-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded",
                entry.isCurrent ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {entry.isCurrent ? (
                  <RotateCcw className="h-3.5 w-3.5" />
                ) : (
                  getActionIcon(entry.actionType)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs">
                  {entry.isCurrent ? 'Current State' : formatActionType(entry.actionType)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {formatTimestamp(entry.timestamp)}
                </div>
              </div>
              {entry.isFuture && (
                <span className="text-[10px] text-muted-foreground">(redo)</span>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-border text-center">
        <p className="text-[10px] text-muted-foreground">
          {past.length} undo • {future.length} redo
        </p>
      </div>
    </div>
  );
};

export default HistoryPanel;
