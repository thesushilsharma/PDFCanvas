import { PDFDocumentNode, PDFDataContext } from './types';

const STORAGE_KEY_LAYOUTS = 'pdf-generator-layouts';
const STORAGE_KEY_RECENT = 'pdf-generator-recent';

export interface SavedLayout {
  id: string;
  name: string;
  description?: string;
  schema: PDFDocumentNode;
  data: PDFDataContext;
  createdAt: string;
  updatedAt: string;
}

export interface RecentDocument {
  id: string;
  name: string;
  updatedAt: string;
}

// Generate unique ID
const generateId = () => `layout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Get all saved layouts
export function getSavedLayouts(): SavedLayout[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LAYOUTS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading layouts from localStorage:', error);
    return [];
  }
}

// Save a new layout
export function saveLayout(
  name: string,
  schema: PDFDocumentNode,
  data: PDFDataContext,
  description?: string
): SavedLayout {
  const layouts = getSavedLayouts();
  const now = new Date().toISOString();
  
  const newLayout: SavedLayout = {
    id: generateId(),
    name,
    description,
    schema,
    data,
    createdAt: now,
    updatedAt: now,
  };
  
  layouts.unshift(newLayout);
  localStorage.setItem(STORAGE_KEY_LAYOUTS, JSON.stringify(layouts));
  
  // Update recent documents
  updateRecentDocuments(newLayout.id, name);
  
  return newLayout;
}

// Update an existing layout
export function updateLayout(
  id: string,
  updates: Partial<Omit<SavedLayout, 'id' | 'createdAt'>>
): SavedLayout | null {
  const layouts = getSavedLayouts();
  const index = layouts.findIndex((l) => l.id === id);
  
  if (index === -1) return null;
  
  const updatedLayout = {
    ...layouts[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  layouts[index] = updatedLayout;
  localStorage.setItem(STORAGE_KEY_LAYOUTS, JSON.stringify(layouts));
  
  // Update recent documents
  updateRecentDocuments(id, updatedLayout.name);
  
  return updatedLayout;
}

// Delete a layout
export function deleteLayout(id: string): boolean {
  const layouts = getSavedLayouts();
  const filtered = layouts.filter((l) => l.id !== id);
  
  if (filtered.length === layouts.length) return false;
  
  localStorage.setItem(STORAGE_KEY_LAYOUTS, JSON.stringify(filtered));
  
  // Remove from recent
  const recent = getRecentDocuments().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recent));
  
  return true;
}

// Load a specific layout
export function loadLayout(id: string): SavedLayout | null {
  const layouts = getSavedLayouts();
  return layouts.find((l) => l.id === id) || null;
}

// Recent documents management
export function getRecentDocuments(): RecentDocument[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RECENT);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function updateRecentDocuments(id: string, name: string): void {
  const recent = getRecentDocuments().filter((r) => r.id !== id);
  recent.unshift({
    id,
    name,
    updatedAt: new Date().toISOString(),
  });
  
  // Keep only last 10 recent documents
  localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recent.slice(0, 10)));
}

// Export layout as JSON file
export function exportLayoutAsJSON(layout: SavedLayout): void {
  const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${layout.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import layout from JSON file
export function importLayoutFromJSON(file: File): Promise<SavedLayout> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Validate required fields
        if (!data.schema || !data.name) {
          throw new Error('Invalid layout file');
        }
        
        const layout = saveLayout(
          data.name,
          data.schema,
          data.data || {},
          data.description
        );
        resolve(layout);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
