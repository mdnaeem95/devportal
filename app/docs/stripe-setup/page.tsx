import Link from "next/link";
import { Metadata } from "next";
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Shield, Zap, Clock, ArrowRight } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Connecting Stripe",
  description: "Set up Stripe Connect to accept payments from your clients through Zovo.",
};

export default function StripeSetupPage() {
  return (
    <DocsLayout pathname="/docs/stripe-setup">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Connecting Stripe</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Set up Stripe Connect to accept credit card payments from your clients. Funds are deposited 
        directly into your bank account.
      </p>

      {/* Why Stripe */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="why-stripe">Why Stripe Connect?</h2>
        
        <p className="mb-4">
          Zovo uses Stripe Connect to process payments. This means:
        </p>

        <div className="not-prose grid gap-4 sm:grid-cols-2 mb-4">
          {[
            {
              icon: Shield,
              title: "Secure payments",
              description: "Stripe is PCI-DSS compliant. We never see or store your clients' card numbers.",
            },
            {
              icon: CreditCard,
              title: "Direct deposits",
              description: "Payments go directly to your bank account, not through Zovo.",
            },
            {
              icon: Clock,
              title: "Fast payouts",
              description: "Funds typically arrive in 2-3 business days (varies by country).",
            },
            {
              icon: Zap,
              title: "No extra fees from Zovo",
              description: "You only pay Stripe's standard processing fees (2.9% + 30¢).",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <item.icon className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prerequisites */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="prerequisites">Before You Start</h2>
        
        <p className="mb-4">You'll need the following to complete Stripe onboarding:</p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span><strong>Bank account details</strong> — Account and routing number for payouts</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span><strong>Business information</strong> — Business type, address, and tax ID</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span><strong>Identity verification</strong> — Government ID and last 4 of SSN (US) or equivalent</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span><strong>5-10 minutes</strong> — Time to complete the onboarding process</span>
            </li>
          </ul>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Identity verification is required by law
          </h4>
          <p className="text-sm text-muted-foreground">
            Stripe is required to verify your identity to comply with financial regulations (KYC/AML). 
            This is a one-time process and your information is securely stored by Stripe.
          </p>
        </div>
      </section>

      {/* Step by step */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="connect-steps">Connecting Your Account</h2>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-2">Navigate to Settings</h3>
              <p className="text-muted-foreground">
                Go to <strong>Settings</strong> from the sidebar, then scroll down to the 
                <strong> Stripe Connect</strong> section.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-2">Click "Connect Stripe Account"</h3>
              <p className="text-muted-foreground">
                You'll be redirected to Stripe's secure onboarding flow. This opens in the same 
                window—don't worry, you'll be returned to Zovo when done.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-2">Complete Stripe onboarding</h3>
              <p className="text-muted-foreground mb-3">
                Follow Stripe's prompts to enter your business and bank information. The exact steps 
                depend on your country and business type.
              </p>
              <div className="not-prose rounded-lg border border-border/50 bg-card/50 p-4">
                <h4 className="font-medium text-sm mb-2">Typical information requested:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Business type (individual, LLC, corporation, etc.)</li>
                  <li>• Business address and phone number</li>
                  <li>• Tax ID (EIN, SSN, or equivalent)</li>
                  <li>• Bank account for payouts</li>
                  <li>• Personal information for identity verification</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-2">Return to Zovo</h3>
              <p className="text-muted-foreground">
                After completing onboarding, you'll be redirected back to Zovo. Your settings page 
                will show a green "Connected" badge if everything went well.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Connection status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="status">Connection Status</h2>
        
        <p className="mb-4">
          After connecting, your Stripe status will show one of these states:
        </p>

        <div className="not-prose space-y-3 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <div className="h-3 w-3 rounded-full bg-success" />
            <div>
              <span className="font-medium text-success">Connected</span>
              <span className="text-sm text-muted-foreground ml-2">— Ready to accept payments</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div>
              <span className="font-medium text-yellow-600 dark:text-yellow-500">Pending</span>
              <span className="text-sm text-muted-foreground ml-2">— Stripe is reviewing your information</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/50 bg-destructive/5">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <div>
              <span className="font-medium text-destructive">Action Required</span>
              <span className="text-sm text-muted-foreground ml-2">— Additional information needed</span>
            </div>
          </div>
        </div>

        <p>
          If your status shows "Action Required", click the link to complete any missing steps in Stripe.
        </p>
      </section>

      {/* Managing your account */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="managing">Managing Your Stripe Account</h2>
        
        <p className="mb-4">
          Once connected, you can access your Stripe dashboard directly from Zovo:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium mb-3">Available actions</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span><strong>View Stripe Dashboard</strong> — See all payments, payouts, and account details</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span><strong>View balance</strong> — See pending and available balance</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span><strong>Disconnect</strong> — Remove Stripe connection (you won't be able to accept payments)</span>
            </li>
          </ul>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Bookmark your{" "}
            <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              Stripe Dashboard
              <ExternalLink className="h-3 w-3" />
            </a>{" "}
            for quick access to detailed payment reports, refunds, and payout schedules.
          </p>
        </div>
      </section>

      {/* Fees */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="fees">Payment Fees</h2>
        
        <p className="mb-4">
          Zovo does not charge any additional fees for payment processing. You only pay Stripe's 
          standard rates:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="font-medium">Standard cards (US)</span>
              <span className="font-mono">2.9% + $0.30</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="font-medium">International cards</span>
              <span className="font-mono">+1.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Currency conversion</span>
              <span className="font-mono">+1%</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Fees vary by country. See{" "}
            <a href="https://stripe.com/pricing" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Stripe's pricing page
            </a>{" "}
            for your region.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Example: For a $1,000 invoice paid by a US card, Stripe's fee would be $29.30, and you'd 
          receive $970.70.
        </p>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="troubleshooting">Troubleshooting</h2>
        
        <div className="space-y-4">
          <div className="not-prose rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-2">I was redirected back but still show as "Not Connected"</h4>
            <p className="text-sm text-muted-foreground">
              Try refreshing the page. If the issue persists, you may not have completed all required 
              steps in Stripe. Click "Connect Stripe Account" again to continue where you left off.
            </p>
          </div>

          <div className="not-prose rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-2">My status shows "Action Required"</h4>
            <p className="text-sm text-muted-foreground">
              Stripe needs additional information to verify your account. Click the "Complete Setup" 
              link to see what's missing. Common issues include missing bank account info or identity 
              verification.
            </p>
          </div>

          <div className="not-prose rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-2">I connected but my client can't pay</h4>
            <p className="text-sm text-muted-foreground">
              Make sure your Stripe account is fully verified and has payouts enabled. Check your 
              Stripe Dashboard for any alerts or required actions.
            </p>
          </div>

          <div className="not-prose rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium mb-2">I want to use a different Stripe account</h4>
            <p className="text-sm text-muted-foreground">
              First disconnect your current account from Settings → Stripe Connect → Disconnect. 
              Then connect your new Stripe account.
            </p>
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">You're Ready!</h2>
        <div className="rounded-lg border border-success/20 bg-success/5 p-4 mb-6">
          <p className="flex items-center gap-2 text-success font-medium">
            <CheckCircle2 className="h-5 w-5" />
            Your account is set up to accept payments
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Now you can create invoices and your clients can pay with any credit card. Funds will be 
            deposited directly to your bank account.
          </p>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Ready to create your first invoice?
        </p>
        <Link
          href="/docs/invoices"
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Learn about invoicing
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </DocsLayout>
  );
}
