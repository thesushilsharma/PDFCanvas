import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileText,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageData {
  id: string;
  name: string;
}

interface SortablePageTabProps {
  page: PageData;
  index: number;
  isActive: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const SortablePageTab: React.FC<SortablePageTabProps> = ({
  page,
  index,
  isActive,
  canDelete,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group flex items-center',
        isDragging && 'z-50'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 cursor-grab active:cursor-grabbing',
          'opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted'
        )}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>

      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        size="sm"
        className={cn(
          'h-7 px-3 gap-1.5 text-xs font-medium transition-all',
          isActive && 'bg-background shadow-sm border',
          isDragging && 'ring-2 ring-primary'
        )}
        onClick={onSelect}
      >
        <FileText className="h-3 w-3" />
        <span>{page.name || `Page ${index + 1}`}</span>
      </Button>

      {/* Page Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute -right-1 -top-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity',
              'bg-background border shadow-sm hover:bg-muted'
            )}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            disabled={!canDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

interface PageNavigatorProps {
  pages: PageData[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
  onRenamePage: (index: number, name: string) => void;
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  currentPageIndex,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onReorderPages,
}) => {
  const canDeletePage = pages.length > 1;
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderPages(oldIndex, newIndex);
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      onSelectPage(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      onSelectPage(currentPageIndex + 1);
    }
  };

  const activePage = pages.find((p) => p.id === activeId);

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
      <TooltipProvider delayDuration={300}>
        {/* Previous Page */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Previous page</p>
          </TooltipContent>
        </Tooltip>

        {/* Page Tabs with DnD */}
        <ScrollArea className="flex-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pages.map((p) => p.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex items-center gap-2 px-2">
                {pages.map((page, index) => (
                  <SortablePageTab
                    key={page.id}
                    page={page}
                    index={index}
                    isActive={index === currentPageIndex}
                    canDelete={canDeletePage}
                    onSelect={() => onSelectPage(index)}
                    onDuplicate={() => onDuplicatePage(index)}
                    onDelete={() => onDeletePage(index)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activePage && (
                <div className="flex items-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 px-3 gap-1.5 text-xs font-medium bg-background shadow-lg border ring-2 ring-primary"
                  >
                    <FileText className="h-3 w-3" />
                    <span>{activePage.name}</span>
                  </Button>
                </div>
              )}
            </DragOverlay>
          </DndContext>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Next Page */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleNextPage}
              disabled={currentPageIndex === pages.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Next page</p>
          </TooltipContent>
        </Tooltip>

        {/* Add Page */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 gap-1 shrink-0"
              onClick={onAddPage}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="text-xs">Add Page</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Add new page</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default PageNavigator;
