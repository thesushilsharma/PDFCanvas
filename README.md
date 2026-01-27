# PDFCanvas

PDFCanvas is a production-grade, pixel-perfect PDF generation platform for React, combining a visual editor with deterministic rendering.
It built with React, Next.js, TypeScript, TailwindCSS, and @react-pdf/renderer. Design documents visually, manage a JSON schema, and export professional PDFs such as invoices, reports, or letters.

## Features

- **Visual editor** for precise layout and styling
- **Live preview** powered by `@react-pdf/renderer`
- **JSON schema editor** to define dynamic data
- **Template selector** to start from presets
- **Save / load** templates with a friendly dialog
- **Keyboard shortcuts** for productivity
- **Modern UI** using shadcn/ui and Radix primitives

## Tech Stack

- **App**: React 19, TypeScript, Next.js 16
- **UI**: TailwindCSS, shadcn/ui, Radix UI, lucide-react icons
- **PDF**: `@react-pdf/renderer`
- **State & Data**: TanStack Query
- **Editor**: Tiptap (rich text and formatting)
- **Drag & Drop**: dnd-kit

## How It Works

- **Templates**: Define the structure of your document (sections, blocks, text, images, etc.).
- **Schema**: Provide the data model that populates dynamic fields.
- **Visual Editor**: Arrange content, tweak spacing, fonts, and alignment with real‑time feedback.
- **Preview**: Rendering is handled by `@react-pdf/renderer` for high‑fidelity output.
- **Export**: Download a PDF from the current template + data.

## Usage Guide

1. **Start a new document**: From the Template Selector, pick a base layout.
2. **Edit content**: Use the Visual Editor to add blocks, text, and images.
3. **Bind data**: Open the Schema Editor to define fields and sample values; reference them in components.
4. **Preview changes**: The PDF Preview updates live as you edit.
5. **Save & load**: Store your work-in-progress; load it later to continue.
6. **Export**: Generate and download the final PDF.

## Configuration

- **TailwindCSS**: Configured via `globals.css` and `postcss.config.js`.
- **shadcn/ui**: Component styles are generated; see `components.json`.

## License

This project is licensed under the MIT License. Please take a look at the [LICENSE](LICENSE) file for details.
