import Link from "next/link";
import { Metadata, Route } from "next";
import { Eye, EyeOff, AlertCircle, Zap, ArrowRight, Shield } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Client Time Visibility",
  description: "Control whether clients can see your time logs in their project portal.",
};

export default function TimeTrackingClientViewPage() {
  return (
    <DocsLayout pathname="/docs/time-tracking/client-view">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Client Time Visibility</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Choose whether to share detailed time logs with clients through their project portal. 
        Transparency builds trust, but you have full control.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        
        <p className="mb-4">
          When enabled, clients can see a detailed breakdown of how you spent your time on their 
          project. This includes:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Date and description of each time entry</li>
          <li>• Duration of each entry</li>
          <li>• Whether the time was tracked or added manually</li>
          <li>• Daily, weekly, and monthly totals</li>
          <li>• Billable vs non-billable breakdown</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Why share time logs?
          </h4>
          <p className="text-sm text-muted-foreground">
            Transparent time tracking reduces billing disputes, builds trust, and helps clients 
            understand where their budget goes. Many enterprise clients require this level of detail.
          </p>
        </div>
      </section>

      {/* Enabling visibility */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="enabling">Enabling Time Visibility</h2>
        
        <p className="mb-4">
          Time log visibility is controlled globally in your settings:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Settings</strong></li>
          <li>Find <strong>Time Tracking</strong> section</li>
          <li>Toggle <strong>"Show time logs to clients"</strong></li>
        </ol>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-success/50 bg-success/5">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-success" />
              <div>
                <h4 className="font-medium">Visible</h4>
                <p className="text-sm text-muted-foreground">Clients see time logs in their portal</p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Enabled</span>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex items-center gap-3">
              <EyeOff className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Hidden</h4>
                <p className="text-sm text-muted-foreground">Time logs are private to you</p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-secondary">Disabled</span>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Global setting
          </h4>
          <p className="text-sm text-muted-foreground">
            This setting applies to all projects. Per-project visibility controls are planned for 
            a future release.
          </p>
        </div>
      </section>

      {/* What clients see */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="client-view">What Clients See</h2>
        
        <p className="mb-4">
          When a client views their project portal with time logs enabled:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-secondary/30">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Time Log</h4>
              <div className="text-sm">
                <span className="text-muted-foreground">Total:</span>{" "}
                <span className="font-mono font-medium">47h 30m</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">January 19, 2026</span>
                <span className="font-mono text-sm">6h 15m</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-success/10 text-success">Tracked</span>
                    <span className="text-muted-foreground">API integration and testing</span>
                  </div>
                  <span className="font-mono">3h 45m</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-success/10 text-success">Tracked</span>
                    <span className="text-muted-foreground">Bug fixes for login flow</span>
                  </div>
                  <span className="font-mono">2h 30m</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">January 18, 2026</span>
                <span className="font-mono text-sm">5h 00m</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">Manual</span>
                    <span className="text-muted-foreground">Database schema design</span>
                  </div>
                  <span className="font-mono">5h 00m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy considerations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="privacy">Privacy Considerations</h2>
        
        <p className="mb-4">
          Some information is <strong>never</strong> shared with clients:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Your hourly rate</h4>
              <p className="text-sm text-muted-foreground">
                Clients see hours, not rates or calculated amounts (that's on invoices)
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Edit history</h4>
              <p className="text-sm text-muted-foreground">
                The audit trail is only visible to you, not clients
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Other projects</h4>
              <p className="text-sm text-muted-foreground">
                Each client only sees time for their own projects
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Non-billable time</h4>
              <p className="text-sm text-muted-foreground">
                Entries marked non-billable are hidden from client view
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* When to enable */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="when-to-enable">When to Enable Visibility</h2>
        
        <div className="not-prose space-y-3 mb-6">
          <div className="p-4 rounded-lg border border-success/50 bg-success/5">
            <h4 className="font-medium text-success mb-2">Good candidates for visibility</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Enterprise clients who require detailed time reports</li>
              <li>• Hourly billing arrangements</li>
              <li>• Clients who've asked for more detail</li>
              <li>• Retainer clients with hour caps</li>
              <li>• Building trust with new clients</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg border border-border/50 bg-card/50">
            <h4 className="font-medium mb-2">May prefer hidden</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Fixed-price projects (clients care about deliverables, not hours)</li>
              <li>• Clients who don't want the detail</li>
              <li>• Very short tasks that would look odd itemized</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Time tracking overview", href: "/docs/time-tracking" as Route },
            { title: "Integrity features", href: "/docs/time-tracking/integrity" as Route },
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
