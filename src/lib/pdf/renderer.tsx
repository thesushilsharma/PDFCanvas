import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type {
  PDFNode,
  PDFDocumentNode,
  PDFPageNode,
  PDFTextNode,
  PDFImageNode,
  PDFViewNode,
  PDFTableNode,
  PDFTableRowNode,
  PDFTableCellNode,
  PDFDividerNode,
  PDFSpacerNode,
  PDFLinkNode,
  PDFHeaderNode,
  PDFFooterNode,
  PDFDataContext,
  PDFStyle,
} from './types';

// Register fonts (can be extended)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@latest/files/inter-latin-400-normal.woff2', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@latest/files/inter-latin-700-normal.woff2', fontWeight: 'bold' },
  ],
});

// Convert our style to react-pdf style
const convertStyle = (style?: PDFStyle): any => {
  if (!style) return {};

  const converted: Record<string, unknown> = {};

  if (style.fontSize) converted.fontSize = style.fontSize;
  if (style.fontWeight) converted.fontWeight = style.fontWeight;
  if (style.fontFamily) converted.fontFamily = style.fontFamily;
  if (style.color) converted.color = style.color;
  if (style.backgroundColor) converted.backgroundColor = style.backgroundColor;
  if (style.textAlign) converted.textAlign = style.textAlign;
  if (style.padding) converted.padding = style.padding;
  if (style.paddingTop) converted.paddingTop = style.paddingTop;
  if (style.paddingRight) converted.paddingRight = style.paddingRight;
  if (style.paddingBottom) converted.paddingBottom = style.paddingBottom;
  if (style.paddingLeft) converted.paddingLeft = style.paddingLeft;
  if (style.margin) converted.margin = style.margin;
  if (style.marginTop) converted.marginTop = style.marginTop;
  if (style.marginRight) converted.marginRight = style.marginRight;
  if (style.marginBottom) converted.marginBottom = style.marginBottom;
  if (style.marginLeft) converted.marginLeft = style.marginLeft;
  if (style.border) converted.border = style.border;
  if (style.borderRadius) converted.borderRadius = style.borderRadius;
  if (style.width) converted.width = style.width;
  if (style.height) converted.height = style.height;
  if (style.minHeight) converted.minHeight = style.minHeight;
  if (style.flexDirection) converted.flexDirection = style.flexDirection;
  if (style.flexWrap) converted.flexWrap = style.flexWrap;
  if (style.justifyContent) converted.justifyContent = style.justifyContent;
  if (style.alignItems) converted.alignItems = style.alignItems;
  if (style.gap) converted.gap = style.gap;
  if (style.lineHeight) converted.lineHeight = style.lineHeight;
  if (style.letterSpacing) converted.letterSpacing = style.letterSpacing;

  return converted;
};

// Template string interpolation
const interpolate = (template: string, data: PDFDataContext): string => {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
    const keys = path.split('.');
    let value: unknown = data;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return `{{${path}}}`;
      }
    }
    return String(value ?? '');
  });
};

// Check conditional rendering
const shouldRender = (node: PDFNode, data: PDFDataContext): boolean => {
  if (!node.conditional) return true;

  const { field, operator, value } = node.conditional;
  const keys = field.split('.');
  let fieldValue: unknown = data;

  for (const key of keys) {
    if (fieldValue && typeof fieldValue === 'object' && key in fieldValue) {
      fieldValue = (fieldValue as Record<string, unknown>)[key];
    } else {
      fieldValue = undefined;
      break;
    }
  }

  switch (operator) {
    case 'eq': return fieldValue === value;
    case 'ne': return fieldValue !== value;
    case 'gt': return typeof fieldValue === 'number' && fieldValue > (value as number);
    case 'lt': return typeof fieldValue === 'number' && fieldValue < (value as number);
    case 'exists': return fieldValue !== undefined && fieldValue !== null;
    case 'notExists': return fieldValue === undefined || fieldValue === null;
    default: return true;
  }
};

// Component renderers
interface RenderProps {
  node: PDFNode;
  data: PDFDataContext;
  pageNumber?: number;
  totalPages?: number;
}

const RenderText: React.FC<{ node: PDFTextNode; data: PDFDataContext }> = ({ node, data }) => {
  const content = node.dynamic ? interpolate(node.content, data) : node.content;
  return <Text style={convertStyle(node.style)}>{content}</Text>;
};

const RenderImage: React.FC<{ node: PDFImageNode; data: PDFDataContext }> = ({ node, data }) => {
  const src = node.src.startsWith('{{') ? interpolate(node.src, data) : node.src;
  return <Image src={src} style={convertStyle(node.style)} />;
};

const RenderDivider: React.FC<{ node: PDFDividerNode }> = ({ node }) => {
  const style = StyleSheet.create({
    divider: {
      borderBottomWidth: node.thickness || 1,
      borderBottomColor: node.color || '#e5e5e5',
      borderBottomStyle: 'solid',
      width: '100%',
      ...convertStyle(node.style),
    },
  });
  return <View style={style.divider} />;
};

const RenderSpacer: React.FC<{ node: PDFSpacerNode }> = ({ node }) => {
  return <View style={{ height: node.height }} />;
};

const RenderLink: React.FC<{ node: PDFLinkNode; data: PDFDataContext }> = ({ node, data }) => {
  return (
    <Link src={node.href} style={convertStyle(node.style)}>
      {node.children.map((child, index) => (
        <RenderNode key={child.id || index} node={child} data={data} />
      ))}
    </Link>
  );
};

const RenderView: React.FC<{ node: PDFViewNode; data: PDFDataContext }> = ({ node, data }) => {
  return (
    <View style={convertStyle(node.style)}>
      {node.children.map((child, index) => (
        <RenderNode key={child.id || index} node={child} data={data} />
      ))}
    </View>
  );
};

const RenderTableCell: React.FC<{ node: PDFTableCellNode; data: PDFDataContext; width?: string | number }> = ({ node, data, width }) => {
  const cellStyle = StyleSheet.create({
    cell: {
      width: width || 'auto',
      padding: 8,
      borderRightWidth: 1,
      borderRightColor: '#e5e5e5',
      ...convertStyle(node.style),
    },
  });

  return (
    <View style={cellStyle.cell}>
      {node.children.map((child, index) => (
        <RenderNode key={child.id || index} node={child} data={data} />
      ))}
    </View>
  );
};

const RenderTableRow: React.FC<{ node: PDFTableRowNode; data: PDFDataContext; columnWidths?: (string | number)[] }> = ({ node, data, columnWidths }) => {
  const rowStyle = StyleSheet.create({
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e5e5',
      ...convertStyle(node.style),
    },
  });

  return (
    <View style={rowStyle.row}>
      {node.cells.map((cell, index) => (
        <RenderTableCell
          key={cell.id || index}
          node={cell}
          data={data}
          width={columnWidths?.[index]}
        />
      ))}
    </View>
  );
};

const RenderTable: React.FC<{ node: PDFTableNode; data: PDFDataContext }> = ({ node, data }) => {
  const tableStyle = StyleSheet.create({
    table: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#e5e5e5',
      ...convertStyle(node.style),
    },
    headerRow: {
      flexDirection: 'row',
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
    },
  });

  const columnWidths = node.columns.map(col => col.width);

  return (
    <View style={tableStyle.table}>
      {node.headerRow && (
        <View style={tableStyle.headerRow}>
          <RenderTableRow node={node.headerRow} data={data} columnWidths={columnWidths} />
        </View>
      )}
      {node.rows.map((row, index) => (
        <RenderTableRow key={row.id || index} node={row} data={data} columnWidths={columnWidths} />
      ))}
    </View>
  );
};

const RenderHeader: React.FC<{ node: PDFHeaderNode; data: PDFDataContext }> = ({ node, data }) => {
  const headerStyle = StyleSheet.create({
    header: {
      position: node.fixed ? 'absolute' : 'relative',
      top: 0,
      left: 0,
      right: 0,
      ...convertStyle(node.style),
    },
  });

  return (
    <View style={headerStyle.header} fixed={node.fixed}>
      {node.children.map((child, index) => (
        <RenderNode key={child.id || index} node={child} data={data} />
      ))}
    </View>
  );
};

const RenderFooter: React.FC<{ node: PDFFooterNode; data: PDFDataContext }> = ({ node, data }) => {
  const footerStyle = StyleSheet.create({
    footer: {
      position: node.fixed ? 'absolute' : 'relative',
      bottom: 0,
      left: 0,
      right: 0,
      ...convertStyle(node.style),
    },
  });

  return (
    <View style={footerStyle.footer} fixed={node.fixed}>
      {node.children.map((child, index) => (
        <RenderNode key={child.id || index} node={child} data={data} />
      ))}
      {node.showPageNumbers && (
        <Text
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          style={{ textAlign: 'center', fontSize: 10, color: '#666' }}
        />
      )}
    </View>
  );
};

// Main node renderer
const RenderNode: React.FC<RenderProps> = ({ node, data }) => {
  if (!shouldRender(node, data)) return null;

  switch (node.type) {
    case 'text':
      return <RenderText node={node as PDFTextNode} data={data} />;
    case 'image':
      return <RenderImage node={node as PDFImageNode} data={data} />;
    case 'divider':
      return <RenderDivider node={node as PDFDividerNode} />;
    case 'spacer':
      return <RenderSpacer node={node as PDFSpacerNode} />;
    case 'link':
      return <RenderLink node={node as PDFLinkNode} data={data} />;
    case 'view':
      return <RenderView node={node as PDFViewNode} data={data} />;
    case 'table':
      return <RenderTable node={node as PDFTableNode} data={data} />;
    case 'table-row':
      return <RenderTableRow node={node as PDFTableRowNode} data={data} />;
    case 'table-cell':
      return <RenderTableCell node={node as PDFTableCellNode} data={data} />;
    case 'header':
      return <RenderHeader node={node as PDFHeaderNode} data={data} />;
    case 'footer':
      return <RenderFooter node={node as PDFFooterNode} data={data} />;
    default:
      return null;
  }
};

// Page renderer
const RenderPage: React.FC<{ node: PDFPageNode; data: PDFDataContext }> = ({ node, data }) => {
  const pageStyle = StyleSheet.create({
    page: {
      fontFamily: 'Inter',
      fontSize: 12,
      paddingTop: node.margins?.top ?? 40,
      paddingRight: node.margins?.right ?? 40,
      paddingBottom: node.margins?.bottom ?? 40,
      paddingLeft: node.margins?.left ?? 40,
      ...convertStyle(node.style),
    },
  });

  return (
    <Page
      size={node.size || 'A4'}
      orientation={node.orientation || 'portrait'}
      style={pageStyle.page}
    >
      {node.header && <RenderHeader node={node.header} data={data} />}
      {node.children.map((child, index) => (
        <RenderNode key={child.id || index} node={child} data={data} />
      ))}
      {node.footer && <RenderFooter node={node.footer} data={data} />}
    </Page>
  );
};

// Main document renderer
export interface PDFRendererProps {
  schema: PDFDocumentNode;
  data?: PDFDataContext;
}

export const PDFRenderer: React.FC<PDFRendererProps> = ({ schema, data = {} }) => {
  return (
    <Document
      title={schema.title}
      author={schema.author}
      subject={schema.subject}
      keywords={schema.keywords?.join(', ')}
    >
      {schema.pages.map((page, index) => (
        <RenderPage key={page.id || index} node={page} data={data} />
      ))}
    </Document>
  );
};

export default PDFRenderer;
