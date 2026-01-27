import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  FileText,
  Layout,
  Code,
  Zap,
  Save,
  Keyboard
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <Badge variant="secondary" className="mb-4">
          Production-Grade PDF Generation
        </Badge>
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          Visual Editor for <span className="text-primary">React PDFs</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Complete platform for generating pixel-perfect PDFs. Design visually, bind data with JSON schemas,
          and export professional documents with deterministic rendering.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/templates">
              Start Creating <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="https://github.com/thesushilsharma/PDFCanvas" target="_blank">
              View on GitHub
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">Everything you need</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Layout className="h-6 w-6" />}
            title="Visual Editor"
            description="Drag-and-drop interface for precise layout and styling without writing CSS manually."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Live Preview"
            description="Real-time rendering powered by @react-pdf/renderer. What you see is exactly what you get."
          />
          <FeatureCard
            icon={<Code className="h-6 w-6" />}
            title="JSON Schema"
            description="Define dynamic data models to populate your templates with real-world data."
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Templates"
            description="Start from professional presets or save your own designs for reuse."
          />
          <FeatureCard
            icon={<Save className="h-6 w-6" />}
            title="Save & Load"
            description="Persist your work-in-progress locally or to a database with a friendly interface."
          />
          <FeatureCard
            icon={<Keyboard className="h-6 w-6" />}
            title="Productivity"
            description="Built-in keyboard shortcuts and modern UI using shadcn/ui primitives."
          />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-8 text-2xl font-bold">Built with Modern Tech</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "React 19", "Next.js 16", "TypeScript", "TailwindCSS",
              "shadcn/ui", "@react-pdf/renderer", "TanStack Query", "Tiptap"
            ].map((tech) => (
              <Badge key={tech} variant="outline" className="text-base py-1 px-4 bg-background">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tight">How it Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A simple workflow to take you from concept to exported PDF in minutes.
            </p>
            <div className="mt-8 space-y-6">
              <Step number={1} title="Choose a Template" description="Start plain or pick a pre-made layout." />
              <Step number={2} title="Design Visually" description="Add text, images, and layout blocks." />
              <Step number={3} title="Bind Data" description="Connect your design to a JSON schema." />
              <Step number={4} title="Export PDF" description="Download the final high-fidelity document." />
            </div>
          </div>
          <div className="relative aspect-square rounded-xl bg-gradient-to-tr from-primary/20 to-primary/5 p-8 border">
            {/* Placeholder for a screenshot or abstract visual */}
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              [Editor Preview / Screenshot Placeholder]
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PDFCanvas. MIT License.
          </p>
          <div className="flex gap-4">
            <Link href="https://github.com/thesushilsharma/PDFCanvas" className="text-sm text-muted-foreground hover:underline">
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
        {number}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
