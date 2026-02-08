# PDFCanvas

PDFCanvas is a production-grade, pixel-perfect PDF generation platform for React, combining a visual editor with deterministic rendering.
Built with React, Next.js, TypeScript, TailwindCSS, and @react-pdf/renderer. Design documents visually, manage a JSON schema, and export professional PDFs such as invoices, reports, or letters.

## Features

- **Visual editor** for precise layout and styling
- **Live preview** powered by `@react-pdf/renderer`
- **JSON schema editor** to define dynamic data
- **Template selector** to start from presets
- **Save / load** templates with a friendly dialog
- **Keyboard shortcuts** for productivity
- **Modern UI** using shadcn/ui and Radix primitives

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **Package manager**: npm, pnpm, or yarn

### Installation

```bash
# Using npm
npm install

# Or using pnpm
pnpm install

# Or using yarn
yarn install
```

### Development

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

## Project Structure

```
src/
├── app/              # Next.js 16 App Router
│   ├── (pages)/     # Page routes
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Home page
├── components/
│   ├── ui/          # shadcn/ui components (buttons, dialogs, etc.)
│   ├── pdf/         # PDF generation components
│   └── NavLink.tsx  # Navigation components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and helpers
└── context/         # React context providers
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19, TypeScript 5
- **Styling**: Tailwind CSS v4, shadcn/ui, Radix UI
- **Icons**: lucide-react
- **PDF Generation**: `@react-pdf/renderer`
- **State Management**: TanStack Query (React Query)
- **Rich Text Editor**: Tiptap with extensions
- **Drag & Drop**: dnd-kit
- **Animations**: motion (formerly framer-motion)
- **Code Quality**: Biome (linting & formatting)
- **Theme**: next-themes (dark mode support)

## Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run Biome linter checks
- `npm run format` - Format code with Biome

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

- **TailwindCSS**: Configured via `globals.css` and `postcss.config.mjs`.
- **shadcn/ui**: Component styles are generated; see `components.json`.

## License

This project is licensed under the MIT License. Please take a look at the [LICENSE](LICENSE) file for details.
