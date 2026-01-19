import Link from "next/link";
import { Metadata, Route } from "next";
import { Flag, GripVertical, CheckCircle2, AlertCircle, Zap, ArrowRight, DollarSign, Calendar } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Milestones",
  description: "Break projects into billable phases with milestones for better tracking and invoicing.",
};

export default function MilestonesPage() {
  return (
    <DocsLayout pathname="/docs/projects/milestones">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Project Milestones</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Break your projects into billable phases. Milestones help you track progress, manage 
        client expectations, and invoice incrementally.
      </p>

      {/* What are milestones */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">What Are Milestones?</h2>
        
        <p className="mb-4">
          Milestones are distinct phases or deliverables within a project. Each milestone has:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• A name describing the deliverable or phase</li>
          <li>• An amount (the fee for completing this milestone)</li>
          <li>• An optional due date</li>
          <li>• A status (pending, in progress, completed)</li>
        </ul>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium mb-3">Example: Website Redesign Project</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 rounded bg-card/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>1. Discovery & Research</span>
              </div>
              <span className="font-mono">$2,000</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-card/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>2. Design Mockups</span>
              </div>
              <span className="font-mono">$3,500</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-primary" />
                <span className="font-medium">3. Development</span>
              </div>
              <span className="font-mono">$6,000</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-card/50">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                <span className="text-muted-foreground">4. Testing & Launch</span>
              </div>
              <span className="font-mono">$1,500</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border font-medium">
              <span>Total</span>
              <span className="font-mono">$13,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Creating milestones */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="creating">Creating Milestones</h2>
        
        <p className="mb-4">
          Add milestones when creating or editing a project:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the project edit page</li>
          <li>Scroll to the <strong>Milestones</strong> section</li>
          <li>Click <strong>Add Milestone</strong></li>
          <li>Enter the name, amount, and optional due date</li>
          <li>Repeat for each phase of the project</li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium mb-3">Milestone fields</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Flag className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h5 className="font-medium text-sm">Name <span className="text-destructive">*</span></h5>
                <p className="text-sm text-muted-foreground">Describe the deliverable (e.g., "Homepage Design")</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h5 className="font-medium text-sm">Amount <span className="text-destructive">*</span></h5>
                <p className="text-sm text-muted-foreground">The fee for this milestone</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h5 className="font-medium text-sm">Due Date</h5>
                <p className="text-sm text-muted-foreground">When this phase should be completed (optional)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reordering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="reordering">Reordering Milestones</h2>
        
        <p className="mb-4">
          Drag and drop milestones to reorder them:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm">
              Grab the drag handle on the left side of any milestone and drag it to a new position. 
              The order is automatically saved.
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Milestone order is preserved when displaying to clients in the project portal.
        </p>
      </section>

      {/* Status tracking */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="status">Milestone Status</h2>
        
        <p className="mb-6">
          Each milestone has one of three statuses:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
            <div>
              <span className="font-medium">Pending</span>
              <span className="text-sm text-muted-foreground ml-2">— Not yet started</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/50 bg-primary/5">
            <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary/20" />
            <div>
              <span className="font-medium">In Progress</span>
              <span className="text-sm text-muted-foreground ml-2">— Currently working on</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <div>
              <span className="font-medium">Completed</span>
              <span className="text-sm text-muted-foreground ml-2">— Finished and ready to invoice</span>
            </div>
          </div>
        </div>

        <p className="mb-4">
          Click on a milestone's status indicator to cycle through statuses, or use the dropdown 
          menu for more options.
        </p>
      </section>

      {/* Invoicing from milestones */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="invoicing">Invoicing from Milestones</h2>
        
        <p className="mb-4">
          Once a milestone is completed, you can create an invoice with one click:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the project detail page</li>
          <li>Find the completed milestone</li>
          <li>Click <strong>Create Invoice</strong></li>
          <li>Review the pre-filled invoice</li>
          <li>Send to your client</li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            What's pre-filled
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Client information</li>
            <li>• Milestone name as line item description</li>
            <li>• Milestone amount</li>
            <li>• Project reference</li>
          </ul>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Already invoiced
          </h4>
          <p className="text-sm text-muted-foreground">
            Once a milestone has been invoiced, it shows "Invoiced" status and links to the invoice. 
            You can't create duplicate invoices for the same milestone.
          </p>
        </div>
      </section>

      {/* Progress visualization */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="progress">Progress Visualization</h2>
        
        <p className="mb-4">
          The project detail page shows a visual progress bar based on milestone completion:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span>Project Progress</span>
            <span className="font-medium">2 of 4 milestones (50%)</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary to-primary/80" />
          </div>
        </div>

        <p className="mb-4">
          This progress is also visible to clients in their project portal, helping them understand 
          where things stand without you having to send updates.
        </p>
      </section>

      {/* Best practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="best-practices">Best Practices</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Keep milestones focused</h4>
              <p className="text-sm text-muted-foreground">
                Each milestone should represent a clear, deliverable outcome that the client can verify.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Bill incrementally</h4>
              <p className="text-sm text-muted-foreground">
                Don't wait until the end — invoice after each milestone to maintain cash flow.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Front-load larger milestones</h4>
              <p className="text-sm text-muted-foreground">
                Put bigger milestones at the start (discovery, design) to reduce your risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Creating projects", href: "/docs/projects" as Route },
            { title: "Creating invoices", href: "/docs/invoices" as Route },
            { title: "Client portal", href: "/docs/projects/portal" as Route },
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
