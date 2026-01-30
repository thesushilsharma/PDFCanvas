import React from 'react';
import {
  TooltipContent,
} from '@/components/ui/tooltip';

interface ShortcutKey {
  key: string;
  display?: string;
}

interface ContextualTooltipProps {
  label: string;
  shortcut?: ShortcutKey[];
  contextHint?: string;
  disabled?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const KeyBadge: React.FC<{ keyName: string }> = ({ keyName }) => (
  <kbd className="inline-flex items-center justify-center min-w-[16px] h-[18px] px-1 text-[10px] font-medium bg-muted/60 border border-border/60 rounded shadow-sm">
    {keyName}
  </kbd>
);

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  label,
  shortcut,
  contextHint,
  disabled = false,
  side = 'bottom',
}) => {
  return (
    <TooltipContent side={side} className="max-w-xs">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={disabled ? 'text-muted-foreground' : ''}>{label}</span>
          {shortcut && shortcut.length > 0 && (
            <span className="flex items-center gap-0.5">
              {shortcut.map((s, index) => (
                <React.Fragment key={index}>
                  <KeyBadge keyName={s.display || s.key} />
                  {index < shortcut.length - 1 && (
                    <span className="text-[10px] text-muted-foreground">+</span>
                  )}
                </React.Fragment>
              ))}
            </span>
          )}
        </div>
        {contextHint && (
          <span className="text-[10px] text-muted-foreground italic">{contextHint}</span>
        )}
      </div>
    </TooltipContent>
  );
};

// Helper function to generate contextual hints based on selection state
export const getGroupingHint = (
  hasMultipleSelected: boolean,
  canUngroup: boolean
): string | undefined => {
  if (canUngroup) {
    return 'Ungroup to separate elements';
  }
  if (!hasMultipleSelected) {
    return 'Select multiple elements to group';
  }
  return undefined;
};

export const getAlignmentHint = (
  hasMultipleSelected: boolean
): string | undefined => {
  if (!hasMultipleSelected) {
    return 'Select 2+ elements to align';
  }
  return undefined;
};

export const getDistributionHint = (
  selectedCount: number
): string | undefined => {
  if (selectedCount < 3) {
    return 'Select 3+ elements to distribute';
  }
  return undefined;
};

export const getDuplicateHint = (
  hasSelection: boolean
): string | undefined => {
  if (!hasSelection) {
    return 'Select an element first';
  }
  return undefined;
};

export const getCopyStyleHint = (
  hasSelection: boolean,
  hasStyleCopied: boolean
): string | undefined => {
  if (!hasSelection) {
    return 'Select an element to copy its style';
  }
  if (hasStyleCopied) {
    return 'Style copied! Use Ctrl+Alt+V to paste';
  }
  return undefined;
};

export default ContextualTooltip;
