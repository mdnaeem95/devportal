import Link from "next/link";
import { Metadata, Route } from "next";
import { TrendingUp, TrendingDown, Minus, Clock, AlertCircle, Zap, ArrowRight, BarChart3 } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Payment Behavior",
  description: "Understand how Zovo tracks and displays client payment patterns.",
};

export default function PaymentBehaviorPage() {
  return (
    <DocsLayout pathname="/docs/clients/payment-behavior">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Payment Behavior Tracking</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Zovo automatically analyzes how quickly each client pays their invoices, helping you 
        identify reliable payers and those who might need reminders.
      </p>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="how-it-works">How It Works</h2>
        
        <p className="mb-4">
          Payment behavior is calculated automatically based on the time between when an invoice is 
          sent and when it's marked as paid. Zovo averages this across all paid invoices for each client.
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4" />
            Calculation formula
          </h4>
          <p className="text-sm text-muted-foreground font-mono">
            Average Payment Time = Sum of (Payment Date - Invoice Sent Date) / Number of Paid Invoices
          </p>
        </div>

        <p className="mb-4">
          Only <strong>paid invoices</strong> are included in the calculation. Draft, sent, and overdue 
          invoices don't affect the payment behavior score until they're paid.
        </p>
      </section>

      {/* Behavior ratings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="ratings">Behavior Ratings</h2>
        
        <p className="mb-6">
          Clients are assigned one of five payment behavior ratings:
        </p>

        <div className="not-prose space-y-4 mb-6">
          <div className="rounded-lg border border-success/50 bg-success/5 p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="font-semibold">Excellent</h3>
              <span className="text-sm text-muted-foreground">— Pays within 7 days</span>
            </div>
            <p className="text-sm text-muted-foreground">
              These clients pay promptly, often before the due date. They're reliable and low-maintenance.
            </p>
          </div>

          <div className="rounded-lg border border-blue-500/50 bg-blue-500/5 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Minus className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Good</h3>
              <span className="text-sm text-muted-foreground">— Pays within 8-14 days</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Reliable payers who typically pay within two weeks. Standard for most professional clients.
            </p>
          </div>

          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/5 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Slow</h3>
              <span className="text-sm text-muted-foreground">— Pays within 15-30 days</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Takes longer than average but usually pays. Consider enabling automatic reminders.
            </p>
          </div>

          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold">Poor</h3>
              <span className="text-sm text-muted-foreground">— Pays after 30+ days</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Consistently late payers. Consider requiring deposits or milestone-based billing.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center">
                <span className="text-xs text-muted-foreground">?</span>
              </div>
              <h3 className="font-semibold">New</h3>
              <span className="text-sm text-muted-foreground">— No payment history</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Clients who haven't paid any invoices yet. Rating will update after their first payment.
            </p>
          </div>
        </div>
      </section>

      {/* Where it appears */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="visibility">Where Payment Behavior Appears</h2>
        
        <p className="mb-4">
          Payment behavior badges are shown in several places:
        </p>

        <ul className="mb-6 space-y-2">
          <li>• <strong>Client list</strong> — Next to each client's name</li>
          <li>• <strong>Client detail page</strong> — In the header area</li>
          <li>• <strong>Project creation</strong> — When selecting a client</li>
          <li>• <strong>Invoice creation</strong> — As a reminder when billing</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Privacy note
          </h4>
          <p className="text-sm text-muted-foreground">
            Payment behavior is <strong>only visible to you</strong>. Clients never see their payment 
            rating or how it compares to others.
          </p>
        </div>
      </section>

      {/* Improving behavior */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="improving">Working with Slow Payers</h2>
        
        <p className="mb-4">
          If a client has "Slow" or "Poor" payment behavior, consider these strategies:
        </p>

        <div className="not-prose space-y-3">
          <div className="p-4 rounded-lg border border-border/50 bg-card/50">
            <h4 className="font-medium mb-1">Enable automatic reminders</h4>
            <p className="text-sm text-muted-foreground">
              Send payment reminders at 3 days, 7 days, and when overdue.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border/50 bg-card/50">
            <h4 className="font-medium mb-1">Require deposits</h4>
            <p className="text-sm text-muted-foreground">
              Use partial payments to collect 25-50% upfront before starting work.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border/50 bg-card/50">
            <h4 className="font-medium mb-1">Use milestone billing</h4>
            <p className="text-sm text-muted-foreground">
              Bill for smaller milestones more frequently instead of large final invoices.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border/50 bg-card/50">
            <h4 className="font-medium mb-1">Set clear payment terms</h4>
            <p className="text-sm text-muted-foreground">
              Include payment terms in your contract (e.g., Net 15) and reference them on invoices.
            </p>
          </div>
        </div>
      </section>

      {/* Data accuracy */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="accuracy">Data Accuracy</h2>
        
        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Things that affect accuracy
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Manual "Mark as Paid"</strong> — If you mark invoices paid manually (outside Stripe), ensure the date is accurate</li>
            <li>• <strong>Backdated invoices</strong> — Sending invoices with past dates affects the calculation</li>
            <li>• <strong>Test invoices</strong> — If you send test invoices to yourself, they're included in the average</li>
          </ul>
        </div>

        <p className="mb-4">
          For the most accurate tracking, always send invoices on the day work is completed and use 
          Stripe payments which automatically record the exact payment time.
        </p>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Payment reminders", href: "/docs/invoices/reminders" as Route },
            { title: "Partial payments", href: "/docs/invoices/partial-payments" as Route },
            { title: "Client status tracking", href: "/docs/clients/status" as Route },
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
