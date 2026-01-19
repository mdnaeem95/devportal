import Link from "next/link";
import { Metadata, Route } from "next";
import { CheckCircle2, Zap, ArrowRight } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Project Templates",
  description: "Save and reuse project structures with milestones for common project types.",
};

export default function ProjectTemplatesPage() {
  return (
    <DocsLayout pathname="/docs/projects/templates">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Project Templates</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Save time by creating reusable project templates with pre-defined milestones. Perfect for 
        projects you do repeatedly.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        
        <p className="mb-4">
          Project templates let you save a project structure — including milestones, amounts, and 
          descriptions — to reuse for similar projects. Instead of setting up the same milestones 
          every time, create from a template and customize as needed.
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium mb-3">Example: "Website Redesign" Template</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 rounded bg-card/50">
              <span>1. Discovery & Research</span>
              <span className="font-mono text-muted-foreground">$2,000</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-card/50">
              <span>2. Design & Prototyping</span>
              <span className="font-mono text-muted-foreground">$4,000</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-card/50">
              <span>3. Development</span>
              <span className="font-mono text-muted-foreground">$6,000</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-card/50">
              <span>4. Testing & Launch</span>
              <span className="font-mono text-muted-foreground">$2,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Creating templates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="creating">Creating a Project Template</h2>
        
        <h3 className="text-lg font-semibold mt-6 mb-3">From scratch</h3>
        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Templates</strong> in the sidebar</li>
          <li>Click <strong>New Template</strong></li>
          <li>Select <strong>Project</strong> as the type</li>
          <li>Add a name (e.g., "Mobile App Development")</li>
          <li>Add milestones with names and default amounts</li>
          <li>Click <strong>Save</strong></li>
        </ol>

        <h3 className="text-lg font-semibold mt-6 mb-3">From an existing project</h3>
        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to an existing project</li>
          <li>Click the <strong>⋯</strong> menu</li>
          <li>Select <strong>Save as Template</strong></li>
          <li>Give your template a name</li>
          <li>Click <strong>Save</strong></li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            After completing a successful project, save it as a template. Your milestone breakdown 
            is proven to work, making it a reliable starting point for similar projects.
          </p>
        </div>
      </section>

      {/* Using templates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="using">Using a Project Template</h2>
        
        <p className="mb-4">
          When creating a new project:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Projects → New Project</strong></li>
          <li>Click <strong>Use Template</strong> at the top</li>
          <li>Select your template</li>
          <li>Milestones are pre-populated</li>
          <li>Customize amounts, names, and dates as needed</li>
          <li>Complete the project setup</li>
        </ol>

        <p className="mb-4">
          Template milestones are copied to your new project — changes to the project don't affect 
          the original template.
        </p>
      </section>

      {/* What's saved */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="whats-saved">What's Saved in Templates</h2>
        
        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <span className="font-medium">Milestones</span>
              <span className="text-sm text-muted-foreground ml-2">— Names, descriptions, order</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <span className="font-medium">Default amounts</span>
              <span className="text-sm text-muted-foreground ml-2">— Starting prices (adjustable)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
            <div>
              <span className="font-medium text-muted-foreground">Not saved: Client info</span>
              <span className="text-sm text-muted-foreground ml-2">— Selected at project creation</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
            <div>
              <span className="font-medium text-muted-foreground">Not saved: Dates</span>
              <span className="text-sm text-muted-foreground ml-2">— Set for each new project</span>
            </div>
          </div>
        </div>
      </section>

      {/* Managing templates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="managing">Managing Templates</h2>
        
        <p className="mb-4">
          View and manage all your templates from <strong>Templates</strong> in the sidebar:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• <strong>Edit</strong> — Update milestone structure and amounts</li>
          <li>• <strong>Duplicate</strong> — Create a copy to customize</li>
          <li>• <strong>Delete</strong> — Remove templates you no longer use</li>
        </ul>

        <p className="text-sm text-muted-foreground">
          Deleting a template doesn't affect projects already created from it.
        </p>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Creating projects", href: "/docs/projects" as Route },
            { title: "Milestones", href: "/docs/projects/milestones" as Route },
            { title: "Contract templates", href: "/docs/contracts/templates" as Route },
          ].map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border hover:bg-card/50 transition-colors group"
            >
              <span className="text-sm">{topic.title}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
}
