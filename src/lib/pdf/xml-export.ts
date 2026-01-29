import { PDFDocumentNode, PDFDataContext } from './types';

// UBL 2.1 compatible XML export for e-invoicing (PINT AE compatible structure)
// Reference: https://docs.peppol.eu/poacc/billing/3.0/

interface XMLExportOptions {
  format: 'ubl' | 'pint-ae' | 'simple';
  version?: string;
  customNamespaces?: Record<string, string>;
}

// XML escape helper
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Format date to ISO
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

// Generate unique ID
function generateDocumentId(): string {
  return `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

// Simple XML format (generic document structure)
function generateSimpleXML(schema: PDFDocumentNode, data: PDFDataContext): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Document xmlns="urn:pdf-generator:document:1.0">',
    `  <Metadata>`,
    `    <Title>${escapeXML(schema.title || 'Untitled')}</Title>`,
    `    <Author>${escapeXML(schema.author || '')}</Author>`,
    `    <CreatedAt>${new Date().toISOString()}</CreatedAt>`,
    `    <DocumentId>${generateDocumentId()}</DocumentId>`,
    `  </Metadata>`,
    `  <Data>`,
  ];

  // Serialize data context
  function serializeObject(obj: unknown, indent: number): string[] {
    const output: string[] = [];
    const spaces = '  '.repeat(indent);

    if (obj === null || obj === undefined) {
      return output;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        output.push(`${spaces}<Item index="${index}">`);
        output.push(...serializeObject(item, indent + 1));
        output.push(`${spaces}</Item>`);
      });
    } else if (typeof obj === 'object') {
      Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
        const safeName = key.replace(/[^a-zA-Z0-9_]/g, '_');
        if (typeof value === 'object' && value !== null) {
          output.push(`${spaces}<${safeName}>`);
          output.push(...serializeObject(value, indent + 1));
          output.push(`${spaces}</${safeName}>`);
        } else {
          output.push(`${spaces}<${safeName}>${escapeXML(String(value))}</${safeName}>`);
        }
      });
    } else {
      output.push(`${spaces}${escapeXML(String(obj))}`);
    }

    return output;
  }

  lines.push(...serializeObject(data, 2));
  lines.push('  </Data>');
  lines.push('</Document>');

  return lines.join('\n');
}

// UBL 2.1 Invoice format
function generateUBLInvoice(schema: PDFDocumentNode, data: PDFDataContext): string {
  const invoice = (data.invoice || {}) as Record<string, unknown>;
  const company = (data.company || {}) as Record<string, unknown>;
  const client = (data.client || {}) as Record<string, unknown>;
  const items = (data.items || []) as Array<Record<string, unknown>>;

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"',
    '         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"',
    '         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">',
    '',
    `  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>`,
    `  <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>`,
    `  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>`,
    `  <cbc:ID>${escapeXML(String(invoice.number || generateDocumentId()))}</cbc:ID>`,
    `  <cbc:IssueDate>${formatDate(String(invoice.date || new Date().toISOString()))}</cbc:IssueDate>`,
    `  <cbc:DueDate>${formatDate(String(invoice.dueDate || new Date().toISOString()))}</cbc:DueDate>`,
    `  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>`,
    `  <cbc:DocumentCurrencyCode>USD</cbc:DocumentCurrencyCode>`,
    '',
    '  <!-- Supplier Party -->',
    '  <cac:AccountingSupplierParty>',
    '    <cac:Party>',
    '      <cac:PartyName>',
    `        <cbc:Name>${escapeXML(String(company.name || ''))}</cbc:Name>`,
    '      </cac:PartyName>',
    '      <cac:PostalAddress>',
    `        <cbc:StreetName>${escapeXML(String(company.address || ''))}</cbc:StreetName>`,
    '      </cac:PostalAddress>',
    '    </cac:Party>',
    '  </cac:AccountingSupplierParty>',
    '',
    '  <!-- Customer Party -->',
    '  <cac:AccountingCustomerParty>',
    '    <cac:Party>',
    '      <cac:PartyName>',
    `        <cbc:Name>${escapeXML(String(client.name || ''))}</cbc:Name>`,
    '      </cac:PartyName>',
    '      <cac:PostalAddress>',
    `        <cbc:StreetName>${escapeXML(String(client.address || ''))}</cbc:StreetName>`,
    '      </cac:PostalAddress>',
    '      <cac:Contact>',
    `        <cbc:ElectronicMail>${escapeXML(String(client.email || ''))}</cbc:ElectronicMail>`,
    '      </cac:Contact>',
    '    </cac:Party>',
    '  </cac:AccountingCustomerParty>',
    '',
    '  <!-- Payment Terms -->',
    '  <cac:PaymentTerms>',
    `    <cbc:Note>${escapeXML(String(invoice.paymentTerms || ''))}</cbc:Note>`,
    '  </cac:PaymentTerms>',
    '',
    '  <!-- Tax Total -->',
    '  <cac:TaxTotal>',
    `    <cbc:TaxAmount currencyID="USD">${parseAmount(String(invoice.tax || '0'))}</cbc:TaxAmount>`,
    '  </cac:TaxTotal>',
    '',
    '  <!-- Legal Monetary Total -->',
    '  <cac:LegalMonetaryTotal>',
    `    <cbc:LineExtensionAmount currencyID="USD">${parseAmount(String(invoice.subtotal || '0'))}</cbc:LineExtensionAmount>`,
    `    <cbc:TaxExclusiveAmount currencyID="USD">${parseAmount(String(invoice.subtotal || '0'))}</cbc:TaxExclusiveAmount>`,
    `    <cbc:TaxInclusiveAmount currencyID="USD">${parseAmount(String(invoice.total || '0'))}</cbc:TaxInclusiveAmount>`,
    `    <cbc:PayableAmount currencyID="USD">${parseAmount(String(invoice.total || '0'))}</cbc:PayableAmount>`,
    '  </cac:LegalMonetaryTotal>',
    '',
  ];

  // Invoice Lines
  items.forEach((item, index) => {
    lines.push(`  <!-- Invoice Line ${index + 1} -->`);
    lines.push('  <cac:InvoiceLine>');
    lines.push(`    <cbc:ID>${index + 1}</cbc:ID>`);
    lines.push(`    <cbc:InvoicedQuantity unitCode="EA">${item.qty || 1}</cbc:InvoicedQuantity>`);
    lines.push(`    <cbc:LineExtensionAmount currencyID="USD">${parseAmount(String(item.amount || '0'))}</cbc:LineExtensionAmount>`);
    lines.push('    <cac:Item>');
    lines.push(`      <cbc:Description>${escapeXML(String(item.description || ''))}</cbc:Description>`);
    lines.push(`      <cbc:Name>${escapeXML(String(item.description || ''))}</cbc:Name>`);
    lines.push('    </cac:Item>');
    lines.push('    <cac:Price>');
    lines.push(`      <cbc:PriceAmount currencyID="USD">${parseAmount(String(item.unitPrice || '0'))}</cbc:PriceAmount>`);
    lines.push('    </cac:Price>');
    lines.push('  </cac:InvoiceLine>');
    lines.push('');
  });

  lines.push('</Invoice>');

  return lines.join('\n');
}

// Parse currency amount string to number
function parseAmount(amountStr: string): string {
  const cleaned = amountStr.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}

// PINT AE (UAE) specific format
function generatePINTAE(schema: PDFDocumentNode, data: PDFDataContext): string {
  // PINT AE is based on UBL 2.1 with additional UAE-specific fields
  const baseXML = generateUBLInvoice(schema, data);
  
  // Add UAE-specific namespace and elements
  return baseXML
    .replace(
      '<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"',
      '<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"\n         xmlns:uae="urn:pint:ae:uae:extensions:1.0"'
    )
    .replace(
      '<cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>',
      '<cbc:CustomizationID>urn:pint.ae:trns:invoice:1.0</cbc:CustomizationID>'
    );
}

// Main export function
export function exportToXML(
  schema: PDFDocumentNode,
  data: PDFDataContext,
  options: XMLExportOptions = { format: 'simple' }
): string {
  switch (options.format) {
    case 'ubl':
      return generateUBLInvoice(schema, data);
    case 'pint-ae':
      return generatePINTAE(schema, data);
    case 'simple':
    default:
      return generateSimpleXML(schema, data);
  }
}

// Download XML file
export function downloadXML(
  schema: PDFDocumentNode,
  data: PDFDataContext,
  filename: string,
  options?: XMLExportOptions
): void {
  const xml = exportToXML(schema, data, options);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xml') ? filename : `${filename}.xml`;
  a.click();
  URL.revokeObjectURL(url);
}

// Validate XML structure (basic)
export function validateXML(xmlString: string): { valid: boolean; error?: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const errorNode = doc.querySelector('parsererror');
    
    if (errorNode) {
      return { valid: false, error: errorNode.textContent || 'Parse error' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: String(error) };
  }
}
