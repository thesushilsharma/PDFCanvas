import React from 'react';
import { templates, TemplateName } from '@/lib/pdf/templates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Plus } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: TemplateName | null;
  onSelectTemplate: (name: TemplateName) => void;
  onCreateBlank: () => void;
}

const templateIcons: Record<TemplateName, React.ReactNode> = {
  invoice: <FileText className="h-8 w-8" />,
  report: <BarChart3 className="h-8 w-8" />,
  contract: <FileText className="h-8 w-8" />,
  certificate: <FileText className="h-8 w-8" />,
  letterhead: <FileText className="h-8 w-8" />,
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onCreateBlank,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Choose a Template</h2>
        <p className="text-sm text-muted-foreground">
          Start with a pre-built template or create from scratch
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Blank Template */}
        <Card 
          className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50"
          onClick={onCreateBlank}
        >
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
            </div>
            <CardTitle className="text-base">Blank Document</CardTitle>
            <CardDescription className="text-xs">
              Start from scratch with an empty document
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Pre-built Templates */}
        {Object.entries(templates).map(([key, template]) => (
          <Card 
            key={key}
            className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplate === key 
                ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectTemplate(key as TemplateName)}
          >
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                selectedTemplate === key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              }`}>
                {templateIcons[key as TemplateName]}
              </div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-xs">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                variant={selectedTemplate === key ? "default" : "outline"} 
                size="sm" 
                className="w-full"
              >
                {selectedTemplate === key ? 'Selected' : 'Use Template'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
