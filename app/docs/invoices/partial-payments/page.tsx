import Link from "next/link";
import { Metadata, Route } from "next";
import { DollarSign, CheckCircle2, AlertCircle, Zap, ArrowRight, Percent, PieChart } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Partial Payments",
  description: "Accept deposits, installments, and partial payments on invoices.",
};

export default function PartialPaymentsPage() {
  return (
    <DocsLayout pathname="/docs/invoices/partial-payments">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Partial Payments</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Accept deposits, installments, and split payments. Clients can pay invoices in multiple 
        transactions rather than all at once.
      </p>

      {/* Use cases */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="use-cases">When to Use Partial Payments</h2>
        
        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 shrink-0">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium">Upfront deposits</h3>
              <p className="text-sm text-muted-foreground">
                Collect 25-50% before starting work to reduce your risk on new clients.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
              <PieChart className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Payment plans</h3>
              <p className="text-sm text-muted-foreground">
                Split large invoices into 2-3 installments for clients with budget constraints.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 shrink-0">
              <Percent className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium">Progress billing</h3>
              <p className="text-sm text-muted-foreground">
                Bill 50% on approval, 50% on delivery for design or creative work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enabling partial payments */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="enabling">Enabling Partial Payments</h2>
        
        <p className="mb-4">
          When creating or editing an invoice, enable partial payments:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Create or edit an invoice</li>
          <li>Toggle <strong>"Allow Partial Payments"</strong> on</li>
          <li>Optionally set a <strong>minimum payment amount</strong></li>
          <li>Save and send the invoice</li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium mb-3">Partial payment options</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Allow partial payments</span>
              <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Minimum payment</span>
              <span className="text-sm font-mono">$500.00 (or 10%)</span>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Set a minimum payment to avoid clients making tiny payments. 10-25% of the total or 
            a fixed dollar amount both work well.
          </p>
        </div>
      </section>

      {/* How it works for clients */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="client-flow">Client Payment Flow</h2>
        
        <p className="mb-4">
          When a client views an invoice with partial payments enabled:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-secondary/30">
            <div className="flex items-center justify-between">
              <span className="font-medium">Invoice #INV-001</span>
              <span className="text-sm px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">Partial</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total amount</span>
              <span className="font-mono">$5,000.00</span>
            </div>
            <div className="flex justify-between text-sm text-success">
              <span>Paid so far</span>
              <span className="font-mono">$2,000.00</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Remaining balance</span>
              <span className="font-mono">$3,000.00</span>
            </div>
            <hr className="border-border/50" />
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Payment amount</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value="$1,500.00" 
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                  Pay Now
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: $500.00 | Maximum: $3,000.00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking payments */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="tracking">Tracking Payments</h2>
        
        <p className="mb-4">
          View all payments on an invoice in the payment history:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border/50">
            <span className="text-sm font-medium">Payment History</span>
          </div>
          <div className="divide-y divide-border/50">
            <div className="p-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">$2,000.00</p>
                <p className="text-xs text-muted-foreground">Jan 15, 2026 • Visa •••• 4242</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div className="p-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">$1,500.00</p>
                <p className="text-xs text-muted-foreground">Jan 19, 2026 • Visa •••• 4242</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div className="p-3 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                <p>$1,500.00 remaining</p>
                <p className="text-xs">Awaiting payment</p>
              </div>
              <span className="h-4 w-4 rounded-full border-2 border-dashed border-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Status changes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="status">Invoice Status with Partial Payments</h2>
        
        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-purple-500/50 bg-purple-500/5">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <div>
              <span className="font-medium">Sent</span>
              <span className="text-sm text-muted-foreground ml-2">— No payments received yet</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div>
              <span className="font-medium">Partial</span>
              <span className="text-sm text-muted-foreground ml-2">— Some but not all paid</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <div className="h-3 w-3 rounded-full bg-success" />
            <div>
              <span className="font-medium">Paid</span>
              <span className="text-sm text-muted-foreground ml-2">— Full amount received</span>
            </div>
          </div>
        </div>

        <p>
          The invoice automatically moves to "Paid" status when the total amount has been collected 
          across all payments.
        </p>
      </section>

      {/* Notifications */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="notifications">Payment Notifications</h2>
        
        <p className="mb-4">
          You receive email notifications for each partial payment:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Amount paid</li>
          <li>• Remaining balance</li>
          <li>• Payment method used</li>
          <li>• Running total of all payments</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Reminder behavior
          </h4>
          <p className="text-sm text-muted-foreground">
            Payment reminders continue for partially paid invoices. They reference the remaining 
            balance rather than the full amount.
          </p>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Creating invoices", href: "/docs/invoices" as Route },
            { title: "Payment reminders", href: "/docs/invoices/reminders" as Route },
            { title: "Multi-currency", href: "/docs/invoices/currency" as Route },
            { title: "Stripe Connect setup", href: "/docs/stripe-setup" as Route },
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
