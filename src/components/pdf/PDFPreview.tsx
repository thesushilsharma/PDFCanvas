import React, { useState, useMemo } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { PDFRenderer } from '@/lib/pdf/renderer';
import { PDFDocumentNode, PDFDataContext } from '@/lib/pdf/types';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface PDFPreviewProps {
  schema: PDFDocumentNode;
  data: PDFDataContext;
  filename?: string;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ 
  schema, 
  data,
  filename = 'document.pdf'
}) => {
  const [zoom, setZoom] = useState(100);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const document = useMemo(() => (
    <PDFRenderer schema={schema} data={data} />
  ), [schema, data, refreshKey]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRefresh = () => setRefreshKey(prev => prev + 1);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const containerClass = isFullscreen 
    ? 'fixed inset-0 z-50 bg-background flex flex-col'
    : 'flex flex-col h-full';

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-toolbar-bg">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="toolbar-button"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium tabular-nums w-14 text-center">
            {zoom}%
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="toolbar-button"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            className="toolbar-button"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleFullscreen}
            className="toolbar-button"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <PDFDownloadLink 
          document={document} 
          fileName={filename}
          className="inline-flex"
        >
          {({ loading }) => (
            <Button 
              size="sm" 
              disabled={loading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? 'Generating...' : 'Download PDF'}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto preview-container">
        <div 
          style={{ 
            transform: `scale(${zoom / 100})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease'
          }}
        >
          <PDFViewer 
            key={refreshKey}
            width={595} 
            height={842}
            showToolbar={false}
            className="rounded-lg shadow-2xl border border-border"
          >
            {document}
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
