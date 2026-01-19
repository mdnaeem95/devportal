import Link from "next/link";
import { Metadata, Route } from "next";
import { Bell, Mail, Clock, CheckCircle2, AlertCircle, Zap, ArrowRight, Send } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Payment Reminders",
  description: "Automatically remind clients about unpaid invoices and overdue payments.",
};

export default function InvoiceRemindersPage() {
  return (
    <DocsLayout pathname="/docs/invoices/reminders">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Payment Reminders</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Send automatic or manual reminders for unpaid invoices. Professional, timely reminders 
        improve payment times without awkward conversations.
      </p>

      {/* Automatic reminders */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="automatic">Automatic Reminders</h2>
        
        <p className="mb-4">
          When enabled, Zovo sends reminder emails on this schedule:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 shrink-0">
              <span className="font-mono text-sm font-medium text-blue-500">3d</span>
            </div>
            <div>
              <h4 className="font-medium">First reminder</h4>
              <p className="text-sm text-muted-foreground">
                Gentle reminder 3 days after invoice sent
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 shrink-0">
              <span className="font-mono text-sm font-medium text-yellow-600">7d</span>
            </div>
            <div>
              <h4 className="font-medium">Second reminder</h4>
              <p className="text-sm text-muted-foreground">
                Follow-up reminder 7 days after invoice sent
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 shrink-0">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium">Due date reminder</h4>
              <p className="text-sm text-muted-foreground">
                Payment is due — sent on the due date
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-lg border border-destructive/50 bg-destructive/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 shrink-0">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h4 className="font-medium">Overdue reminder</h4>
              <p className="text-sm text-muted-foreground">
                Invoice is past due — sent 7 days after due date
              </p>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Smart scheduling
          </h4>
          <p className="text-sm text-muted-foreground">
            Reminders are sent during business hours (9 AM - 6 PM in the client's timezone) on 
            weekdays. This improves open rates and responses.
          </p>
        </div>
      </section>

      {/* Enabling reminders */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="enabling">Enabling Automatic Reminders</h2>
        
        <p className="mb-4">
          Automatic reminders can be configured at two levels:
        </p>

        <div className="not-prose space-y-4 mb-6">
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-2">Global setting (all invoices)</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to Settings</li>
              <li>Find "Invoice Reminders"</li>
              <li>Toggle "Enable automatic reminders"</li>
            </ol>
          </div>
          
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-2">Per-invoice setting</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Create or edit an invoice</li>
              <li>Find "Payment reminders" option</li>
              <li>Toggle on or off for this invoice</li>
            </ol>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          The per-invoice setting overrides the global setting, so you can disable reminders for 
          specific clients.
        </p>
      </section>

      {/* Manual reminders */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="manual">Manual Reminders</h2>
        
        <p className="mb-4">
          Send a reminder anytime from the invoice detail page:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the invoice detail page</li>
          <li>Click <strong>"Send Reminder"</strong></li>
          <li>Optionally add a personal message</li>
          <li>Click <strong>"Send"</strong></li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Send className="h-4 w-4" />
            Personal message
          </h4>
          <div className="p-3 rounded bg-secondary/50 text-sm">
            <p className="text-muted-foreground italic">
              "Hi Sarah, I wanted to follow up on Invoice #INV-042. Let me know if you have any 
              questions or if there's anything I can help with to process this. Thanks!"
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Personal messages appear above the standard payment details.
          </p>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Cooldown period
          </h4>
          <p className="text-sm text-muted-foreground">
            Manual reminders have a 24-hour cooldown to prevent overwhelming clients. You'll see 
            when the next reminder can be sent.
          </p>
        </div>
      </section>

      {/* Reminder email content */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="email-content">Reminder Email Content</h2>
        
        <p className="mb-4">
          Reminder emails include:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border/50">
            <p className="text-sm font-medium">Subject: Payment reminder: Invoice #INV-042 ($2,500.00)</p>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <p>Hi [Client Name],</p>
            <p className="text-muted-foreground">
              This is a friendly reminder that Invoice #INV-042 for $2,500.00 is due for payment.
            </p>
            <div className="p-3 rounded bg-secondary/50 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Number</span>
                <span>INV-042</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Due</span>
                <span className="font-medium">$2,500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span>January 25, 2026</span>
              </div>
            </div>
            <div className="p-3 rounded bg-primary text-primary-foreground text-center font-medium">
              Pay Invoice
            </div>
            <p className="text-xs text-muted-foreground">
              If you've already paid, please disregard this reminder.
            </p>
          </div>
        </div>
      </section>

      {/* Tracking reminders */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="tracking">Tracking Sent Reminders</h2>
        
        <p className="mb-4">
          View all reminders sent for an invoice in the invoice activity log:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border/50">
            <span className="text-sm font-medium">Invoice Activity</span>
          </div>
          <div className="divide-y divide-border/50 text-sm">
            <div className="p-3 flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <span>Reminder sent</span>
                <span className="text-muted-foreground ml-2">Jan 22, 2026 at 10:15 AM</span>
              </div>
            </div>
            <div className="p-3 flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <span>Reminder sent</span>
                <span className="text-muted-foreground ml-2">Jan 19, 2026 at 9:00 AM</span>
              </div>
            </div>
            <div className="p-3 flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <span>Invoice sent</span>
                <span className="text-muted-foreground ml-2">Jan 15, 2026 at 2:30 PM</span>
              </div>
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
              <h4 className="font-medium">Set clear due dates</h4>
              <p className="text-sm text-muted-foreground">
                Include a due date on every invoice. "Net 15" or "Net 30" terms work well.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Keep reminders professional</h4>
              <p className="text-sm text-muted-foreground">
                Automatic reminders are friendly and non-aggressive. They work because they're 
                consistent, not pushy.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Consider client preferences</h4>
              <p className="text-sm text-muted-foreground">
                Some clients have internal processes and don't need reminders. Disable for these 
                clients to maintain the relationship.
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
            { title: "Creating invoices", href: "/docs/invoices" as Route },
            { title: "Partial payments", href: "/docs/invoices/partial-payments" as Route },
            { title: "Payment behavior tracking", href: "/docs/clients/payment-behavior" as Route },
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
