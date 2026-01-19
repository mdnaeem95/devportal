import Link from "next/link";
import { Metadata, Route } from "next";
import { AlertCircle, Zap, ArrowRight, PenLine, Shield, Eye, Lock, Timer } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Time Tracking",
  description: "Track billable hours with integrity features that build client trust. Timer, manual entries, and invoice integration.",
};

export default function TimeTrackingPage() {
  return (
    <DocsLayout pathname="/docs/time-tracking">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Time Tracking</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Track billable hours with integrity features that build client trust. Use the real-time 
        timer or add manual entries.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        <p className="mb-4">
          Zovo's time tracking is designed with <strong>integrity first</strong>. Unlike other tools, 
          we distinguish between time tracked in real-time versus time added after the fact. This 
          transparency builds trust with clients.
        </p>

        <div className="not-prose grid gap-4 sm:grid-cols-2 mb-4">
          {[
            {
              icon: Timer,
              title: "Real-time timer",
              description: "Start/stop with ⌘T. Shows as 'Tracked' to clients.",
            },
            {
              icon: PenLine,
              title: "Manual entries",
              description: "Add time retroactively. Shows as 'Manual' to clients.",
            },
            {
              icon: Shield,
              title: "Anti-abuse features",
              description: "Retroactive limits, overlap prevention, audit trail.",
            },
            {
              icon: Lock,
              title: "Invoice locking",
              description: "Invoiced time becomes immutable for accuracy.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Entry types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="entry-types">Entry Types</h2>
        
        <p className="mb-4">
          Every time entry is labeled as either "Tracked" or "Manual":
        </p>

        <div className="not-prose space-y-4 mb-6">
          <div className="rounded-lg border border-success/50 bg-success/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-5 w-5 text-success" />
              <span className="font-medium text-success">Tracked</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Time logged using the real-time timer. The timer was running while you worked.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Most trustworthy for clients</li>
              <li>✓ Accurate to the second</li>
              <li>✓ Shows clients you were actively working</li>
            </ul>
          </div>
          
          <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <PenLine className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-blue-500">Manual</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Time added after the fact. You entered the duration manually.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Useful when you forgot to start the timer</li>
              <li>✓ Subject to retroactive limits (configurable)</li>
              <li>✓ Transparently labeled for clients</li>
            </ul>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Why this matters
          </h4>
          <p className="text-sm text-muted-foreground">
            Clients can see which time was tracked live versus added later. This transparency 
            prevents billing disputes and builds long-term trust. Most clients prefer paying for 
            tracked time because they know it's accurate.
          </p>
        </div>
      </section>

      {/* Using the timer */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="timer">Using the Timer</h2>
        
        <p className="mb-4">
          The timer widget is always visible in the top-right corner of your dashboard.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Starting the timer</h3>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Press <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary text-xs">⌘T</kbd> (or <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary text-xs">Ctrl+T</kbd> on Windows)</li>
          <li>Or click the timer widget</li>
          <li>Select the project you're working on</li>
          <li>Optionally add a description</li>
          <li>Click <strong>"Start"</strong></li>
        </ol>

        <h3 className="text-lg font-semibold mt-6 mb-3">While the timer is running</h3>
        <ul className="mb-4 space-y-2">
          <li>• The timer shows elapsed time in real-time</li>
          <li>• You can see which project you're tracking</li>
          <li>• Navigate freely — the timer keeps running</li>
          <li>• Timer persists across page refreshes</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">Stopping the timer</h3>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Press <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary text-xs">⌘T</kbd> again</li>
          <li>Or click the running timer widget</li>
          <li>Review the entry details</li>
          <li>Click <strong>"Stop & Save"</strong></li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium mb-2">Timer behavior</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>Idle timeout:</strong> Timer auto-stops after inactivity (configurable)</li>
            <li>• <strong>Midnight:</strong> Timer stops at midnight to prevent all-night entries</li>
            <li>• <strong>Browser close:</strong> Timer pauses and can be resumed</li>
          </ul>
        </div>
      </section>

      {/* Manual entries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="manual">Manual Entries</h2>
        
        <p className="mb-4">
          Add time entries for work you forgot to track:
        </p>

        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Time Tracking</strong></li>
          <li>Click <strong>"Add Entry"</strong></li>
          <li>Select the project</li>
          <li>Enter the date, start time, and duration</li>
          <li>Add a description of the work</li>
          <li>Click <strong>"Save Entry"</strong></li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Retroactive limits apply
          </h4>
          <p className="text-sm text-muted-foreground">
            By default, you can only add manual entries up to 7 days in the past. This prevents 
            adding large amounts of time after the fact. You can configure this limit in Time 
            Tracking Settings.
          </p>
        </div>
      </section>

      {/* Anti-abuse features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="integrity">Integrity Features</h2>
        
        <p className="mb-4">
          Zovo includes several features to ensure time tracking accuracy:
        </p>

        <div className="not-prose space-y-4 mb-4">
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-1">Retroactive limits</h4>
            <p className="text-sm text-muted-foreground">
              Manual entries can only be added within a configurable window (default: 7 days). 
              Prevents padding hours weeks later.
            </p>
          </div>
          
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-1">No future entries</h4>
            <p className="text-sm text-muted-foreground">
              You cannot log time for future dates. All entries must be for past or current time.
            </p>
          </div>
          
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-1">Overlap prevention</h4>
            <p className="text-sm text-muted-foreground">
              By default, time entries cannot overlap. You can't bill two clients for the same hour.
            </p>
          </div>
          
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-1">Edit audit trail</h4>
            <p className="text-sm text-muted-foreground">
              Every edit to a time entry is logged with timestamp, original value, and new value. 
              This creates accountability.
            </p>
          </div>
          
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-1">Daily hour warnings</h4>
            <p className="text-sm text-muted-foreground">
              Get warned if daily totals exceed a threshold (default: 12 hours). Helps catch 
              accidental double entries.
            </p>
          </div>
          
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-1">Invoice locking</h4>
            <p className="text-sm text-muted-foreground">
              Once time is included in an invoice, it becomes immutable. Prevents retroactive 
              changes to billed time.
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/time-tracking/integrity" className="text-primary hover:underline">
            Learn more about integrity features →
          </Link>
        </p>
      </section>

      {/* Client visibility */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="client-view">Client Visibility</h2>
        
        <p className="mb-4">
          Clients can view their time logs in the project portal:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="font-medium">What clients see</h4>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Date and duration of each entry</li>
                <li>• Description of work performed</li>
                <li>• Entry type (Tracked vs Manual)</li>
                <li>• Total hours and billable amount</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mb-4">
          You can toggle client visibility in <strong>Time Tracking Settings</strong>. When disabled, 
          clients won't see individual time entries — only total hours when invoiced.
        </p>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/time-tracking/client-view" className="text-primary hover:underline">
            Learn more about client transparency settings →
          </Link>
        </p>
      </section>

      {/* Settings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="settings">Time Tracking Settings</h2>
        
        <p className="mb-4">
          Configure time tracking behavior in <strong>Time Tracking → Settings</strong>:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">Default hourly rate</span>
              <span className="text-muted-foreground">Used for new entries and invoicing</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Max retroactive days</span>
              <span className="text-muted-foreground">How far back manual entries can go</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Daily hour warning</span>
              <span className="text-muted-foreground">Alert threshold for daily totals</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Idle timeout</span>
              <span className="text-muted-foreground">Auto-stop timer after inactivity</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Round to minutes</span>
              <span className="text-muted-foreground">Round entries to nearest X minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Allow overlapping</span>
              <span className="text-muted-foreground">Permit concurrent time entries</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Client visible logs</span>
              <span className="text-muted-foreground">Show time breakdown in portal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Timer & manual entries", href: "/docs/time-tracking/entries" as Route },
            { title: "Anti-abuse features", href: "/docs/time-tracking/integrity" as Route },
            { title: "Creating invoices from time", href: "/docs/time-tracking/invoicing" as Route },
            { title: "Client visibility settings", href: "/docs/time-tracking/client-view" as Route },
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
