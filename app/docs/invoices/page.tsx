import Link from "next/link";
import { Metadata, Route } from "next";
import { CheckCircle2, Zap, ArrowRight, Clock } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Creating Invoices",
  description: "Learn how to create, send, and manage invoices with Stripe payment integration in Zovo.",
};

export default function InvoicesPage() {
  return (
    <DocsLayout pathname="/docs/invoices">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Invoicing & Payments</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Create professional invoices and get paid via Stripe. Clients pay with any credit card — 
        no account needed.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        <p className="mb-4">
          Zovo's invoicing system integrates directly with Stripe to handle payments securely. 
          Key features include:
        </p>
        <ul className="mb-4 space-y-2">
          <li>• One-click invoice creation from milestones</li>
          <li>• Create invoices from tracked time</li>
          <li>• Customizable line items with descriptions</li>
          <li>• Tax calculation support</li>
          <li>• Multi-currency (USD, EUR, GBP, CAD, AUD, SGD)</li>
          <li>• Partial payments for deposits/installments</li>
          <li>• Automatic and manual payment reminders</li>
          <li>• Professional PDF generation</li>
        </ul>
      </section>

      {/* Invoice status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="status">Invoice Status</h2>
        
        <p className="mb-4">
          Invoices move through the following statuses:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="h-3 w-3 rounded-full bg-muted-foreground" />
            <div>
              <span className="font-medium">Draft</span>
              <span className="text-sm text-muted-foreground ml-2">— Not yet sent, can be edited</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-purple-500/50 bg-purple-500/5">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <div>
              <span className="font-medium text-purple-600 dark:text-purple-400">Sent</span>
              <span className="text-sm text-muted-foreground ml-2">— Awaiting payment</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500/50 bg-blue-500/5">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <div>
              <span className="font-medium text-blue-500">Viewed</span>
              <span className="text-sm text-muted-foreground ml-2">— Client opened the payment link</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div>
              <span className="font-medium text-yellow-600 dark:text-yellow-500">Partial</span>
              <span className="text-sm text-muted-foreground ml-2">— Partially paid (deposits/installments)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <div>
              <span className="font-medium text-success">Paid</span>
              <span className="text-sm text-muted-foreground ml-2">— Fully paid</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/50 bg-destructive/5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div>
              <span className="font-medium text-destructive">Overdue</span>
              <span className="text-sm text-muted-foreground ml-2">— Past due date, not yet paid</span>
            </div>
          </div>
        </div>
      </section>

      {/* Creating invoices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="creating">Creating an Invoice</h2>
        
        <p className="mb-4">
          There are three ways to create an invoice:
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Option 1: From a milestone (recommended)</h3>
        <p className="mb-4">
          The fastest way when billing for completed project work:
        </p>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Go to your project detail page</li>
          <li>Find the completed milestone</li>
          <li>Click <strong>"Create Invoice"</strong></li>
          <li>Review the pre-filled details</li>
          <li>Click <strong>"Send Invoice"</strong></li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-success/20 bg-success/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-success">
            <CheckCircle2 className="h-4 w-4" />
            Auto-fills everything
          </h4>
          <p className="text-sm text-muted-foreground">
            Client info, project details, milestone name, and amount are automatically filled in. 
            Just review and send.
          </p>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Option 2: From tracked time</h3>
        <p className="mb-4">
          For hourly work, convert your tracked time into an invoice:
        </p>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Time Tracking</strong></li>
          <li>Filter to the project/time period you want to invoice</li>
          <li>Click <strong>"Create Invoice from Time"</strong></li>
          <li>Select which time entries to include</li>
          <li>Review and send</li>
        </ol>

        <p className="text-sm text-muted-foreground mb-6">
          <Link href="/docs/time-tracking/invoicing" className="text-primary hover:underline">
            Learn more about invoicing from time →
          </Link>
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Option 3: Manual creation</h3>
        <p className="mb-4">
          For custom invoices not tied to milestones or time:
        </p>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Invoices → New Invoice</strong></li>
          <li>Select the client and optionally a project</li>
          <li>Add line items with descriptions, quantities, and prices</li>
          <li>Set due date and currency</li>
          <li>Configure tax if applicable</li>
          <li>Save as draft or send immediately</li>
        </ol>
      </section>

      {/* Line items */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="line-items">Line Items</h2>
        
        <p className="mb-4">
          Each invoice can have multiple line items. For each item, specify:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="font-medium">Description</span>
              <span className="text-sm text-muted-foreground">What the charge is for</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="font-medium">Quantity</span>
              <span className="text-sm text-muted-foreground">Number of units (hours, items, etc.)</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="font-medium">Unit Price</span>
              <span className="text-sm text-muted-foreground">Price per unit</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount</span>
              <span className="text-sm text-muted-foreground">Auto-calculated: Quantity × Unit Price</span>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium mb-2">Example line items</h4>
          <div className="text-sm space-y-2 font-mono">
            <div className="flex justify-between">
              <span>Website design - Homepage</span>
              <span>1 × $2,500.00 = $2,500.00</span>
            </div>
            <div className="flex justify-between">
              <span>Development hours</span>
              <span>40 × $150.00 = $6,000.00</span>
            </div>
            <div className="flex justify-between">
              <span>Domain registration</span>
              <span>1 × $15.00 = $15.00</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/invoices/line-items" className="text-primary hover:underline">
            Learn more about line items and tax →
          </Link>
        </p>
      </section>

      {/* Sending */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="sending">Sending an Invoice</h2>
        
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>From the invoice detail page, click <strong>"Send Invoice"</strong></li>
          <li>Optionally add a personal message</li>
          <li>Click <strong>"Send"</strong></li>
        </ol>

        <p className="mb-4">
          Your client receives an email with a secure link to view and pay the invoice. The payment 
          page is hosted by Stripe Checkout — professional, secure, and mobile-friendly.
        </p>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            No client account needed
          </h4>
          <p className="text-sm text-muted-foreground">
            Clients simply click the link, enter their card details, and pay. They don't need to 
            create an account or remember a password.
          </p>
        </div>
      </section>

      {/* Payment notifications */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="notifications">Payment Notifications</h2>
        
        <p className="mb-4">
          When a client pays an invoice:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• <strong>You</strong> receive an email confirming the payment with amount and invoice details</li>
          <li>• <strong>Your client</strong> receives a payment receipt from Stripe</li>
          <li>• The invoice status automatically updates to "Paid"</li>
          <li>• The payment appears in your Stripe dashboard</li>
        </ul>

        <p>
          Funds are typically deposited to your bank account within 2-3 business days (varies by 
          country and bank).
        </p>
      </section>

      {/* Reminders */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="reminders">Payment Reminders</h2>
        
        <p className="mb-4">
          For unpaid invoices, you can send reminders manually or enable automatic reminders:
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Manual reminders</h3>
        <p className="mb-4">
          Click <strong>"Send Reminder"</strong> on any sent invoice. A friendly email is sent to 
          your client with the payment link.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Automatic reminders</h3>
        <p className="mb-4">
          Enable in Settings to automatically remind clients:
        </p>
        <ul className="mb-4 space-y-1 text-sm">
          <li>• 3 days after sending (if not yet paid)</li>
          <li>• 7 days after sending (if not yet paid)</li>
          <li>• When the invoice becomes overdue</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="font-medium">24-hour cooldown</h4>
              <p className="text-sm text-muted-foreground">
                There's a minimum 24-hour gap between reminders to avoid spamming your clients.
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/invoices/reminders" className="text-primary hover:underline">
            Learn more about payment reminders →
          </Link>
        </p>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Line items & tax", href: "/docs/invoices/line-items" as Route },
            { title: "Partial payments", href: "/docs/invoices/partial-payments" as Route },
            { title: "Payment reminders", href: "/docs/invoices/reminders" as Route },
            { title: "Multi-currency support", href: "/docs/invoices/currency" as Route },
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
