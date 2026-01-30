import { PDFDocumentNode, PDFDataContext } from './types';

const uid = () => Math.random().toString(36).substring(2, 9);

// Contract Template
export const contractTemplate: PDFDocumentNode = {
  id: uid(),
  type: 'document',
  title: 'Service Agreement',
  author: 'PDF Generator',
  pages: [
    {
      id: uid(),
      type: 'page',
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 50, right: 60, bottom: 60, left: 60 },
      header: {
        id: uid(),
        type: 'header',
        fixed: true,
        style: { marginBottom: 20, textAlign: 'center' },
        children: [
          {
            id: uid(),
            type: 'text',
            content: 'SERVICE AGREEMENT',
            style: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', letterSpacing: 3 },
          },
        ],
      },
      footer: {
        id: uid(),
        type: 'footer',
        fixed: true,
        showPageNumbers: true,
        style: { marginTop: 30, paddingTop: 15 },
        children: [
          { id: uid(), type: 'divider', thickness: 1, color: '#e5e5e5' },
          {
            id: uid(),
            type: 'view',
            style: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
            children: [
              { id: uid(), type: 'text', content: 'Contract #{{contract.number}}', dynamic: true, style: { fontSize: 8, color: '#999' } },
              { id: uid(), type: 'text', content: 'Confidential', style: { fontSize: 8, color: '#999' } },
            ],
          },
        ],
      },
      children: [
        { id: uid(), type: 'spacer', height: 20 },
        {
          id: uid(),
          type: 'text',
          content: 'Contract Number: {{contract.number}}',
          dynamic: true,
          style: { fontSize: 10, color: '#666', marginBottom: 5 },
        },
        {
          id: uid(),
          type: 'text',
          content: 'Effective Date: {{contract.effectiveDate}}',
          dynamic: true,
          style: { fontSize: 10, color: '#666', marginBottom: 30 },
        },
        {
          id: uid(),
          type: 'text',
          content: 'PARTIES',
          style: { fontSize: 14, fontWeight: 'bold', marginBottom: 15, color: '#1e3a5f' },
        },
        {
          id: uid(),
          type: 'view',
          style: { marginBottom: 25, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4 },
          children: [
            { id: uid(), type: 'text', content: 'Service Provider:', style: { fontSize: 10, fontWeight: 'bold', marginBottom: 5 } },
            { id: uid(), type: 'text', content: '{{provider.name}}', dynamic: true, style: { fontSize: 11, marginBottom: 3 } },
            { id: uid(), type: 'text', content: '{{provider.address}}', dynamic: true, style: { fontSize: 10, color: '#666' } },
          ],
        },
        {
          id: uid(),
          type: 'view',
          style: { marginBottom: 25, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 4 },
          children: [
            { id: uid(), type: 'text', content: 'Client:', style: { fontSize: 10, fontWeight: 'bold', marginBottom: 5 } },
            { id: uid(), type: 'text', content: '{{client.name}}', dynamic: true, style: { fontSize: 11, marginBottom: 3 } },
            { id: uid(), type: 'text', content: '{{client.address}}', dynamic: true, style: { fontSize: 10, color: '#666' } },
          ],
        },
        {
          id: uid(),
          type: 'text',
          content: '1. SCOPE OF SERVICES',
          style: { fontSize: 12, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#1e3a5f' },
        },
        {
          id: uid(),
          type: 'text',
          content: '{{contract.scope}}',
          dynamic: true,
          style: { fontSize: 10, lineHeight: 1.6, color: '#333', marginBottom: 20 },
        },
        {
          id: uid(),
          type: 'text',
          content: '2. TERM AND TERMINATION',
          style: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#1e3a5f' },
        },
        {
          id: uid(),
          type: 'text',
          content: '{{contract.terms}}',
          dynamic: true,
          style: { fontSize: 10, lineHeight: 1.6, color: '#333', marginBottom: 20 },
        },
        {
          id: uid(),
          type: 'text',
          content: '3. COMPENSATION',
          style: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#1e3a5f' },
        },
        {
          id: uid(),
          type: 'text',
          content: '{{contract.compensation}}',
          dynamic: true,
          style: { fontSize: 10, lineHeight: 1.6, color: '#333', marginBottom: 40 },
        },
        {
          id: uid(),
          type: 'view',
          style: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
          children: [
            {
              id: uid(),
              type: 'view',
              style: { width: '45%' },
              children: [
                { id: uid(), type: 'divider', thickness: 1, color: '#333' },
                { id: uid(), type: 'text', content: '{{provider.name}}', dynamic: true, style: { fontSize: 10, marginTop: 8 } },
                { id: uid(), type: 'text', content: 'Service Provider', style: { fontSize: 9, color: '#666', marginTop: 2 } },
                { id: uid(), type: 'text', content: 'Date: ________________', style: { fontSize: 9, color: '#666', marginTop: 15 } },
              ],
            },
            {
              id: uid(),
              type: 'view',
              style: { width: '45%' },
              children: [
                { id: uid(), type: 'divider', thickness: 1, color: '#333' },
                { id: uid(), type: 'text', content: '{{client.name}}', dynamic: true, style: { fontSize: 10, marginTop: 8 } },
                { id: uid(), type: 'text', content: 'Client', style: { fontSize: 9, color: '#666', marginTop: 2 } },
                { id: uid(), type: 'text', content: 'Date: ________________', style: { fontSize: 9, color: '#666', marginTop: 15 } },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Certificate Template
export const certificateTemplate: PDFDocumentNode = {
  id: uid(),
  type: 'document',
  title: 'Certificate of Completion',
  author: 'PDF Generator',
  pages: [
    {
      id: uid(),
      type: 'page',
      size: 'A4',
      orientation: 'landscape',
      margins: { top: 40, right: 60, bottom: 40, left: 60 },
      children: [
        {
          id: uid(),
          type: 'view',
          style: { 
            border: '3px solid #c9a227', 
            padding: 40, 
            minHeight: '100%',
            backgroundColor: '#fffef8',
          },
          children: [
            {
              id: uid(),
              type: 'text',
              content: '★ CERTIFICATE OF COMPLETION ★',
              style: { 
                fontSize: 32, 
                fontWeight: 'bold', 
                color: '#1e3a5f', 
                textAlign: 'center',
                letterSpacing: 2,
                marginBottom: 10,
              },
            },
            {
              id: uid(),
              type: 'text',
              content: '{{certificate.organization}}',
              dynamic: true,
              style: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 40 },
            },
            {
              id: uid(),
              type: 'text',
              content: 'This is to certify that',
              style: { fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 15 },
            },
            {
              id: uid(),
              type: 'text',
              content: '{{certificate.recipientName}}',
              dynamic: true,
              style: { 
                fontSize: 36, 
                fontWeight: 'bold', 
                color: '#1e3a5f', 
                textAlign: 'center',
                marginBottom: 20,
              },
            },
            {
              id: uid(),
              type: 'text',
              content: 'has successfully completed',
              style: { fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 15 },
            },
            {
              id: uid(),
              type: 'text',
              content: '{{certificate.courseName}}',
              dynamic: true,
              style: { 
                fontSize: 22, 
                fontWeight: 'bold', 
                color: '#c9a227', 
                textAlign: 'center',
                marginBottom: 10,
              },
            },
            {
              id: uid(),
              type: 'text',
              content: '{{certificate.description}}',
              dynamic: true,
              style: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 40 },
            },
            {
              id: uid(),
              type: 'text',
              content: 'Awarded on {{certificate.date}}',
              dynamic: true,
              style: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 40 },
            },
            {
              id: uid(),
              type: 'view',
              style: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
              children: [
                {
                  id: uid(),
                  type: 'view',
                  style: { textAlign: 'center', width: '30%' },
                  children: [
                    { id: uid(), type: 'divider', thickness: 1, color: '#333' },
                    { id: uid(), type: 'text', content: '{{certificate.issuerName}}', dynamic: true, style: { fontSize: 11, marginTop: 8 } },
                    { id: uid(), type: 'text', content: '{{certificate.issuerTitle}}', dynamic: true, style: { fontSize: 9, color: '#666', marginTop: 2 } },
                  ],
                },
                {
                  id: uid(),
                  type: 'view',
                  style: { textAlign: 'center', width: '30%' },
                  children: [
                    { id: uid(), type: 'text', content: 'Certificate ID', style: { fontSize: 9, color: '#999' } },
                    { id: uid(), type: 'text', content: '{{certificate.id}}', dynamic: true, style: { fontSize: 10, marginTop: 4 } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Letterhead Template
export const letterheadTemplate: PDFDocumentNode = {
  id: uid(),
  type: 'document',
  title: 'Business Letter',
  author: 'PDF Generator',
  pages: [
    {
      id: uid(),
      type: 'page',
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 40, right: 60, bottom: 60, left: 60 },
      header: {
        id: uid(),
        type: 'header',
        fixed: true,
        style: { marginBottom: 30 },
        children: [
          {
            id: uid(),
            type: 'view',
            style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
            children: [
              {
                id: uid(),
                type: 'view',
                children: [
                  { id: uid(), type: 'text', content: '{{company.name}}', dynamic: true, style: { fontSize: 22, fontWeight: 'bold', color: '#1e3a5f' } },
                  { id: uid(), type: 'text', content: '{{company.tagline}}', dynamic: true, style: { fontSize: 10, color: '#666', marginTop: 2 } },
                ],
              },
              {
                id: uid(),
                type: 'view',
                style: { textAlign: 'right' },
                children: [
                  { id: uid(), type: 'text', content: '{{company.address}}', dynamic: true, style: { fontSize: 9, color: '#666' } },
                  { id: uid(), type: 'text', content: '{{company.phone}}', dynamic: true, style: { fontSize: 9, color: '#666', marginTop: 2 } },
                  { id: uid(), type: 'text', content: '{{company.email}}', dynamic: true, style: { fontSize: 9, color: '#666', marginTop: 2 } },
                  { id: uid(), type: 'text', content: '{{company.website}}', dynamic: true, style: { fontSize: 9, color: '#1e3a5f', marginTop: 2 } },
                ],
              },
            ],
          },
          { id: uid(), type: 'divider', thickness: 2, color: '#1e3a5f' },
        ],
      },
      footer: {
        id: uid(),
        type: 'footer',
        fixed: true,
        showPageNumbers: true,
        style: { paddingTop: 20 },
        children: [
          { id: uid(), type: 'divider', thickness: 1, color: '#e5e5e5' },
          { 
            id: uid(), 
            type: 'text', 
            content: '{{company.address}} | {{company.phone}} | {{company.email}}', 
            dynamic: true,
            style: { fontSize: 8, color: '#999', textAlign: 'center', marginTop: 10 } 
          },
        ],
      },
      children: [
        { id: uid(), type: 'spacer', height: 30 },
        {
          id: uid(),
          type: 'text',
          content: '{{letter.date}}',
          dynamic: true,
          style: { fontSize: 11, marginBottom: 30 },
        },
        {
          id: uid(),
          type: 'view',
          style: { marginBottom: 30 },
          children: [
            { id: uid(), type: 'text', content: '{{recipient.name}}', dynamic: true, style: { fontSize: 11, fontWeight: 'bold' } },
            { id: uid(), type: 'text', content: '{{recipient.title}}', dynamic: true, style: { fontSize: 11 } },
            { id: uid(), type: 'text', content: '{{recipient.company}}', dynamic: true, style: { fontSize: 11 } },
            { id: uid(), type: 'text', content: '{{recipient.address}}', dynamic: true, style: { fontSize: 11 } },
          ],
        },
        {
          id: uid(),
          type: 'text',
          content: 'Re: {{letter.subject}}',
          dynamic: true,
          style: { fontSize: 11, fontWeight: 'bold', marginBottom: 20 },
        },
        {
          id: uid(),
          type: 'text',
          content: 'Dear {{recipient.salutation}},',
          dynamic: true,
          style: { fontSize: 11, marginBottom: 15 },
        },
        {
          id: uid(),
          type: 'text',
          content: '{{letter.body}}',
          dynamic: true,
          style: { fontSize: 11, lineHeight: 1.6, marginBottom: 30 },
        },
        {
          id: uid(),
          type: 'text',
          content: '{{letter.closing}},',
          dynamic: true,
          style: { fontSize: 11, marginBottom: 50 },
        },
        {
          id: uid(),
          type: 'view',
          children: [
            { id: uid(), type: 'text', content: '{{sender.name}}', dynamic: true, style: { fontSize: 11, fontWeight: 'bold' } },
            { id: uid(), type: 'text', content: '{{sender.title}}', dynamic: true, style: { fontSize: 11 } },
          ],
        },
      ],
    },
  ],
};

// Sample data for Contract
export const sampleContractData: PDFDataContext = {
  contract: {
    number: 'SA-2024-001',
    effectiveDate: 'January 20, 2024',
    scope: 'The Service Provider agrees to provide professional consulting services including but not limited to: project management, technical advisory, and strategic planning support. All services will be delivered in accordance with industry best practices and the specifications outlined in Exhibit A attached hereto.',
    terms: 'This Agreement shall commence on the Effective Date and continue for a period of twelve (12) months unless terminated earlier in accordance with the provisions herein. Either party may terminate this Agreement with thirty (30) days written notice.',
    compensation: 'In consideration of the services provided, the Client agrees to pay the Service Provider a monthly retainer of $5,000 USD, payable within 15 days of invoice receipt. Additional services beyond the scope shall be billed at $150 USD per hour.',
  },
  provider: {
    name: 'Acme Consulting LLC',
    address: '123 Business Park, Suite 500, San Francisco, CA 94102',
  },
  client: {
    name: 'TechStart Inc.',
    address: '456 Innovation Way, Austin, TX 78701',
  },
};

// Sample data for Certificate
export const sampleCertificateData: PDFDataContext = {
  certificate: {
    organization: 'Professional Development Institute',
    recipientName: 'Alexandra Johnson',
    courseName: 'Advanced Project Management',
    description: 'Demonstrating proficiency in agile methodologies, risk management, and team leadership with 40 hours of instruction',
    date: 'January 15, 2024',
    issuerName: 'Dr. Michael Chen',
    issuerTitle: 'Director of Education',
    id: 'CERT-2024-PM-0847',
  },
};

// Sample data for Letterhead
export const sampleLetterheadData: PDFDataContext = {
  company: {
    name: 'Acme Corporation',
    tagline: 'Innovation Delivered',
    address: '123 Business Ave, Suite 100, San Francisco, CA 94102',
    phone: '+1 (555) 123-4567',
    email: 'contact@acmecorp.com',
    website: 'www.acmecorp.com',
  },
  recipient: {
    name: 'John Smith',
    title: 'Director of Operations',
    company: 'TechStart Inc.',
    address: '456 Innovation Way, Austin, TX 78701',
    salutation: 'Mr. Smith',
  },
  letter: {
    date: 'January 20, 2024',
    subject: 'Partnership Proposal',
    body: 'I hope this letter finds you well. I am writing to express our interest in exploring a potential partnership between Acme Corporation and TechStart Inc.\n\nAs you may be aware, our companies share a common vision for innovation and excellence in the technology sector. We believe that by combining our respective strengths, we can create significant value for both organizations and our customers.\n\nI would welcome the opportunity to discuss this proposal in more detail at your earliest convenience. Please feel free to contact me directly to schedule a meeting.',
    closing: 'Best regards',
  },
  sender: {
    name: 'Jane Doe',
    title: 'Vice President, Business Development',
  },
};

// Extended templates registry
export const extendedTemplates = {
  contract: {
    name: 'Service Contract',
    description: 'Professional service agreement with signature blocks',
    schema: contractTemplate,
    sampleData: sampleContractData,
  },
  certificate: {
    name: 'Certificate',
    description: 'Award or completion certificate with elegant design',
    schema: certificateTemplate,
    sampleData: sampleCertificateData,
  },
  letterhead: {
    name: 'Business Letter',
    description: 'Professional letterhead with company branding',
    schema: letterheadTemplate,
    sampleData: sampleLetterheadData,
  },
};

export type ExtendedTemplateName = keyof typeof extendedTemplates;
