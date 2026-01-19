import Link from "next/link";
import { Metadata, Route } from "next";
import { Receipt, CheckCircle2, AlertCircle, Zap, ArrowRight, Filter, Lock } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Invoicing from Time",
  description: "Convert tracked time into invoices with one click.",
};

export default function TimeTrackingInvoicingPage() {
  return (
    <DocsLayout pathname="/docs/time-tracking/invoicing">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Invoicing from Time</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Convert your tracked time into professional invoices. Zovo calculates totals automatically 
        and links entries to prevent double-billing.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        
        <p className="mb-4">
          When you bill by the hour, creating invoices from time entries ensures accuracy:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Time is automatically converted to line items</li>
          <li>• Your hourly rate is applied to calculate amounts</li>
          <li>• Invoiced entries are locked to prevent edits</li>
          <li>• Each entry can only be invoiced once</li>
        </ul>
      </section>

      {/* Creating an invoice from time */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="creating">Creating an Invoice from Time</h2>
        
        <p className="mb-4">
          To create an invoice from your tracked time:
        </p>

        <ol className="mb-6 space-y-3 list-decimal list-inside">
          <li>
            Go to <strong>Time Tracking</strong>
          </li>
          <li>
            Click <strong>"Create Invoice from Time"</strong>
          </li>
          <li>
            Select the project and client
          </li>
          <li>
            Choose the date range for entries to include
          </li>
          <li>
            Review and optionally adjust the line items
          </li>
          <li>
            Click <strong>"Create Invoice"</strong>
          </li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4" />
            Filtering options
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Project</span>
              <span className="text-muted-foreground">Required</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Date range</span>
              <span className="text-muted-foreground">Last week, last month, custom</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Milestone</span>
              <span className="text-muted-foreground">Optional - filter to specific milestone</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Include invoiced</span>
              <span className="text-muted-foreground">No (only uninvoiced entries shown)</span>
            </div>
          </div>
        </div>
      </section>

      {/* How entries become line items */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="line-items">How Entries Become Line Items</h2>
        
        <p className="mb-4">
          You can control how time entries are grouped on the invoice:
        </p>

        <div className="not-prose space-y-4 mb-6">
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-2">Detailed (one line per entry)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Each time entry becomes its own line item with date and description.
            </p>
            <div className="text-sm space-y-1 p-3 rounded bg-secondary/50">
              <div className="flex justify-between">
                <span>Jan 19 - API integration</span>
                <span className="font-mono">3.5 hrs × $150 = $525</span>
              </div>
              <div className="flex justify-between">
                <span>Jan 19 - Bug fixes</span>
                <span className="font-mono">2.0 hrs × $150 = $300</span>
              </div>
              <div className="flex justify-between">
                <span>Jan 18 - Schema design</span>
                <span className="font-mono">5.0 hrs × $150 = $750</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-2">Summarized (grouped by day/week)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Entries are grouped together with total hours.
            </p>
            <div className="text-sm space-y-1 p-3 rounded bg-secondary/50">
              <div className="flex justify-between">
                <span>Development work (Jan 15-19)</span>
                <span className="font-mono">10.5 hrs × $150 = $1,575</span>
              </div>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Use detailed line items for clients who want full transparency, and summarized for 
            clients who prefer high-level billing.
          </p>
        </div>
      </section>

      {/* Hourly rate */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="hourly-rate">Hourly Rate</h2>
        
        <p className="mb-4">
          The hourly rate used for calculations is determined in this order:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Rate set on the time entry (if different from default)</li>
          <li>Project-specific rate (if configured)</li>
          <li>Your default hourly rate from settings</li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Set your rate first
          </h4>
          <p className="text-sm text-muted-foreground">
            Make sure you've configured your default hourly rate in Time Tracking Settings
            before creating invoices from time.
          </p>
        </div>
      </section>

      {/* Entry locking */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="locking">Entry Locking</h2>
        
        <p className="mb-4">
          Once time entries are added to an invoice:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Lock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Entries become locked</h4>
              <p className="text-sm text-muted-foreground">
                Duration, description, and rate cannot be changed
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Receipt className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Linked to invoice</h4>
              <p className="text-sm text-muted-foreground">
                Each entry shows which invoice it was billed on
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Prevents double-billing</h4>
              <p className="text-sm text-muted-foreground">
                Invoiced entries won't appear in future "uninvoiced time" lists
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Viewing uninvoiced time */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="uninvoiced">Viewing Uninvoiced Time</h2>
        
        <p className="mb-4">
          The Time Tracking page shows uninvoiced time at a glance:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-secondary/30">
            <h4 className="font-medium">Uninvoiced Time by Project</h4>
          </div>
          <div className="divide-y divide-border/50">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Website Redesign</p>
                <p className="text-sm text-muted-foreground">Acme Corp</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium">24.5 hrs</p>
                <p className="text-sm text-muted-foreground">$3,675.00</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">API Integration</p>
                <p className="text-sm text-muted-foreground">TechStart Inc</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium">12.0 hrs</p>
                <p className="text-sm text-muted-foreground">$1,800.00</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Click any project to start creating an invoice for that time.
        </p>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Creating invoices", href: "/docs/invoices" as Route },
            { title: "Time tracking overview", href: "/docs/time-tracking" as Route },
            { title: "Integrity features", href: "/docs/time-tracking/integrity" as Route },
            { title: "Hourly rate settings", href: "/docs/time-tracking/settings" as Route },
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
