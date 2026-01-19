import Link from "next/link";
import { Metadata, Route } from "next";
import { Clock, Lock, Eye, CheckCircle2, AlertCircle, Zap, ArrowRight, History, AlertTriangle } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Time Tracking Integrity",
  description: "Anti-abuse features that build client trust in your time tracking data.",
};

export default function TimeTrackingIntegrityPage() {
  return (
    <DocsLayout pathname="/docs/time-tracking/integrity">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Time Tracking Integrity</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Zovo's time tracking includes built-in integrity features that help you build trust with 
        clients. These anti-abuse measures ensure your time logs are accurate and verifiable.
      </p>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="why-it-matters">Why Integrity Matters</h2>
        
        <p className="mb-4">
          When billing clients for time, trust is everything. Clients want to know:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Was this time actually worked?</li>
          <li>• Was it tracked in real-time or added later?</li>
          <li>• Has the entry been modified?</li>
          <li>• Are the hours realistic?</li>
        </ul>

        <p className="mb-4">
          Zovo's integrity features answer these questions automatically, giving clients confidence 
          in your invoices.
        </p>
      </section>

      {/* Entry classification */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="classification">Entry Classification</h2>
        
        <p className="mb-4">
          Every time entry is automatically labeled based on how it was created:
        </p>

        <div className="not-prose space-y-4 mb-6">
          <div className="rounded-lg border border-success/50 bg-success/5 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-success" />
              <h3 className="font-semibold">Tracked</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">Most trusted</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Created using the real-time timer. Zovo recorded the exact start and stop times as 
              you worked.
            </p>
            <div className="text-xs text-muted-foreground">
              <strong>Clients see:</strong> "Tracked in real-time"
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-4">
            <div className="flex items-center gap-3 mb-2">
              <History className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Manual</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">Added retroactively</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Added after the fact. Subject to retroactive limits and clearly labeled when shown 
              to clients.
            </p>
            <div className="text-xs text-muted-foreground">
              <strong>Clients see:</strong> "Added manually"
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Why this matters
          </h4>
          <p className="text-sm text-muted-foreground">
            Tracked entries are inherently more trustworthy because they're recorded as work happens. 
            Clients can see at a glance how much of your billed time was tracked live versus added 
            after the fact.
          </p>
        </div>
      </section>

      {/* Retroactive limits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="retroactive">Retroactive Entry Limits</h2>
        
        <p className="mb-4">
          Manual entries can only be created within a configurable time window:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium mb-3">Retroactive limit settings</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Current setting</span>
              <span className="font-mono">7 days</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Available options</span>
              <span>1, 3, 7, 14, or 30 days</span>
            </div>
          </div>
        </div>

        <p className="mb-4">
          This prevents:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Adding time from months ago that can't be verified</li>
          <li>• Inflating hours on old projects before invoicing</li>
          <li>• Unclear records that muddy project timelines</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            If you need to add old time
          </h4>
          <p className="text-sm text-muted-foreground">
            You can temporarily increase your retroactive limit in settings. However, entries added 
            outside the normal window are flagged in the audit trail.
          </p>
        </div>
      </section>

      {/* Overlap prevention */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overlaps">Overlap Prevention</h2>
        
        <p className="mb-4">
          By default, Zovo prevents time entries that overlap with each other:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 p-2 rounded bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>9:00 AM - 12:00 PM: Project A</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>1:00 PM - 5:00 PM: Project B</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="line-through text-muted-foreground">11:00 AM - 2:00 PM: Project C</span>
              <span className="text-xs text-destructive ml-auto">Blocked - overlaps existing entries</span>
            </div>
          </div>
        </div>

        <p className="mb-4">
          This ensures you can't accidentally (or intentionally) bill for the same hours twice.
        </p>
      </section>

      {/* Audit trail */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="audit-trail">Edit Audit Trail</h2>
        
        <p className="mb-4">
          Every edit to a time entry is recorded:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border/50">
            <span className="text-sm font-medium">Edit History</span>
          </div>
          <div className="divide-y divide-border/50 text-sm">
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Duration changed</span>
                <span className="text-xs text-muted-foreground">Jan 19, 2:15 PM</span>
              </div>
              <p className="text-muted-foreground">2h 30m → 3h 00m</p>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Description updated</span>
                <span className="text-xs text-muted-foreground">Jan 19, 2:14 PM</span>
              </div>
              <p className="text-muted-foreground">"API work" → "API integration and testing"</p>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Entry created</span>
                <span className="text-xs text-muted-foreground">Jan 19, 10:00 AM</span>
              </div>
              <p className="text-muted-foreground">Tracked entry (real-time timer)</p>
            </div>
          </div>
        </div>

        <p className="mb-4">
          Original values are preserved, so you can always see what an entry looked like when first 
          created. This history is available if clients ever question changes.
        </p>
      </section>

      {/* Locked entries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="locking">Locked Entries</h2>
        
        <p className="mb-4">
          Once time entries are invoiced, they become locked:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Lock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Cannot edit</h4>
              <p className="text-sm text-muted-foreground">
                Duration, description, and dates cannot be changed
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Lock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Cannot delete</h4>
              <p className="text-sm text-muted-foreground">
                Entries linked to invoices are preserved for records
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Eye className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Invoice reference visible</h4>
              <p className="text-sm text-muted-foreground">
                Each locked entry links to the invoice it was billed on
              </p>
            </div>
          </div>
        </div>

        <p className="mb-4">
          This ensures your billing records are immutable and match what clients were charged.
        </p>
      </section>

      {/* Daily hour warnings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="warnings">Daily Hour Warnings</h2>
        
        <p className="mb-4">
          Zovo warns you when daily totals seem unrealistic:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-600 dark:text-yellow-500">High daily total</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You've logged 14 hours for January 19, 2026. This exceeds the 12-hour daily 
                threshold. Are you sure this is accurate?
              </p>
              <div className="flex gap-2 mt-3">
                <button className="text-xs px-3 py-1 rounded bg-secondary text-secondary-foreground">
                  Review entries
                </button>
                <button className="text-xs px-3 py-1 rounded text-muted-foreground">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="mb-4">
          The default threshold is 12 hours, but you can customize it in settings based on your 
          work patterns.
        </p>
      </section>

      {/* Client visibility */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="client-view">What Clients See</h2>
        
        <p className="mb-4">
          When you enable time log visibility in the client portal, clients see:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Each time entry with date and description</li>
          <li>• Whether it was tracked or manual</li>
          <li>• Total hours per day/week/month</li>
          <li>• Billable vs non-billable breakdown</li>
        </ul>

        <p className="mb-4">
          This transparency builds trust and reduces billing disputes.
        </p>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/time-tracking/client-view" className="text-primary hover:underline">
            Learn more about client time log visibility →
          </Link>
        </p>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Time tracking overview", href: "/docs/time-tracking" as Route },
            { title: "Timer & manual entries", href: "/docs/time-tracking/entries" as Route },
            { title: "Client time visibility", href: "/docs/time-tracking/client-view" as Route },
            { title: "Invoicing from time", href: "/docs/time-tracking/invoicing" as Route },
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
