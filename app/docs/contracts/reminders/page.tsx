import Link from "next/link";
import { Metadata, Route } from "next";
import { AlertCircle, Zap, ArrowRight, Calendar } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Contract Reminders",
  description: "Automated reminders for unsigned contracts and expiry settings.",
};

export default function ContractRemindersPage() {
  return (
    <DocsLayout pathname="/docs/contracts/reminders">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Contract Reminders & Expiry</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Automatically remind clients to sign pending contracts and optionally set contracts to 
        expire after a certain period.
      </p>

      {/* Automatic reminders */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="automatic">Automatic Reminders</h2>
        
        <p className="mb-4">
          When a contract is sent but not signed, Zovo can automatically send reminder emails:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <span className="font-mono text-sm">3d</span>
            </div>
            <div>
              <h4 className="font-medium text-sm">First reminder</h4>
              <p className="text-xs text-muted-foreground">3 days after sending</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <span className="font-mono text-sm">7d</span>
            </div>
            <div>
              <h4 className="font-medium text-sm">Second reminder</h4>
              <p className="text-xs text-muted-foreground">7 days after sending</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
              <span className="font-mono text-sm text-yellow-600">14d</span>
            </div>
            <div>
              <h4 className="font-medium text-sm">Final reminder</h4>
              <p className="text-xs text-muted-foreground">14 days after sending (marked urgent)</p>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Smart reminders
          </h4>
          <p className="text-sm text-muted-foreground">
            Reminders are only sent during business hours (9 AM - 6 PM in the client's timezone) 
            and never on weekends.
          </p>
        </div>
      </section>

      {/* Manual reminders */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="manual">Manual Reminders</h2>
        
        <p className="mb-4">
          You can also send reminders manually at any time:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the contract detail page</li>
          <li>Click <strong>"Send Reminder"</strong></li>
          <li>Optionally add a personal message</li>
          <li>Click <strong>"Send"</strong></li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Cooldown period
          </h4>
          <p className="text-sm text-muted-foreground">
            There's a 24-hour cooldown between reminders to prevent overwhelming your client. 
            You'll see when the next reminder can be sent.
          </p>
        </div>
      </section>

      {/* Contract expiry */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="expiry">Contract Expiry</h2>
        
        <p className="mb-4">
          Set contracts to expire if not signed within a specific timeframe:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4" />
            Expiry options
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>No expiry</span>
              <span className="text-muted-foreground">Contract stays valid indefinitely</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>7 days</span>
              <span className="text-muted-foreground">For urgent agreements</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>14 days</span>
              <span className="text-muted-foreground">Standard timeframe</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>30 days</span>
              <span className="text-muted-foreground">For complex negotiations</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Custom</span>
              <span className="text-muted-foreground">Set a specific date</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">What happens when a contract expires?</h3>
        
        <ul className="mb-4 space-y-2">
          <li>• The signing link becomes invalid</li>
          <li>• Contract status changes to "Expired"</li>
          <li>• You receive an email notification</li>
          <li>• You can extend or create a new contract</li>
        </ul>
      </section>

      {/* Enabling/disabling */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="settings">Reminder Settings</h2>
        
        <p className="mb-4">
          Configure automatic reminders in your settings:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Settings</strong></li>
          <li>Find <strong>Contract Reminders</strong></li>
          <li>Toggle automatic reminders on or off</li>
          <li>Customize reminder schedule if needed</li>
        </ol>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
            <div>
              <h4 className="font-medium text-sm">Automatic reminders</h4>
              <p className="text-xs text-muted-foreground">Send reminders for unsigned contracts</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Enabled</span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
            <div>
              <h4 className="font-medium text-sm">Expiry notifications</h4>
              <p className="text-xs text-muted-foreground">Email when contracts are about to expire</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Enabled</span>
          </div>
        </div>
      </section>

      {/* Reminder email content */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="email-content">What Reminder Emails Include</h2>
        
        <p className="mb-4">
          Reminder emails are professional and include:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border/50">
            <p className="text-sm font-medium">Subject: Reminder: Contract awaiting your signature</p>
          </div>
          <div className="p-4 text-sm space-y-3">
            <p>Hi [Client Name],</p>
            <p className="text-muted-foreground">
              This is a friendly reminder that [Contract Name] is still awaiting your signature.
            </p>
            <p className="text-muted-foreground">
              The contract was sent on [Date] and covers [Project Name].
            </p>
            <div className="p-3 rounded-lg bg-primary text-primary-foreground text-center">
              Review & Sign Contract
            </div>
            <p className="text-muted-foreground text-xs">
              If you have any questions, please reply to this email.
            </p>
          </div>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Creating contracts", href: "/docs/contracts" as Route },
            { title: "E-signatures", href: "/docs/contracts/signatures" as Route },
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
