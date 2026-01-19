import Link from "next/link";
import { Metadata, Route } from "next";
import { Bell, Calendar, CheckCircle2, Zap, ArrowRight, Clock, Mail } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Follow-up Reminders",
  description: "Set reminders to follow up with clients and never lose touch.",
};

export default function ClientRemindersPage() {
  return (
    <DocsLayout pathname="/docs/clients/reminders">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Follow-up Reminders</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Set reminders to follow up with clients at the right time. Never lose a lead or forget to 
        check in with past clients.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        
        <p className="mb-4">
          Follow-up reminders help you maintain client relationships by prompting you to reach out at 
          scheduled times. They're especially useful for:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Following up with leads after sending proposals</li>
          <li>• Checking in with inactive clients for repeat business</li>
          <li>• Scheduling quarterly business reviews</li>
          <li>• Remembering to request testimonials after project completion</li>
        </ul>
      </section>

      {/* Setting reminders */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="setting">Setting a Reminder</h2>
        
        <p className="mb-4">
          To set a follow-up reminder:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the client's detail page</li>
          <li>Find the <strong>Follow-up Reminder</strong> section</li>
          <li>Click <strong>Set Reminder</strong></li>
          <li>Choose a date and optionally add a note</li>
          <li>Click <strong>Save</strong></li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4" />
            Reminder fields
          </h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h5 className="font-medium text-sm">Date</h5>
                <p className="text-sm text-muted-foreground">When you want to be reminded</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h5 className="font-medium text-sm">Note (optional)</h5>
                <p className="text-sm text-muted-foreground">What you want to follow up about</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick presets */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="presets">Quick Date Presets</h2>
        
        <p className="mb-4">
          When setting a reminder, you can choose from quick presets:
        </p>

        <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {[
            { label: "Tomorrow", days: 1 },
            { label: "3 days", days: 3 },
            { label: "1 week", days: 7 },
            { label: "2 weeks", days: 14 },
            { label: "1 month", days: 30 },
            { label: "3 months", days: 90 },
            { label: "6 months", days: 180 },
            { label: "Custom", days: null },
          ].map((preset) => (
            <div 
              key={preset.label}
              className="text-center p-2 rounded-lg border border-border/50 bg-card/50 text-sm"
            >
              {preset.label}
            </div>
          ))}
        </div>
      </section>

      {/* Viewing reminders */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="viewing">Viewing Your Reminders</h2>
        
        <p className="mb-4">
          Upcoming reminders appear in several places:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• <strong>Dashboard</strong> — In the "Upcoming Reminders" section</li>
          <li>• <strong>Client list</strong> — Badge on clients with upcoming reminders</li>
          <li>• <strong>Client detail</strong> — Full reminder details with note</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Email notifications
          </h4>
          <p className="text-sm text-muted-foreground">
            You'll receive an email notification on the reminder date. Make sure email notifications 
            are enabled in your <Link href="/docs/settings/notifications" className="text-primary hover:underline">notification settings</Link>.
          </p>
        </div>
      </section>

      {/* Completing reminders */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="completing">Completing or Snoozing</h2>
        
        <p className="mb-4">
          When a reminder is due, you have three options:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Complete</h4>
              <p className="text-sm text-muted-foreground">
                Mark as done when you've followed up. The reminder is cleared.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
            <Clock className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Snooze</h4>
              <p className="text-sm text-muted-foreground">
                Push the reminder to a later date if you're not ready to follow up yet.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Bell className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Reschedule</h4>
              <p className="text-sm text-muted-foreground">
                Change to a completely different date if plans have changed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="best-practices">Best Practices</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Set reminders immediately</h4>
              <p className="text-sm text-muted-foreground">
                When you finish a call or send a proposal, set the follow-up reminder right away.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Add context in notes</h4>
              <p className="text-sm text-muted-foreground">
                Include what you discussed so future-you remembers why you're following up.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Schedule quarterly check-ins</h4>
              <p className="text-sm text-muted-foreground">
                Set 3-month reminders for past clients to maintain relationships and get referrals.
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
            { title: "Client status", href: "/docs/clients/status" as Route },
            { title: "Notification settings", href: "/docs/settings/notifications" as Route },
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
