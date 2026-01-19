import Link from "next/link";
import { Metadata, Route } from "next";
import { ArrowRight, CheckCircle2, FolderKanban, FileText, CreditCard, Clock, Zap, AlertCircle } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Quick Start",
  description: "Get up and running with Zovo in under 5 minutes. Learn how to create your first client, project, and invoice.",
};

export default function QuickStartPage() {
  return (
    <DocsLayout pathname="/docs/quick-start">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Quick Start Guide</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Get up and running with Zovo in under 5 minutes. By the end of this guide, you'll have 
        sent your first invoice.
      </p>

      {/* Prerequisites */}
      <div className="not-prose mb-8 rounded-lg border border-border/50 bg-card/50 p-4">
        <h3 className="font-medium flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          Prerequisites
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• A Zovo account (sign up at <Link href={"/sign-up" as Route} className="text-primary hover:underline">zovo.dev/sign-up</Link>)</li>
          <li>• A Stripe account for accepting payments (free to create)</li>
          <li>• About 5 minutes of your time</li>
        </ul>
      </div>

      {/* Step 1 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
            1
          </div>
          <h2 className="text-2xl font-bold" id="step-1">Set up your business profile</h2>
        </div>
        
        <p className="mb-4">
          After signing up, head to <strong>Settings</strong> to configure your business information. This information 
          appears on invoices and contracts.
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium mb-2">Configure these settings:</h4>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span><strong>Business name</strong> — Your company or freelance business name</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span><strong>Business address</strong> — Appears on invoices and contracts</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span><strong>Logo</strong> — Optional, but adds professionalism to your documents</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span><strong>Default currency</strong> — USD, EUR, GBP, CAD, AUD, or SGD</span>
            </li>
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/account-setup" className="text-primary hover:underline">Learn more about account setup →</Link>
        </p>
      </section>

      {/* Step 2 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
            2
          </div>
          <h2 className="text-2xl font-bold" id="step-2">Connect Stripe</h2>
        </div>
        
        <p className="mb-4">
          To accept payments, you need to connect your Stripe account. Go to{" "}
          <strong>Settings → Stripe Connect</strong> and click "Connect Stripe Account".
        </p>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Important
          </h4>
          <p className="text-sm text-muted-foreground">
            Stripe will ask for your bank details and identity verification. This is required by law 
            for payment processing. The process takes about 5-10 minutes and payments typically start 
            working immediately after.
          </p>
        </div>

        <p className="mb-4">
          Once connected, you'll see a green "Connected" badge in your settings. Payments from your 
          invoices will be deposited directly into your bank account (typically within 2-3 business days).
        </p>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/stripe-setup" className="text-primary hover:underline">Learn more about Stripe setup →</Link>
        </p>
      </section>

      {/* Step 3 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
            3
          </div>
          <h2 className="text-2xl font-bold" id="step-3">Add your first client</h2>
        </div>
        
        <p className="mb-4">
          Navigate to <strong>Clients → New Client</strong> and enter your client's information:
        </p>

        <ul className="mb-4 space-y-2">
          <li><strong>Name</strong> — Your client's name (required)</li>
          <li><strong>Email</strong> — Where invoices and contracts will be sent (required)</li>
          <li><strong>Company</strong> — Their company name (optional)</li>
          <li><strong>Phone</strong> — Contact number (optional)</li>
          <li><strong>Notes</strong> — Private notes about the client (optional)</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Star your most important clients by clicking the star icon. Starred clients always 
            appear at the top of your client list for quick access.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/clients" className="text-primary hover:underline">Learn more about client management →</Link>
        </p>
      </section>

      {/* Step 4 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
            4
          </div>
          <h2 className="text-2xl font-bold" id="step-4">Create a project</h2>
        </div>
        
        <p className="mb-4">
          Go to <strong>Projects → New Project</strong> to create your first project:
        </p>

        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Select the client you just created</li>
          <li>Enter a project name (e.g., "Website Redesign")</li>
          <li>Add a description of the work</li>
          <li>Set start and end dates (optional)</li>
          <li>Add milestones with amounts</li>
        </ol>

        <h3 className="text-lg font-semibold mt-6 mb-3">Adding milestones</h3>
        <p className="mb-4">
          Milestones break your project into billable phases. For each milestone, specify:
        </p>

        <ul className="mb-4 space-y-2">
          <li><strong>Name</strong> — e.g., "Design Phase" or "Development Sprint 1"</li>
          <li><strong>Amount</strong> — How much this milestone costs</li>
          <li><strong>Due date</strong> — When it should be completed (optional)</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium mb-2">Example milestone structure</h4>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>1. Discovery & Planning</span>
              <span className="font-mono">$1,500</span>
            </div>
            <div className="flex justify-between">
              <span>2. Design Phase</span>
              <span className="font-mono">$3,000</span>
            </div>
            <div className="flex justify-between">
              <span>3. Development</span>
              <span className="font-mono">$5,000</span>
            </div>
            <div className="flex justify-between">
              <span>4. Testing & Launch</span>
              <span className="font-mono">$1,500</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-medium">
              <span>Total</span>
              <span className="font-mono">$11,000</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/projects/milestones" className="text-primary hover:underline">Learn more about milestones →</Link>
        </p>
      </section>

      {/* Step 5 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
            5
          </div>
          <h2 className="text-2xl font-bold" id="step-5">Send your first invoice</h2>
        </div>
        
        <p className="mb-4">
          Once you've completed a milestone, you can create an invoice in one click:
        </p>

        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Go to your project detail page</li>
          <li>Find the milestone you want to invoice</li>
          <li>Click "Create Invoice" on the completed milestone</li>
          <li>Review the invoice details</li>
          <li>Click "Send Invoice"</li>
        </ol>

        <p className="mb-4">
          Your client will receive an email with a link to view and pay the invoice. They can pay 
          with any credit card — no account needed.
        </p>

        <div className="not-prose mb-4 rounded-lg border border-success/20 bg-success/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-success">
            <CheckCircle2 className="h-4 w-4" />
            That's it!
          </h4>
          <p className="text-sm text-muted-foreground">
            You've just set up your Zovo account and sent your first invoice. When your client pays, 
            you'll receive an email notification and the funds will be deposited to your bank account.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/invoices" className="text-primary hover:underline">Learn more about invoicing →</Link>
        </p>
      </section>

      {/* What's next */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: FileText,
              title: "Send a contract",
              description: "Get agreements signed before starting work",
              href: "/docs/contracts" as Route,
            },
            {
              icon: Clock,
              title: "Track your time",
              description: "Bill clients for hourly work with built-in timers",
              href: "/docs/time-tracking" as Route,
            },
            {
              icon: CreditCard,
              title: "Enable partial payments",
              description: "Let clients pay invoices in installments",
              href: "/docs/invoices/partial-payments" as Route,
            },
            {
              icon: FolderKanban,
              title: "Share with clients",
              description: "Give clients access to their project portal",
              href: "/docs/projects/portal" as Route,
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:border-border hover:bg-card/50 transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  {item.title}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
}