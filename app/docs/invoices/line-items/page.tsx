import Link from "next/link";
import { Metadata, Route } from "next";
import { CheckCircle2, Zap, ArrowRight, GripVertical } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Line Items & Tax",
  description: "Configure invoice line items with quantities, rates, and tax calculations.",
};

export default function LineItemsPage() {
  return (
    <DocsLayout pathname="/docs/invoices/line-items">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Line Items & Tax</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Build detailed invoices with multiple line items, quantities, and automatic tax calculations.
      </p>

      {/* Adding line items */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="adding">Adding Line Items</h2>
        
        <p className="mb-4">
          Each invoice can have multiple line items. Each line item includes:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium mb-3">Line item fields</h4>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">Description</label>
                <div className="mt-1 px-3 py-2 rounded border border-border bg-background">
                  Homepage design and development
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Quantity</label>
                <div className="mt-1 px-3 py-2 rounded border border-border bg-background text-center">
                  1
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Unit Price</label>
                <div className="mt-1 px-3 py-2 rounded border border-border bg-background">
                  $2,500.00
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Amount</label>
                <div className="mt-1 px-3 py-2 rounded border border-border bg-secondary/50 font-medium">
                  $2,500.00
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">To add a line item:</h3>
        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Click <strong>Add Line Item</strong></li>
          <li>Enter a description of the work or deliverable</li>
          <li>Set the quantity (default: 1)</li>
          <li>Enter the unit price</li>
          <li>Amount calculates automatically</li>
        </ol>
      </section>

      {/* Reordering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="reordering">Reordering Line Items</h2>
        
        <p className="mb-4">
          Drag line items to reorder them on your invoice:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded bg-secondary/30">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <span className="text-sm flex-1">1. Discovery & Planning</span>
              <span className="text-sm font-mono">$1,000</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-secondary/30">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <span className="text-sm flex-1">2. Design Phase</span>
              <span className="text-sm font-mono">$3,000</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-secondary/30">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <span className="text-sm flex-1">3. Development</span>
              <span className="text-sm font-mono">$5,000</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          The order you set is how items appear on the PDF and in the client payment portal.
        </p>
      </section>

      {/* Tax configuration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="tax">Tax Configuration</h2>
        
        <p className="mb-4">
          Add tax to invoices when required by your jurisdiction:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium mb-3">Tax settings</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Enable tax</span>
              <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">On</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax name</span>
              <span className="font-mono">Sales Tax</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax rate</span>
              <span className="font-mono">8.875%</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Setting up tax</h3>
        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>When creating/editing an invoice, toggle <strong>Add Tax</strong></li>
          <li>Enter your tax name (e.g., "VAT", "GST", "Sales Tax")</li>
          <li>Enter the percentage rate</li>
          <li>Tax is calculated on the subtotal automatically</li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Default tax rate
          </h4>
          <p className="text-sm text-muted-foreground">
            Set a default tax rate in Settings to pre-fill on new invoices. You can override it 
            per invoice.
          </p>
        </div>
      </section>

      {/* Calculations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="calculations">Invoice Calculations</h2>
        
        <p className="mb-4">
          Zovo automatically calculates totals as you build your invoice:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Line item 1: Homepage</span>
              <span className="font-mono">$2,500.00</span>
            </div>
            <div className="flex justify-between">
              <span>Line item 2: About Page</span>
              <span className="font-mono">$1,000.00</span>
            </div>
            <div className="flex justify-between">
              <span>Line item 3: Contact Form</span>
              <span className="font-mono">$500.00</span>
            </div>
          </div>
          <div className="p-4 bg-secondary/30 border-t border-border/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">$4,000.00</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (8.875%)</span>
              <span className="font-mono">$355.00</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border/50">
              <span>Total</span>
              <span className="font-mono">$4,355.00</span>
            </div>
          </div>
        </div>

        <p className="mb-4">
          Formula: <code className="px-1.5 py-0.5 rounded bg-secondary text-sm font-mono">
            Total = Subtotal + (Subtotal × Tax Rate)
          </code>
        </p>
      </section>

      {/* Best practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="best-practices">Best Practices</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Be specific in descriptions</h4>
              <p className="text-sm text-muted-foreground">
                "Homepage design with responsive layout" is better than "Design work"
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Match milestones when possible</h4>
              <p className="text-sm text-muted-foreground">
                Use the same line items as your project milestones for consistency
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Consult a tax professional</h4>
              <p className="text-sm text-muted-foreground">
                Tax requirements vary by location and service type — get proper advice
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
            { title: "Multi-currency", href: "/docs/invoices/currency" as Route },
            { title: "Partial payments", href: "/docs/invoices/partial-payments" as Route },
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
