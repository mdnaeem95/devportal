import Link from "next/link";
import { Metadata, Route } from "next";
import { CheckCircle2, Zap, ArrowRight, Filter } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Client Status",
  description: "Track client relationships with status labels: Lead, Active, and Inactive.",
};

export default function ClientStatusPage() {
  return (
    <DocsLayout pathname="/docs/clients/status">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Client Status Tracking</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Organize your clients by their current relationship status to focus on what matters most.
      </p>

      {/* Status types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="status-types">Status Types</h2>
        
        <p className="mb-6">
          Every client has one of three status levels that help you organize your workflow:
        </p>

        <div className="not-prose space-y-4 mb-6">
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-4 w-4 rounded-full bg-yellow-500" />
              <h3 className="font-semibold text-lg">Lead</h3>
            </div>
            <p className="text-muted-foreground mb-3">
              Potential clients you're in discussions with but haven't started work yet.
            </p>
            <div className="text-sm space-y-1">
              <p><strong>Use for:</strong></p>
              <ul className="text-muted-foreground ml-4 space-y-1">
                <li>• Prospects from referrals or inquiries</li>
                <li>• Clients you've sent proposals to</li>
                <li>• Contacts in the negotiation phase</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-green-500/50 bg-green-500/5 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-4 w-4 rounded-full bg-green-500" />
              <h3 className="font-semibold text-lg">Active</h3>
            </div>
            <p className="text-muted-foreground mb-3">
              Clients you're currently working with on one or more projects.
            </p>
            <div className="text-sm space-y-1">
              <p><strong>Use for:</strong></p>
              <ul className="text-muted-foreground ml-4 space-y-1">
                <li>• Clients with in-progress projects</li>
                <li>• Retainer clients with ongoing work</li>
                <li>• Anyone you're actively billing</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-secondary/30 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-4 w-4 rounded-full bg-muted-foreground" />
              <h3 className="font-semibold text-lg">Inactive</h3>
            </div>
            <p className="text-muted-foreground mb-3">
              Past clients with no current projects or engagement.
            </p>
            <div className="text-sm space-y-1">
              <p><strong>Use for:</strong></p>
              <ul className="text-muted-foreground ml-4 space-y-1">
                <li>• Completed projects with no follow-up work</li>
                <li>• Clients on pause</li>
                <li>• Historical records you want to keep</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Changing status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="changing-status">Changing Client Status</h2>
        
        <p className="mb-4">
          To change a client's status:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the client's detail page</li>
          <li>Click <strong>Edit</strong></li>
          <li>Select a new status from the dropdown</li>
          <li>Click <strong>Save</strong></li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Automatic status updates
          </h4>
          <p className="text-sm text-muted-foreground">
            When you create a project for a Lead client, their status automatically changes to Active. 
            This helps keep your data accurate without manual updates.
          </p>
        </div>
      </section>

      {/* Filtering by status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="filtering">Filtering by Status</h2>
        
        <p className="mb-4">
          The Clients list page has status filter tabs at the top:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Filter tabs</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
              All (24)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm">
              Active (12)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm">
              Lead (5)
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm">
              Inactive (7)
            </span>
          </div>
        </div>

        <p className="mb-4">
          The number in parentheses shows how many clients are in each status. Click any tab to 
          filter the list.
        </p>
      </section>

      {/* Best practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="best-practices">Best Practices</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Review inactive clients quarterly</h4>
              <p className="text-sm text-muted-foreground">
                Reach out to inactive clients periodically. They may have new projects or referrals.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Follow up with leads within 48 hours</h4>
              <p className="text-sm text-muted-foreground">
                Set follow-up reminders for lead clients to keep your pipeline moving.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Keep notes updated</h4>
              <p className="text-sm text-muted-foreground">
                Add notes about conversations, preferences, and context for future reference.
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
            { title: "Managing clients", href: "/docs/clients" as Route },
            { title: "Follow-up reminders", href: "/docs/clients/reminders" as Route },
            { title: "Payment behavior", href: "/docs/clients/payment-behavior" as Route },
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
