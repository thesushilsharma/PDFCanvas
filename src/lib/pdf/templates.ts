import { PDFDocumentNode, PDFDataContext } from './types';
import { extendedTemplates, ExtendedTemplateName } from './templates-extended';

// Generate unique IDs
const uid = () => Math.random().toString(36).substring(2, 9);

// Sample Invoice Template
export const invoiceTemplate: PDFDocumentNode = {
  id: uid(),
  type: 'document',
  title: 'Invoice',
  author: 'PDF Generator',
  pages: [
    {
      id: uid(),
      type: 'page',
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 50, right: 50, bottom: 50, left: 50 },
      header: {
        id: uid(),
        type: 'header',
        fixed: true,
        style: { 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 30,
          paddingBottom: 20,
        },
        children: [
          {
            id: uid(),
            type: 'view',
            children: [
              {
                id: uid(),
                type: 'text',
                content: '{{company.name}}',
                dynamic: true,
                style: { fontSize: 24, fontWeight: 'bold', color: '#1e3a5f' },
              },
              {
                id: uid(),
                type: 'text',
                content: '{{company.address}}',
                dynamic: true,
                style: { fontSize: 10, color: '#666', marginTop: 4 },
              },
            ],
          },
          {
            id: uid(),
            type: 'view',
            style: { textAlign: 'right' },
            children: [
              {
                id: uid(),
                type: 'text',
                content: 'INVOICE',
                style: { fontSize: 32, fontWeight: 'bold', color: '#1e3a5f', letterSpacing: 2 },
              },
              {
                id: uid(),
                type: 'text',
                content: '#{{invoice.number}}',
                dynamic: true,
                style: { fontSize: 12, color: '#666', marginTop: 4 },
              },
            ],
          },
        ],
      },
      footer: {
        id: uid(),
        type: 'footer',
        fixed: true,
        showPageNumbers: true,
        style: { 
          marginTop: 30, 
          paddingTop: 20,
          textAlign: 'center',
        },
        children: [
          {
            id: uid(),
            type: 'divider',
            color: '#e5e5e5',
            thickness: 1,
          },
          {
            id: uid(),
            type: 'text',
            content: 'Thank you for your business!',
            style: { fontSize: 10, color: '#666', marginTop: 10, textAlign: 'center' },
          },
        ],
      },
      children: [
        {
          id: uid(),
          type: 'spacer',
          height: 20,
        },
        {
          id: uid(),
          type: 'view',
          style: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
          children: [
            {
              id: uid(),
              type: 'view',
              children: [
                {
                  id: uid(),
                  type: 'text',
                  content: 'Bill To:',
                  style: { fontSize: 10, color: '#666', marginBottom: 8 },
                },
                {
                  id: uid(),
                  type: 'text',
                  content: '{{client.name}}',
                  dynamic: true,
                  style: { fontSize: 14, fontWeight: 'bold' },
                },
                {
                  id: uid(),
                  type: 'text',
                  content: '{{client.address}}',
                  dynamic: true,
                  style: { fontSize: 10, color: '#666', marginTop: 4 },
                },
                {
                  id: uid(),
                  type: 'text',
                  content: '{{client.email}}',
                  dynamic: true,
                  style: { fontSize: 10, color: '#666', marginTop: 2 },
                },
              ],
            },
            {
              id: uid(),
              type: 'view',
              style: { textAlign: 'right' },
              children: [
                {
                  id: uid(),
                  type: 'text',
                  content: 'Invoice Date: {{invoice.date}}',
                  dynamic: true,
                  style: { fontSize: 10, color: '#666' },
                },
                {
                  id: uid(),
                  type: 'text',
                  content: 'Due Date: {{invoice.dueDate}}',
                  dynamic: true,
                  style: { fontSize: 10, color: '#666', marginTop: 4 },
                },
              ],
            },
          ],
        },
        {
          id: uid(),
          type: 'table',
          style: { marginTop: 20 },
          columns: [
            { width: '40%', header: 'Description' },
            { width: '15%', header: 'Qty' },
            { width: '20%', header: 'Unit Price' },
            { width: '25%', header: 'Amount' },
          ],
          headerRow: {
            id: uid(),
            type: 'table-row',
            style: { backgroundColor: '#1e3a5f' },
            cells: [
              {
                id: uid(),
                type: 'table-cell',
                children: [{ id: uid(), type: 'text', content: 'Description', style: { color: '#fff', fontWeight: 'bold' } }],
              },
              {
                id: uid(),
                type: 'table-cell',
                style: { textAlign: 'center' },
                children: [{ id: uid(), type: 'text', content: 'Qty', style: { color: '#fff', fontWeight: 'bold', textAlign: 'center' } }],
              },
              {
                id: uid(),
                type: 'table-cell',
                style: { textAlign: 'right' },
                children: [{ id: uid(), type: 'text', content: 'Unit Price', style: { color: '#fff', fontWeight: 'bold', textAlign: 'right' } }],
              },
              {
                id: uid(),
                type: 'table-cell',
                style: { textAlign: 'right' },
                children: [{ id: uid(), type: 'text', content: 'Amount', style: { color: '#fff', fontWeight: 'bold', textAlign: 'right' } }],
              },
            ],
          },
          rows: [], // Will be populated dynamically
        },
        {
          id: uid(),
          type: 'view',
          style: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 30 },
          children: [
            {
              id: uid(),
              type: 'view',
              style: { width: '40%' },
              children: [
                {
                  id: uid(),
                  type: 'view',
                  style: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
                  children: [
                    { id: uid(), type: 'text', content: 'Subtotal:', style: { color: '#666' } },
                    { id: uid(), type: 'text', content: '{{invoice.subtotal}}', dynamic: true },
                  ],
                },
                {
                  id: uid(),
                  type: 'view',
                  style: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
                  children: [
                    { id: uid(), type: 'text', content: 'Tax ({{invoice.taxRate}}%):', dynamic: true, style: { color: '#666' } },
                    { id: uid(), type: 'text', content: '{{invoice.tax}}', dynamic: true },
                  ],
                },
                {
                  id: uid(),
                  type: 'divider',
                  thickness: 2,
                  color: '#1e3a5f',
                },
                {
                  id: uid(),
                  type: 'view',
                  style: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
                  children: [
                    { id: uid(), type: 'text', content: 'Total:', style: { fontWeight: 'bold', fontSize: 16 } },
                    { id: uid(), type: 'text', content: '{{invoice.total}}', dynamic: true, style: { fontWeight: 'bold', fontSize: 16, color: '#1e3a5f' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: uid(),
          type: 'view',
          style: { marginTop: 40, padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8 },
          children: [
            { id: uid(), type: 'text', content: 'Payment Terms', style: { fontWeight: 'bold', marginBottom: 8 } },
            { id: uid(), type: 'text', content: '{{invoice.paymentTerms}}', dynamic: true, style: { fontSize: 10, color: '#666' } },
          ],
        },
      ],
    },
  ],
};

// Sample Report Template
export const reportTemplate: PDFDocumentNode = {
  id: uid(),
  type: 'document',
  title: 'Report',
  author: 'PDF Generator',
  pages: [
    {
      id: uid(),
      type: 'page',
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 60, right: 50, bottom: 60, left: 50 },
      header: {
        id: uid(),
        type: 'header',
        fixed: true,
        style: { marginBottom: 20 },
        children: [
          {
            id: uid(),
            type: 'view',
            style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
            children: [
              { id: uid(), type: 'text', content: '{{report.title}}', dynamic: true, style: { fontSize: 10, color: '#666' } },
              { id: uid(), type: 'text', content: '{{report.date}}', dynamic: true, style: { fontSize: 10, color: '#666' } },
            ],
          },
          { id: uid(), type: 'divider', thickness: 1, color: '#e5e5e5' },
        ],
      },
      footer: {
        id: uid(),
        type: 'footer',
        fixed: true,
        showPageNumbers: true,
        style: { paddingTop: 10 },
        children: [
          { id: uid(), type: 'divider', thickness: 1, color: '#e5e5e5' },
        ],
      },
      children: [
        {
          id: uid(),
          type: 'text',
          content: '{{report.title}}',
          dynamic: true,
          style: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginBottom: 10 },
        },
        {
          id: uid(),
          type: 'text',
          content: '{{report.subtitle}}',
          dynamic: true,
          style: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40 },
        },
        {
          id: uid(),
          type: 'text',
          content: 'Executive Summary',
          style: { fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 12 },
        },
        {
          id: uid(),
          type: 'text',
          content: '{{report.summary}}',
          dynamic: true,
          style: { fontSize: 11, lineHeight: 1.6, color: '#333', marginBottom: 30 },
        },
        {
          id: uid(),
          type: 'text',
          content: 'Key Findings',
          style: { fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 12 },
        },
        {
          id: uid(),
          type: 'text',
          content: '{{report.findings}}',
          dynamic: true,
          style: { fontSize: 11, lineHeight: 1.6, color: '#333', marginBottom: 30 },
        },
        {
          id: uid(),
          type: 'text',
          content: 'Recommendations',
          style: { fontSize: 18, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 12 },
        },
        {
          id: uid(),
          type: 'text',
          content: '{{report.recommendations}}',
          dynamic: true,
          style: { fontSize: 11, lineHeight: 1.6, color: '#333' },
        },
      ],
    },
  ],
};

// Sample data for Invoice
export const sampleInvoiceData: PDFDataContext = {
  company: {
    name: 'Acme Corporation',
    address: '123 Business Ave, Suite 100, San Francisco, CA 94102',
  },
  client: {
    name: 'John Smith',
    address: '456 Client Street, New York, NY 10001',
    email: 'john.smith@example.com',
  },
  invoice: {
    number: 'INV-2024-001',
    date: 'January 15, 2024',
    dueDate: 'February 15, 2024',
    subtotal: '$2,500.00',
    taxRate: '10',
    tax: '$250.00',
    total: '$2,750.00',
    paymentTerms: 'Payment is due within 30 days of invoice date. Please include invoice number on your check or wire transfer.',
  },
  items: [
    { description: 'Web Development Services', qty: 40, unitPrice: '$50.00', amount: '$2,000.00' },
    { description: 'UI/UX Design', qty: 10, unitPrice: '$50.00', amount: '$500.00' },
  ],
};

// Sample data for Report
export const sampleReportData: PDFDataContext = {
  report: {
    title: 'Q4 2024 Performance Report',
    subtitle: 'Quarterly Business Analysis & Insights',
    date: 'January 2024',
    summary: 'This quarterly report provides a comprehensive analysis of our business performance during Q4 2024. Key metrics show significant improvement across all departments, with revenue growth exceeding projections by 15%. Customer satisfaction scores reached an all-time high of 94%, while operational efficiency improved by 12% through strategic process optimizations.',
    findings: '1. Revenue increased by 23% compared to Q3 2024\n2. Customer acquisition cost decreased by 18%\n3. Employee retention rate improved to 92%\n4. New product launches contributed to 35% of total revenue\n5. International expansion resulted in 40% growth in overseas markets',
    recommendations: '1. Continue investment in digital transformation initiatives\n2. Expand the customer success team to maintain satisfaction levels\n3. Accelerate the product roadmap for Q1 2025\n4. Implement advanced analytics for better decision-making\n5. Explore strategic partnerships in emerging markets',
  },
};

// Template registry
export const templates = {
  invoice: {
    name: 'Invoice',
    description: 'Professional invoice template with itemized billing',
    schema: invoiceTemplate,
    sampleData: sampleInvoiceData,
  },
  report: {
    name: 'Business Report',
    description: 'Formal report template with sections and headings',
    schema: reportTemplate,
    sampleData: sampleReportData,
  },
  // Include extended templates
  ...extendedTemplates,
};

export type TemplateName = keyof typeof templates;
export type { ExtendedTemplateName };
