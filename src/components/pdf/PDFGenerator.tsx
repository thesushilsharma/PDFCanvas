"use client"

import React, { useState, useCallback } from 'react';
import { templates, TemplateName } from '@/lib/pdf/templates';
import { PDFDocumentNode, PDFDataContext } from '@/lib/pdf/types';
import { downloadXML } from '@/lib/pdf/xml-export';
import PDFPreview from './PDFPreview';
import SchemaEditor from './SchemaEditor';
import TemplateSelector from './TemplateSelector';
import SaveLoadDialog from './SaveLoadDialog';
import { VisualEditor } from './visual-editor';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { 
  FileText, 
  Code, 
  Eye, 
  Layers,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MousePointer2,
  Save,
  FolderOpen,
  FileCode2,
} from 'lucide-react';
import { toast } from 'sonner';

// Default blank document
const blankDocument: PDFDocumentNode = {
  id: 'doc-1',
  type: 'document',
  title: 'New Document',
  pages: [
    {
      id: 'page-1',
      type: 'page',
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 50, right: 50, bottom: 50, left: 50 },
      children: [],
    },
  ],
};

type ViewMode = 'templates' | 'editor';
type EditorTab = 'visual' | 'code' | 'dragdrop';

export const PDFGenerator: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('templates');
  const [editorTab, setEditorTab] = useState<EditorTab>('dragdrop');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName | null>(null);
  const [schema, setSchema] = useState<PDFDocumentNode>(blankDocument);
  const [data, setData] = useState<PDFDataContext>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  const handleSelectTemplate = useCallback((name: TemplateName) => {
    const template = templates[name];
    setSelectedTemplate(name);
    setSchema(template.schema);
    setData(template.sampleData);
    setViewMode('editor');
  }, []);

  const handleCreateBlank = useCallback(() => {
    setSelectedTemplate(null);
    setSchema(blankDocument);
    setData({});
    setViewMode('editor');
  }, []);

  const handleBackToTemplates = useCallback(() => {
    setViewMode('templates');
  }, []);

  const handleLoadLayout = useCallback((loadedSchema: PDFDocumentNode, loadedData: PDFDataContext) => {
    setSchema(loadedSchema);
    setData(loadedData);
    setSelectedTemplate(null);
    setViewMode('editor');
  }, []);

  const handleExportXML = useCallback(() => {
    downloadXML(schema, data, `${schema.title || 'document'}.xml`, { format: 'ubl' });
    toast.success('XML exported (UBL format)');
  }, [schema, data]);

  if (viewMode === 'templates') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">PDF Generator</h1>
                <p className="text-sm text-muted-foreground">
                  Production-grade PDF generation with React
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Template Selection */}
        <main className="container mx-auto py-8">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            onCreateBlank={handleCreateBlank}
          />

          {/* Features Overview */}
          <div className="px-6 mt-12">
            <h3 className="text-lg font-semibold mb-6">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Modular Components</h4>
                <p className="text-sm text-muted-foreground">
                  Build complex layouts with composable PDF components
                </p>
              </div>
              <div className="p-5 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium mb-2">JSON Schema</h4>
                <p className="text-sm text-muted-foreground">
                  Define documents with a flexible JSON-based schema
                </p>
              </div>
              <div className="p-5 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Live Preview</h4>
                <p className="text-sm text-muted-foreground">
                  See changes instantly with real-time PDF rendering
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Editor Header */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToTemplates}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Templates
          </Button>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {selectedTemplate ? templates[selectedTemplate].name : 'New Document'}
            </span>
          </div>
        </div>

        <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as EditorTab)}>
          <TabsList className="h-8">
            <TabsTrigger value="dragdrop" className="text-xs gap-1.5 px-3">
              <MousePointer2 className="h-3.5 w-3.5" />
              Drag & Drop
            </TabsTrigger>
            <TabsTrigger value="visual" className="text-xs gap-1.5 px-3">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs gap-1.5 px-3">
              <Code className="h-3.5 w-3.5" />
              Code
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(true)} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLoadDialogOpen(true)} className="gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" />
            Load
          </Button>
        <Button variant="outline" size="sm" onClick={handleExportXML} className="gap-1.5">
            <FileCode2 className="h-3.5 w-3.5" />
            XML
          </Button>
        </div>
      </header>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {editorTab === 'dragdrop' ? (
          <ResizablePanelGroup direction="horizontal">
            {/* Visual Editor */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <VisualEditor
                schema={schema}
                onSchemaChange={setSchema}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Preview */}
            <ResizablePanel defaultSize={40} minSize={25}>
              <PDFPreview
                schema={schema}
                data={data}
                filename={`${selectedTemplate || 'document'}.pdf`}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <ResizablePanelGroup direction="horizontal">
            {/* Sidebar */}
            <ResizablePanel 
              defaultSize={30} 
              minSize={sidebarCollapsed ? 3 : 20} 
              maxSize={sidebarCollapsed ? 3 : 50}
              className="relative"
            >
              {sidebarCollapsed ? (
                <div className="h-full flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarCollapsed(false)}
                    className="h-full w-full rounded-none"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(true)}
                    className="absolute top-2 right-2 z-10 h-6 w-6"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <SchemaEditor
                    schema={schema}
                    data={data}
                    onSchemaChange={setSchema}
                    onDataChange={setData}
                  />
                </>
              )}
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Preview */}
            <ResizablePanel defaultSize={70} minSize={40}>
              <PDFPreview
                schema={schema}
                data={data}
                filename={`${selectedTemplate || 'document'}.pdf`}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* Save/Load Dialogs */}
      <SaveLoadDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        mode="save"
        schema={schema}
        data={data}
        onLoad={handleLoadLayout}
      />
      <SaveLoadDialog
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
        mode="load"
        schema={schema}
        data={data}
        onLoad={handleLoadLayout}
      />
    </div>
  );
};

export default PDFGenerator;
