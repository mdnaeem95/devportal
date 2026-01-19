import Link from "next/link";
import { Metadata } from "next";
import { Settings, Building2, Image, Globe, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Account Setup",
  description: "Configure your Zovo account with business information, logo, and preferences.",
};

export default function AccountSetupPage() {
  return (
    <DocsLayout pathname="/docs/account-setup">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Account Setup</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Configure your business information to appear on invoices, contracts, and client communications.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        <p className="mb-4">
          Your account settings control how your business appears to clients. This information is used on:
        </p>
        <ul className="mb-4 space-y-2">
          <li>• Invoice headers and footers</li>
          <li>• Contract documents</li>
          <li>• Email notifications sent to clients</li>
          <li>• Public project portals</li>
        </ul>
        <p>
          Access your settings from the sidebar by clicking <strong>Settings</strong>, or use the 
          keyboard shortcut <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary text-xs">⌘K</kbd> and 
          type "settings".
        </p>
      </section>

      {/* Business Information */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="business-info">Business Information</h2>
        
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-3">Required fields</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Business Name</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your company name or your name as a sole proprietor. This appears prominently on all 
                    client-facing documents.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Email Address</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your primary contact email. Client replies to invoice and contract emails will go here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-3">Optional fields</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">Business Address</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your business mailing address. Appears on invoices and contracts. Required in some 
                    jurisdictions for legal compliance.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Tax ID / VAT Number</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your business tax identification number (EIN, VAT, GST, etc.). Displayed on invoices 
                    when set.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Phone Number</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional contact number for your business.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="logo">Business Logo</h2>
        
        <p className="mb-4">
          Upload your business logo to appear on invoices, contracts, and emails. A professional logo 
          helps build trust with clients.
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Image className="h-4 w-4" />
            Logo requirements
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>Format:</strong> PNG, JPG, or SVG</li>
            <li>• <strong>Max size:</strong> 2MB</li>
            <li>• <strong>Recommended:</strong> Square or horizontal orientation</li>
            <li>• <strong>Min resolution:</strong> 200x200 pixels</li>
          </ul>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">How to upload</h3>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Settings → Business Profile</strong></li>
          <li>Click the logo upload area or drag and drop your image</li>
          <li>Wait for the upload to complete</li>
          <li>Click "Save Changes"</li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Use a logo with a transparent background (PNG) for the best appearance on invoices and 
            contracts, which have white backgrounds.
          </p>
        </div>
      </section>

      {/* Currency */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="currency">Default Currency</h2>
        
        <p className="mb-4">
          Set your default currency for new invoices and projects. You can always override this on 
          individual invoices.
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4" />
            Supported currencies
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              { code: "USD", name: "US Dollar", symbol: "$" },
              { code: "EUR", name: "Euro", symbol: "€" },
              { code: "GBP", name: "British Pound", symbol: "£" },
              { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
              { code: "AUD", name: "Australian Dollar", symbol: "A$" },
              { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
            ].map((currency) => (
              <div key={currency.code} className="flex items-center gap-2">
                <span className="font-mono font-medium w-10">{currency.code}</span>
                <span className="text-muted-foreground">{currency.symbol}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Note on multi-currency
          </h4>
          <p className="text-sm text-muted-foreground">
            Stripe handles currency conversion automatically. However, your Stripe account must be 
            configured to accept payments in each currency you want to use. Check your{" "}
            <a href="https://dashboard.stripe.com/settings/payouts" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Stripe payout settings
            </a>{" "}
            to enable additional currencies.
          </p>
        </div>
      </section>

      {/* Saving Changes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="saving">Saving Changes</h2>
        
        <p className="mb-4">
          After making changes to your settings, click the <strong>"Save Changes"</strong> button at 
          the bottom of the form. You'll see a confirmation toast when your settings are saved.
        </p>

        <div className="not-prose rounded-lg border border-success/20 bg-success/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-success">
            <CheckCircle2 className="h-4 w-4" />
            Changes apply immediately
          </h4>
          <p className="text-sm text-muted-foreground">
            Updated settings are applied to all new invoices, contracts, and emails immediately. 
            Previously sent documents retain the information they were created with.
          </p>
        </div>
      </section>

      {/* Next steps */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <p className="text-muted-foreground mb-4">
          Now that your account is set up, connect Stripe to start accepting payments:
        </p>
        <Link
          href="/docs/stripe-setup"
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Connect Stripe
          <span>→</span>
        </Link>
      </section>
    </DocsLayout>
  );
}
