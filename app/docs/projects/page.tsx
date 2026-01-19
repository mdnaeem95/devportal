import Link from "next/link";
import { Metadata, Route } from "next";
import { FolderKanban, DollarSign, CheckCircle2, Clock, ArrowRight, Zap, GripVertical, Eye, Share2 } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Creating Projects",
  description: "Learn how to create and manage projects with milestones, track progress, and share with clients.",
};

export default function ProjectsPage() {
  return (
    <DocsLayout pathname="/docs/projects">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Creating Projects</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Projects are the core of Zovo. Create projects with milestones to track scope, 
        payments, and deliverables for each client engagement.
      </p>

      {/* Creating a project */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="creating">Creating a Project</h2>
        <p className="mb-4">
          Go to <strong>Projects → New Project</strong> or use the command palette 
          (<kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs">⌘K</kbd>) 
          and type "new project".
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Project Fields</h3>
        <div className="not-prose space-y-3 mb-6">
          {[
            { label: "Client", required: true, desc: "Select an existing client or create a new one" },
            { label: "Project Name", required: true, desc: "A descriptive name (e.g., 'Website Redesign Q1 2026')" },
            { label: "Description", required: false, desc: "Scope of work, objectives, or notes" },
            { label: "Start Date", required: false, desc: "When work begins" },
            { label: "End Date", required: false, desc: "Target completion date" },
          ].map((field) => (
            <div key={field.label} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{field.label}</span>
                  {field.required && (
                    <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">Required</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{field.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Project status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="status">Project Status</h2>
        <p className="mb-4">
          Track where each project stands with status indicators:
        </p>

        <div className="not-prose space-y-3 mb-6">
          {[
            { status: "Draft", color: "bg-gray-500", desc: "Project setup in progress, not started" },
            { status: "Active", color: "bg-green-500", desc: "Currently in progress" },
            { status: "On Hold", color: "bg-yellow-500", desc: "Temporarily paused" },
            { status: "Completed", color: "bg-blue-500", desc: "All work finished" },
            { status: "Cancelled", color: "bg-red-500", desc: "Project terminated" },
          ].map((item) => (
            <div key={item.status} className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              <span className="font-medium w-24">{item.status}</span>
              <span className="text-sm text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="milestones">Adding Milestones</h2>
        <p className="mb-4">
          Milestones break your project into billable phases. Each milestone has its own 
          amount, due date, and status — making it easy to track progress and invoice incrementally.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Milestone Fields</h3>
        <ul className="mb-4 space-y-2">
          <li><strong>Name</strong> — Description of this phase (e.g., "Design Phase")</li>
          <li><strong>Amount</strong> — Cost for this milestone</li>
          <li><strong>Due Date</strong> — Target completion date (optional)</li>
          <li><strong>Description</strong> — Additional details about deliverables</li>
        </ul>

        <div className="not-prose rounded-lg border border-border/50 bg-card/50 p-4 mb-6">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            Example Project Structure
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-secondary/50 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>1. Discovery & Planning</span>
              </div>
              <span className="font-mono">$1,500</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-secondary/50 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>2. Design Phase</span>
              </div>
              <span className="font-mono">$3,000</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-primary/10 rounded border border-primary/20">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>3. Development</span>
              </div>
              <span className="font-mono">$5,000</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-secondary/50 rounded">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                <span>4. Testing & Launch</span>
              </div>
              <span className="font-mono">$1,500</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-medium">
              <span>Total</span>
              <span className="font-mono">$11,000</span>
            </div>
          </div>
        </div>

        <div className="not-prose rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Pro tip: Drag to reorder</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Drag milestones by the grip handle to reorder them. The order is reflected 
                in client-facing views and reports.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/docs/projects/milestones" className="text-primary hover:underline">
            Learn more about milestones →
          </Link>
        </p>
      </section>

      {/* Progress tracking */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="progress">Progress Tracking</h2>
        <p className="mb-4">
          Your project dashboard shows real-time progress based on milestone completion:
        </p>

        <div className="not-prose rounded-lg border border-border/50 bg-card/50 p-4 mb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">2 of 4 milestones (50%)</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-primary rounded-full" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Invoiced</span>
              <span className="font-medium">$4,500 of $11,000</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-[41%] bg-green-500 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Client portal */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="portal">Client Portal</h2>
        <p className="mb-4">
          Every project gets a shareable client portal — a public page where your client can:
        </p>

        <ul className="mb-4 space-y-2">
          <li className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            View project status and milestone progress
          </li>
          <li className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            See and pay outstanding invoices
          </li>
          <li className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            Download deliverables
          </li>
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Review time logs (if enabled)
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">Sharing the Portal</h3>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Open your project detail page</li>
          <li>Click the <strong>Share</strong> button</li>
          <li>Copy the public link</li>
          <li>Send to your client (no login required!)</li>
        </ol>

        <div className="not-prose rounded-lg border border-border/50 bg-secondary/30 p-4">
          <div className="flex items-center gap-3">
            <Share2 className="h-5 w-5 text-muted-foreground" />
            <code className="text-sm">https://zovo.dev/p/abc123xyz</code>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/docs/projects/portal" className="text-primary hover:underline">
            Learn more about client portals →
          </Link>
        </p>
      </section>

      {/* Related pages */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Milestones Deep Dive",
              description: "Advanced milestone management",
              href: "/docs/projects/milestones" as Route,
            },
            {
              title: "Client Portal",
              description: "Customize what clients see",
              href: "/docs/projects/portal" as Route,
            },
            {
              title: "Creating Invoices",
              description: "Invoice from milestones",
              href: "/docs/invoices" as Route,
            },
            {
              title: "Deliverables",
              description: "Upload and share files",
              href: "/docs/deliverables" as Route,
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border hover:bg-card/50 transition-colors group"
            >
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
}
