import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyCenter,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  StretchHorizontal,
  StretchVertical,
} from 'lucide-react';

interface ShortcutsOverlayProps {
  hasSelection: boolean;
  hasMultipleSelected: boolean;
}

interface ShortcutItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  requiresMultiple?: boolean;
  requiresSelection?: boolean;
}

const alignmentShortcuts: ShortcutItem[] = [
  { key: 'L', label: 'Align Left', icon: <AlignHorizontalJustifyStart className="h-3 w-3" />, requiresMultiple: true },
  { key: 'R', label: 'Align Right', icon: <AlignHorizontalJustifyEnd className="h-3 w-3" />, requiresMultiple: true },
  { key: 'C', label: 'Center H', icon: <AlignHorizontalJustifyCenter className="h-3 w-3" />, requiresMultiple: true },
  { key: 'T', label: 'Align Top', icon: <AlignVerticalJustifyStart className="h-3 w-3" />, requiresMultiple: true },
  { key: 'B', label: 'Align Bottom', icon: <AlignVerticalJustifyEnd className="h-3 w-3" />, requiresMultiple: true },
  { key: 'M', label: 'Center V', icon: <AlignVerticalJustifyCenter className="h-3 w-3" />, requiresMultiple: true },
];

const distributionShortcuts: ShortcutItem[] = [
  { key: 'H', label: 'Distribute H', icon: <StretchHorizontal className="h-3 w-3" />, requiresMultiple: true },
  { key: 'V', label: 'Distribute V', icon: <StretchVertical className="h-3 w-3" />, requiresMultiple: true },
];

const nudgeShortcuts: ShortcutItem[] = [
  { key: '↑', label: '1px Up', icon: <ArrowUp className="h-3 w-3" />, requiresSelection: true },
  { key: '↓', label: '1px Down', icon: <ArrowDown className="h-3 w-3" />, requiresSelection: true },
  { key: '←', label: '1px Left', icon: <ArrowLeft className="h-3 w-3" />, requiresSelection: true },
  { key: '→', label: '1px Right', icon: <ArrowRight className="h-3 w-3" />, requiresSelection: true },
];

const gridNudgeShortcuts: ShortcutItem[] = [
  { key: '↑', label: 'Grid Up', icon: <ArrowUp className="h-3 w-3" />, requiresSelection: true },
  { key: '↓', label: 'Grid Down', icon: <ArrowDown className="h-3 w-3" />, requiresSelection: true },
  { key: '←', label: 'Grid Left', icon: <ArrowLeft className="h-3 w-3" />, requiresSelection: true },
  { key: '→', label: 'Grid Right', icon: <ArrowRight className="h-3 w-3" />, requiresSelection: true },
];

export const ShortcutsOverlay: React.FC<ShortcutsOverlayProps> = ({
  hasSelection,
  hasMultipleSelected,
}) => {
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && !e.repeat) {
        setIsShiftHeld(true);
        // Delay showing to avoid flickering on quick Shift presses
        timeout = setTimeout(() => setIsVisible(true), 200);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftHeld(false);
        setIsVisible(false);
        clearTimeout(timeout);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearTimeout(timeout);
    };
  }, []);

  if (!isShiftHeld || !isVisible) {
    return null;
  }

  const getAvailableShortcuts = () => {
    const sections: { title: string; shortcuts: ShortcutItem[]; available: boolean }[] = [];

    if (hasMultipleSelected) {
      sections.push({
        title: 'Alignment',
        shortcuts: alignmentShortcuts,
        available: true,
      });
      sections.push({
        title: 'Distribution',
        shortcuts: distributionShortcuts,
        available: true,
      });
    }

    if (hasSelection) {
      sections.push({
        title: 'Grid Nudge (Shift+Arrow)',
        shortcuts: gridNudgeShortcuts,
        available: true,
      });
    }

    return sections;
  };

  const sections = getAvailableShortcuts();

  if (sections.length === 0) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-sm text-muted-foreground">
            Hold <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border">Shift</kbd> with selection for shortcuts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-1 mb-2">
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-primary text-primary-foreground rounded">Shift</kbd>
          <span className="text-xs text-muted-foreground">held — press a key:</span>
        </div>
        
        <div className="flex gap-4">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {section.title}
              </span>
              <div className="flex gap-1">
                {section.shortcuts.map((shortcut, index) => (
                  <ShortcutBadge 
                    key={index} 
                    shortcut={shortcut} 
                    available={section.available}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ShortcutBadgeProps {
  shortcut: ShortcutItem;
  available: boolean;
}

const ShortcutBadge: React.FC<ShortcutBadgeProps> = ({ shortcut, available }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-0.5 p-1.5 rounded border transition-colors min-w-[44px]',
        available
          ? 'bg-muted border-border'
          : 'bg-muted/50 border-border/50 opacity-50'
      )}
    >
      <div className="flex items-center justify-center h-5 w-5">
        {shortcut.icon || (
          <kbd className="text-xs font-mono font-semibold">{shortcut.key}</kbd>
        )}
      </div>
      <kbd className={cn(
        'text-[10px] font-mono font-semibold px-1 py-0.5 rounded',
        available ? 'bg-background border border-border' : 'bg-background/50'
      )}>
        {shortcut.key}
      </kbd>
      <span className="text-[9px] text-muted-foreground text-center leading-tight">
        {shortcut.label}
      </span>
    </div>
  );
};

export default ShortcutsOverlay;
