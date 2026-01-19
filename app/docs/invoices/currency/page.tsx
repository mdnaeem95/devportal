import Link from "next/link";
import { Metadata, Route } from "next";
import { Globe, DollarSign, CheckCircle2, AlertCircle, Zap, ArrowRight } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Multi-Currency",
  description: "Invoice clients in their preferred currency with multi-currency support.",
};

export default function InvoiceCurrencyPage() {
  return (
    <DocsLayout pathname="/docs/invoices/currency">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Multi-Currency Invoicing</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Invoice international clients in their preferred currency. Zovo supports major currencies 
        with Stripe handling the payment processing.
      </p>

      {/* Supported currencies */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="supported">Supported Currencies</h2>
        
        <p className="mb-4">
          Zovo currently supports these currencies for invoicing:
        </p>

        <div className="not-prose grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
            { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
            { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
            { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦" },
            { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
            { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
          ].map((currency) => (
            <div key={currency.code} className="rounded-lg border border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{currency.flag}</span>
                <span className="font-mono font-medium">{currency.code}</span>
              </div>
              <p className="text-sm text-muted-foreground">{currency.name}</p>
              <p className="text-xs text-muted-foreground">Symbol: {currency.symbol}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Need a different currency?{" "}
          <Link href="/docs/support" className="text-primary hover:underline">
            Let us know
          </Link>{" "}
          and we'll consider adding it.
        </p>
      </section>

      {/* Setting default currency */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="default">Setting Your Default Currency</h2>
        
        <p className="mb-4">
          Set your default currency in Settings. This currency is used for new invoices unless 
          you override it.
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Settings</strong></li>
          <li>Find the <strong>Default Currency</strong> dropdown</li>
          <li>Select your preferred currency</li>
          <li>Settings save automatically</li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Set your default to the currency you bill in most often. You can always change it 
            per-invoice for international clients.
          </p>
        </div>
      </section>

      {/* Per-invoice currency */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="per-invoice">Setting Currency Per Invoice</h2>
        
        <p className="mb-4">
          When creating an invoice, you can choose a different currency:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Create a new invoice</li>
          <li>Find the <strong>Currency</strong> dropdown</li>
          <li>Select the client's preferred currency</li>
          <li>Enter amounts in that currency</li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Currency is locked after sending
          </h4>
          <p className="text-sm text-muted-foreground">
            Once an invoice is sent, the currency cannot be changed. Make sure to verify the 
            currency before sending.
          </p>
        </div>
      </section>

      {/* How payments work */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="payments">How Payments Work</h2>
        
        <p className="mb-4">
          When a client pays an invoice in a foreign currency:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Client pays in invoice currency</h4>
              <p className="text-sm text-muted-foreground">
                If invoice is in EUR, client is charged in EUR
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Stripe handles conversion</h4>
              <p className="text-sm text-muted-foreground">
                Stripe automatically converts to your payout currency at market rates
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">You receive your payout currency</h4>
              <p className="text-sm text-muted-foreground">
                Funds arrive in your Stripe account in your configured payout currency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exchange rates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="exchange-rates">Exchange Rates</h2>
        
        <p className="mb-4">
          Important things to know about exchange rates:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Stripe uses mid-market exchange rates at time of payment</li>
          <li>• A small conversion fee may apply (typically 1-2%)</li>
          <li>• The exact amount you receive depends on rates when the payment settles</li>
          <li>• View Stripe's current rates in your Stripe Dashboard</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Rate fluctuation
          </h4>
          <p className="text-sm text-muted-foreground">
            Exchange rates change constantly. The amount shown in your reports may differ slightly 
            from the final payout due to rate fluctuations between payment and settlement.
          </p>
        </div>
      </section>

      {/* Reporting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="reporting">Currency in Reports</h2>
        
        <p className="mb-4">
          Dashboard statistics and reports show amounts in your default currency:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Revenue totals are converted to your default currency</li>
          <li>• Individual invoices show their original currency</li>
          <li>• Payment history includes conversion details from Stripe</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Tax considerations
          </h4>
          <p className="text-sm text-muted-foreground">
            For tax reporting purposes, consult with your accountant about how to report income 
            received in foreign currencies. Keep records of both the original invoice amount and 
            the converted payout amount.
          </p>
        </div>
      </section>

      {/* Best practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="best-practices">Best Practices</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Ask clients their preference</h4>
              <p className="text-sm text-muted-foreground">
                International clients often prefer invoices in their local currency for easier 
                expense tracking.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Price in major currencies</h4>
              <p className="text-sm text-muted-foreground">
                USD, EUR, and GBP are widely accepted. Consider quoting in these for simplicity.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Build in a buffer for large projects</h4>
              <p className="text-sm text-muted-foreground">
                For long projects with foreign currency, consider rate fluctuation in your pricing.
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
            { title: "Stripe Connect setup", href: "/docs/stripe-setup" as Route },
            { title: "Account settings", href: "/docs/account-setup" as Route },
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
