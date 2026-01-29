// Visual Editor Types

export type DraggableNodeType = 
  | 'text'
  | 'heading'
  | 'image'
  | 'table'
  | 'divider'
  | 'spacer'
  | 'view'
  | 'group';

export interface PaletteItem {
  type: DraggableNodeType;
  label: string;
  icon: string;
  description: string;
}

export interface CanvasNode {
  id: string;
  type: DraggableNodeType;
  content?: string;
  style?: Record<string, unknown>;
  children?: CanvasNode[];
  // Table-specific
  columns?: number;
  rows?: number;
  // Image-specific
  src?: string;
  alt?: string;
  // Spacer-specific
  height?: number;
  // Absolute positioning (in mm, relative to page)
  x?: number;
  y?: number;
  width?: number;
  locked?: boolean;
  // Group-specific
  groupId?: string; // ID of the group this node belongs to
  childIds?: string[]; // IDs of children if this is a group node
}

export interface EditorState {
  nodes: CanvasNode[];
  selectedNodeId: string | null;
  selectedNodeIds: string[]; // For multi-select
}

export const paletteItems: PaletteItem[] = [
  { type: 'heading', label: 'Heading', icon: 'Heading', description: 'Large title text' },
  { type: 'text', label: 'Text', icon: 'Type', description: 'Paragraph text with rich editing' },
  { type: 'image', label: 'Image', icon: 'Image', description: 'Add an image' },
  { type: 'table', label: 'Table', icon: 'Table', description: 'Data table with rows and columns' },
  { type: 'divider', label: 'Divider', icon: 'Minus', description: 'Horizontal line separator' },
  { type: 'spacer', label: 'Spacer', icon: 'MoveVertical', description: 'Vertical spacing' },
  { type: 'view', label: 'Container', icon: 'Square', description: 'Group elements together' },
];
