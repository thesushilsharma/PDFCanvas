import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PDFDocumentNode, PDFDataContext } from '@/lib/pdf/types';
import { FileJson, Database, Settings } from 'lucide-react';

interface SchemaEditorProps {
  schema: PDFDocumentNode;
  data: PDFDataContext;
  onSchemaChange: (schema: PDFDocumentNode) => void;
  onDataChange: (data: PDFDataContext) => void;
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({
  schema,
  data,
  onSchemaChange,
  onDataChange,
}) => {
  const handleSchemaEdit = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      onSchemaChange(parsed);
    } catch {
      // Invalid JSON, don't update
    }
  };

  const handleDataEdit = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      onDataChange(parsed);
    } catch {
      // Invalid JSON, don't update
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <Tabs defaultValue="schema" className="flex-1 flex flex-col">
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="schema" className="text-xs gap-1.5">
              <FileJson className="h-3.5 w-3.5" />
              Schema
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Data
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="schema" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="mb-3">
                <h3 className="text-sm font-medium mb-1">Document Schema</h3>
                <p className="text-xs text-muted-foreground">
                  Define your PDF structure using JSON
                </p>
              </div>
              <textarea
                className="w-full h-[calc(100vh-280px)] p-3 font-mono text-xs bg-surface-sunken rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                value={JSON.stringify(schema, null, 2)}
                onChange={(e) => handleSchemaEdit(e.target.value)}
                spellCheck={false}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="data" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="mb-3">
                <h3 className="text-sm font-medium mb-1">Document Data</h3>
                <p className="text-xs text-muted-foreground">
                  Variables to populate dynamic content
                </p>
              </div>
              <textarea
                className="w-full h-[calc(100vh-280px)] p-3 font-mono text-xs bg-surface-sunken rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                value={JSON.stringify(data, null, 2)}
                onChange={(e) => handleDataEdit(e.target.value)}
                spellCheck={false}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Export Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">
                      Filename
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-surface-sunken rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                      defaultValue="document.pdf"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">
                      Paper Size
                    </label>
                    <select className="w-full px-3 py-2 text-sm bg-surface-sunken rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="A4">A4</option>
                      <option value="LETTER">Letter</option>
                      <option value="LEGAL">Legal</option>
                      <option value="A3">A3</option>
                      <option value="A5">A5</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">
                      Orientation
                    </label>
                    <select className="w-full px-3 py-2 text-sm bg-surface-sunken rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-3">Performance</h3>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm">Compress PDF</p>
                    <p className="text-xs text-muted-foreground">
                      Reduce file size for large documents
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchemaEditor;
