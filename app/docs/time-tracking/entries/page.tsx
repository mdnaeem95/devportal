import Link from "next/link";
import { Metadata, Route } from "next";
import { Play, Clock, CheckCircle2, AlertCircle, Zap, ArrowRight, Keyboard, Edit } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Timer & Manual Entries",
  description: "Track time with the real-time timer or add entries manually.",
};

export default function TimeTrackingEntriesPage() {
  return (
    <DocsLayout pathname="/docs/time-tracking/entries">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Timer & Manual Entries</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Track time in real-time with the timer or add entries manually. Both methods are supported, 
        but tracked time is labeled differently for client transparency.
      </p>

      {/* Real-time timer */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="timer">Real-Time Timer</h2>
        
        <p className="mb-4">
          The timer records your work as it happens. This is the most trusted method of time tracking.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Starting the timer</h3>
        
        <p className="mb-4">Three ways to start:</p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Play className="h-5 w-5 text-success" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Timer widget</h4>
              <p className="text-xs text-muted-foreground">Click the play button in the header</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Keyboard shortcut</h4>
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1 py-0.5 rounded border border-border bg-secondary text-xs">⌘T</kbd> or{" "}
                <kbd className="px-1 py-0.5 rounded border border-border bg-secondary text-xs">Ctrl+T</kbd>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Time tracking page</h4>
              <p className="text-xs text-muted-foreground">Click "Start Timer" on the time tracking page</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">While the timer is running</h3>
        
        <ul className="mb-4 space-y-2">
          <li>• The timer widget in the header shows elapsed time</li>
          <li>• You can add/change the description anytime</li>
          <li>• Switch projects without stopping the timer</li>
          <li>• The timer persists across page navigation</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">Stopping the timer</h3>
        
        <p className="mb-4">
          Click the stop button or press <kbd className="px-1 py-0.5 rounded border border-border bg-secondary text-xs">⌘T</kbd> again. 
          You'll be prompted to:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Confirm or edit the description</li>
          <li>• Select or confirm the project</li>
          <li>• Optionally link to a milestone</li>
          <li>• Set billable/non-billable status</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Add a description before stopping. If you forget, you'll be prompted, but it's faster 
            to describe your work while it's fresh.
          </p>
        </div>
      </section>

      {/* Timer behavior */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="timer-behavior">Timer Behavior</h2>
        
        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Persists across sessions</h4>
              <p className="text-sm text-muted-foreground">
                Close your browser or navigate away — the timer keeps running.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Auto-stop on idle (optional)</h4>
              <p className="text-sm text-muted-foreground">
                Configure idle timeout to pause after inactivity. Default: 30 minutes.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Midnight rollover</h4>
              <p className="text-sm text-muted-foreground">
                Timers spanning midnight are automatically split into two entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Manual entries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="manual">Manual Entries</h2>
        
        <p className="mb-4">
          Sometimes you need to add time after the fact — forgot to start the timer, worked offline, 
          or need to log past work. Manual entries support these cases.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Adding a manual entry</h3>
        
        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Time Tracking</strong></li>
          <li>Click <strong>"Add Manual Entry"</strong></li>
          <li>Select the project</li>
          <li>Enter date, start time, and end time (or duration)</li>
          <li>Add a description</li>
          <li>Click <strong>"Save Entry"</strong></li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium mb-3">Manual entry fields</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Project</span>
              <span className="text-muted-foreground">Required</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Date</span>
              <span className="text-muted-foreground">Required (within retroactive limit)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Duration or Start/End time</span>
              <span className="text-muted-foreground">Required</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Description</span>
              <span className="text-muted-foreground">Recommended</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Milestone</span>
              <span className="text-muted-foreground">Optional</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Billable</span>
              <span className="text-muted-foreground">Default: Yes</span>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Retroactive limits apply
          </h4>
          <p className="text-sm text-muted-foreground">
            Manual entries can only be added within your configured retroactive window (default: 7 days). 
            This prevents adding time for work done long ago that can't be verified.
          </p>
        </div>
      </section>

      {/* Editing entries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="editing">Editing Entries</h2>
        
        <p className="mb-4">
          To edit a time entry:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Find the entry in the time tracking list</li>
          <li>Click the entry or the edit icon</li>
          <li>Make your changes</li>
          <li>Click <strong>"Save"</strong></li>
        </ol>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Edit className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">What you can edit</h4>
              <p className="text-sm text-muted-foreground">
                Description, duration, project, milestone, billable status
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-600 dark:text-yellow-500">Edits are tracked</h4>
              <p className="text-sm text-muted-foreground">
                All changes are recorded in the audit trail. Original values are preserved.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-destructive">Locked entries</h4>
              <p className="text-sm text-muted-foreground">
                Once an entry is invoiced, it becomes locked and cannot be edited.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deleting entries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="deleting">Deleting Entries</h2>
        
        <p className="mb-4">
          To delete a time entry, click the entry and select "Delete" from the menu. You'll be 
          asked to confirm.
        </p>

        <div className="not-prose mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            Cannot delete invoiced entries
          </h4>
          <p className="text-sm text-muted-foreground">
            Time entries that have been added to an invoice cannot be deleted. This ensures your 
            billing records remain accurate and auditable.
          </p>
        </div>
      </section>

      {/* Tracked vs Manual */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="comparison">Tracked vs Manual Comparison</h2>
        
        <div className="not-prose rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-3 font-medium">Feature</th>
                <th className="text-left p-3 font-medium">Tracked</th>
                <th className="text-left p-3 font-medium">Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="p-3">How it's created</td>
                <td className="p-3 text-success">Real-time timer</td>
                <td className="p-3 text-blue-500">Added after the fact</td>
              </tr>
              <tr>
                <td className="p-3">Client trust level</td>
                <td className="p-3">Highest</td>
                <td className="p-3">Standard</td>
              </tr>
              <tr>
                <td className="p-3">Label shown to clients</td>
                <td className="p-3">"Tracked"</td>
                <td className="p-3">"Manual"</td>
              </tr>
              <tr>
                <td className="p-3">Retroactive limit</td>
                <td className="p-3">N/A (real-time)</td>
                <td className="p-3">Configurable (default 7 days)</td>
              </tr>
              <tr>
                <td className="p-3">Best for</td>
                <td className="p-3">All regular work</td>
                <td className="p-3">Forgot timer, offline work</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Time tracking overview", href: "/docs/time-tracking" as Route },
            { title: "Integrity & anti-abuse", href: "/docs/time-tracking/integrity" as Route },
            { title: "Invoicing from time", href: "/docs/time-tracking/invoicing" as Route },
            { title: "Keyboard shortcuts", href: "/docs/shortcuts" as Route },
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
