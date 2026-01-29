// PDF Document Schema Types - JSON-based extensible document definition

export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextDirection = 'ltr' | 'rtl';
export type FontWeight = 'normal' | 'bold' | 'light' | 'medium' | 'semibold';
export type PageSize = 'A4' | 'LETTER' | 'LEGAL' | 'A3' | 'A5';
export type PageOrientation = 'portrait' | 'landscape';

// Base style interface
export interface PDFStyle {
  fontSize?: number;
  fontWeight?: FontWeight;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  padding?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  margin?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  border?: string;
  borderRadius?: number;
  width?: number | string;
  height?: number | string;
  minHeight?: number | string;
  flexDirection?: 'row' | 'column';
  flexWrap?: 'wrap' | 'nowrap';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  gap?: number;
  lineHeight?: number;
  letterSpacing?: number;
}

// Node types for the document tree
export type PDFNodeType = 
  | 'document'
  | 'page'
  | 'view'
  | 'text'
  | 'image'
  | 'table'
  | 'table-row'
  | 'table-cell'
  | 'header'
  | 'footer'
  | 'divider'
  | 'spacer'
  | 'link';

// Base node interface
export interface PDFNodeBase {
  id: string;
  type: PDFNodeType;
  style?: PDFStyle;
  conditional?: {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'exists' | 'notExists';
    value?: unknown;
  };
}

// Text node
export interface PDFTextNode extends PDFNodeBase {
  type: 'text';
  content: string;
  dynamic?: boolean; // If true, content is a template string with {{variables}}
}

// Image node
export interface PDFImageNode extends PDFNodeBase {
  type: 'image';
  src: string;
  alt?: string;
}

// Divider node
export interface PDFDividerNode extends PDFNodeBase {
  type: 'divider';
  thickness?: number;
  color?: string;
}

// Spacer node
export interface PDFSpacerNode extends PDFNodeBase {
  type: 'spacer';
  height: number;
}

// Link node
export interface PDFLinkNode extends PDFNodeBase {
  type: 'link';
  href: string;
  children: PDFNode[];
}

// Container nodes
export interface PDFViewNode extends PDFNodeBase {
  type: 'view';
  children: PDFNode[];
}

// Table nodes
export interface PDFTableCellNode extends PDFNodeBase {
  type: 'table-cell';
  children: PDFNode[];
  colSpan?: number;
}

export interface PDFTableRowNode extends PDFNodeBase {
  type: 'table-row';
  cells: PDFTableCellNode[];
}

export interface PDFTableNode extends PDFNodeBase {
  type: 'table';
  columns: { width: string | number; header?: string }[];
  headerRow?: PDFTableRowNode;
  rows: PDFTableRowNode[];
  repeatHeader?: boolean; // Repeat header on each page
}

// Header/Footer nodes
export interface PDFHeaderNode extends PDFNodeBase {
  type: 'header';
  children: PDFNode[];
  fixed?: boolean;
}

export interface PDFFooterNode extends PDFNodeBase {
  type: 'footer';
  children: PDFNode[];
  fixed?: boolean;
  showPageNumbers?: boolean;
}

// Page node
export interface PDFPageNode extends PDFNodeBase {
  type: 'page';
  size?: PageSize;
  orientation?: PageOrientation;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  header?: PDFHeaderNode;
  footer?: PDFFooterNode;
  children: PDFNode[];
}

// Document node (root)
export interface PDFDocumentNode extends PDFNodeBase {
  type: 'document';
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  defaultStyle?: PDFStyle;
  pages: PDFPageNode[];
}

// Union type for all nodes
export type PDFNode = 
  | PDFTextNode
  | PDFImageNode
  | PDFDividerNode
  | PDFSpacerNode
  | PDFLinkNode
  | PDFViewNode
  | PDFTableNode
  | PDFTableRowNode
  | PDFTableCellNode
  | PDFHeaderNode
  | PDFFooterNode
  | PDFPageNode
  | PDFDocumentNode;

// Document data context for dynamic content
export interface PDFDataContext {
  [key: string]: unknown;
}

// Font registration
export interface PDFFontConfig {
  family: string;
  fonts: {
    src: string;
    fontWeight?: FontWeight;
    fontStyle?: 'normal' | 'italic';
  }[];
}

// Theme configuration
export interface PDFTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    accent: string;
    background: string;
    border: string;
  };
  typography: {
    heading: PDFStyle;
    body: PDFStyle;
    caption: PDFStyle;
  };
}

// Export configuration
export interface PDFExportConfig {
  filename: string;
  compress?: boolean;
  imageQuality?: number;
}
