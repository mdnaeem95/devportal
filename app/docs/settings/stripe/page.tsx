import Link from "next/link";
import { Metadata, Route } from "next";
import { CheckCircle2, AlertCircle, Zap, ArrowRight, ExternalLink, Shield } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Stripe Connect Settings",
  description: "Manage your Stripe Connect account for receiving payments.",
};

export default function StripeSettingsPage() {
  return (
    <DocsLayout pathname="/docs/settings/stripe">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Stripe Connect Settings</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Manage your Stripe Connect account, view connection status, and access your Stripe 
        dashboard for detailed payment management.
      </p>

      {/* Connection status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="status">Connection Status</h2>
        
        <p className="mb-4">
          View your Stripe Connect status in Settings:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-4 rounded-lg border border-success/50 bg-success/5">
            <CheckCircle2 className="h-6 w-6 text-success" />
            <div>
              <h4 className="font-medium">Connected</h4>
              <p className="text-sm text-muted-foreground">
                Your Stripe account is active and ready to receive payments
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <div>
              <h4 className="font-medium">Pending</h4>
              <p className="text-sm text-muted-foreground">
                Additional information required — complete Stripe onboarding
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground" />
            <div>
              <h4 className="font-medium text-muted-foreground">Not connected</h4>
              <p className="text-sm text-muted-foreground">
                Set up Stripe Connect to start accepting payments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Account details */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="details">Account Details</h2>
        
        <p className="mb-4">
          When connected, you can see:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium mb-3">Stripe Account</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-success font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Account ID</span>
              <span className="font-mono">acct_1234...xyz</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payouts enabled</span>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Charges enabled</span>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard access */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="dashboard">Stripe Dashboard</h2>
        
        <p className="mb-4">
          Access your full Stripe dashboard for detailed payment management:
        </p>

        <ul className="mb-6 space-y-2">
          <li>• View all transactions and payment history</li>
          <li>• Manage payout schedule and bank accounts</li>
          <li>• Handle disputes and refunds</li>
          <li>• Update business verification documents</li>
          <li>• Configure advanced payment settings</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Open Stripe Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Manage your full Stripe account settings
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
              Open Dashboard
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Express Dashboard
          </h4>
          <p className="text-sm text-muted-foreground">
            Zovo uses Stripe Connect Express, which gives you a simplified dashboard focused on 
            payouts and transactions. For advanced settings, use the full Stripe dashboard link.
          </p>
        </div>
      </section>

      {/* Disconnecting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="disconnect">Disconnecting Stripe</h2>
        
        <p className="mb-4">
          You can disconnect your Stripe account if needed:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Settings</strong></li>
          <li>Find the <strong>Stripe Connect</strong> section</li>
          <li>Click <strong>Disconnect</strong></li>
          <li>Confirm the disconnection</li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Before disconnecting
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Outstanding payments will still be processed</li>
            <li>• Pending payouts will complete normally</li>
            <li>• You won't be able to accept new payments until reconnected</li>
            <li>• Historical data remains in your Stripe account</li>
          </ul>
        </div>
      </section>

      {/* Reconnecting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="reconnect">Reconnecting</h2>
        
        <p className="mb-4">
          If you disconnected or need to switch accounts:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Settings</strong></li>
          <li>Click <strong>Connect Stripe</strong></li>
          <li>Follow the Stripe onboarding flow</li>
          <li>You can connect the same or a different Stripe account</li>
        </ol>
      </section>

      {/* Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="security">Security</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Secure OAuth connection</h4>
              <p className="text-sm text-muted-foreground">
                Zovo never sees or stores your Stripe credentials
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Limited access</h4>
              <p className="text-sm text-muted-foreground">
                Zovo only requests permissions needed for payment processing
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">PCI compliant</h4>
              <p className="text-sm text-muted-foreground">
                All payment processing handled by Stripe's PCI-compliant infrastructure
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
            { title: "Initial Stripe setup", href: "/docs/stripe-setup" as Route },
            { title: "Creating invoices", href: "/docs/invoices" as Route },
            { title: "Payment reminders", href: "/docs/invoices/reminders" as Route },
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
