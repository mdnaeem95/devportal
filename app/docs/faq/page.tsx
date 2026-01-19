import { Metadata } from "next";
import { HelpCircle, Mail } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Zovo - billing, payments, data, and more.",
};

const faqs = [
  {
    category: "Account & Billing",
    questions: [
      {
        q: "How much does Zovo cost?",
        a: "Zovo offers two plans: Solo at $19/month for individual freelancers, and Pro at $39/month with advanced features like API access and priority support. Both plans include a 14-day free trial.",
      },
      {
        q: "Can I try Zovo before paying?",
        a: "Yes! Every new account gets a 14-day free trial with full access to all features. No credit card required to start.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Settings → Subscription and click 'Cancel Subscription'. Your account will remain active until the end of your billing period.",
      },
      {
        q: "What happens to my data if I cancel?",
        a: "We retain your data for 30 days after cancellation in case you change your mind. After that, it's permanently deleted. You can export all your data anytime from Settings → Export.",
      },
      {
        q: "Do you offer refunds?",
        a: "We don't offer partial refunds for unused time. If you cancel, you'll have access until the end of your current billing period. If you're unhappy within the first 7 days, contact support for a full refund.",
      },
    ],
  },
  {
    category: "Clients & Projects",
    questions: [
      {
        q: "Do my clients need to create accounts?",
        a: "No! Clients access everything via secure shareable links. They can view projects, sign contracts, and pay invoices without creating an account or remembering a password.",
      },
      {
        q: "Can I import existing clients?",
        a: "Currently, clients need to be added manually. CSV import is on our roadmap. Contact support if you have a large list to migrate.",
      },
      {
        q: "How many clients/projects can I have?",
        a: "There's no limit on the number of clients or projects on any plan.",
      },
      {
        q: "Can I share a project with multiple client contacts?",
        a: "Projects have a single primary client contact. You can share the public project portal link with anyone, but invoices and contracts are sent to the primary contact email.",
      },
    ],
  },
  {
    category: "Contracts & E-Signatures",
    questions: [
      {
        q: "Are Zovo e-signatures legally binding?",
        a: "Yes. Zovo e-signatures comply with ESIGN Act (US) and UETA standards. Each signature includes an audit trail with IP address, timestamp, and signature method for legal validity.",
      },
      {
        q: "Can I customize contract templates?",
        a: "Yes! Create your own templates with variables like {{clientName}} and {{projectName}}. You can also duplicate and modify the built-in system templates.",
      },
      {
        q: "What happens if a client declines a contract?",
        a: "You'll receive an email notification. The contract status changes to 'Declined'. You can create a new contract with updated terms if needed.",
      },
      {
        q: "Can I require my signature before the client?",
        a: "Yes, this is called sequential signing. Sign the contract first, then send it to your client. This is a professional best practice.",
      },
    ],
  },
  {
    category: "Invoices & Payments",
    questions: [
      {
        q: "How do I accept payments?",
        a: "Payments are processed through Stripe Connect. Go to Settings → Stripe Connect to link your Stripe account. Clients can pay any invoice with a credit card.",
      },
      {
        q: "What payment methods do clients have?",
        a: "Clients can pay with any major credit or debit card (Visa, Mastercard, Amex, Discover). We use Stripe Checkout for a secure, mobile-friendly payment experience.",
      },
      {
        q: "How long until I receive payments?",
        a: "Once a client pays, funds are typically deposited to your bank account within 2-3 business days. This varies by country and bank.",
      },
      {
        q: "What are the payment processing fees?",
        a: "Zovo doesn't charge additional fees for payments. You only pay Stripe's standard processing fees (2.9% + $0.30 per transaction in the US). Rates vary by country.",
      },
      {
        q: "Can clients pay in installments?",
        a: "Yes! Enable partial payments on an invoice to let clients pay a deposit or split payments. They'll see the remaining balance and can pay the rest later.",
      },
      {
        q: "What currencies are supported?",
        a: "We support USD, EUR, GBP, CAD, AUD, and SGD. Set your default currency in Settings, and override per invoice if needed.",
      },
    ],
  },
  {
    category: "Time Tracking",
    questions: [
      {
        q: "What's the difference between Tracked and Manual time?",
        a: "Tracked time is logged using the real-time timer — you started the timer and it ran while you worked. Manual time is added after the fact. Clients can see which type each entry is.",
      },
      {
        q: "Why can't I add time from weeks ago?",
        a: "By default, manual entries are limited to 7 days in the past. This anti-abuse feature builds client trust. You can adjust this limit in Time Tracking Settings.",
      },
      {
        q: "Can I edit time entries after creating them?",
        a: "Yes, you can edit entries that haven't been invoiced. Once time is included in an invoice, it becomes locked to prevent changes to billed time.",
      },
      {
        q: "Do clients see my time entries?",
        a: "By default, yes. Clients can view time logs in their project portal, including entry type (Tracked vs Manual). You can disable this in Time Tracking Settings.",
      },
    ],
  },
  {
    category: "Data & Security",
    questions: [
      {
        q: "Is my data secure?",
        a: "Yes. We use TLS/SSL encryption for all connections, encrypt data at rest, and never store credit card information (that's handled by Stripe). We're hosted on Vercel with data stored in Neon PostgreSQL.",
      },
      {
        q: "Can I export my data?",
        a: "Yes. Go to Settings → Export to download all your clients, projects, invoices, contracts, and time entries in JSON or CSV format.",
      },
      {
        q: "Do you sell my data?",
        a: "No. We never sell, share, or monetize your data. See our Privacy Policy for details.",
      },
      {
        q: "Where are your servers located?",
        a: "We use Vercel's global edge network with data stored in secure US-based data centers.",
      },
    ],
  },
  {
    category: "Features & Integrations",
    questions: [
      {
        q: "Do you have a mobile app?",
        a: "Not yet, but the web app is fully responsive and works great on mobile browsers. A native app is on our long-term roadmap.",
      },
      {
        q: "Can I integrate with other tools?",
        a: "Pro plan users have API access to build custom integrations. Native integrations with tools like Slack, QuickBooks, and GitHub are on our roadmap.",
      },
      {
        q: "Do you have an API?",
        a: "Yes! API access is available on Pro plans. See the API Reference documentation for details.",
      },
      {
        q: "Can I white-label Zovo for my agency?",
        a: "Not currently. Zovo is designed for individual freelancers. Contact us if you're interested in agency features.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <DocsLayout pathname="/docs/faq">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Quick answers to common questions about Zovo.
      </p>

      {/* FAQ sections */}
      <div className="space-y-12">
        {faqs.map((section) => (
          <section key={section.category}>
            <h2 className="text-2xl font-bold mb-6" id={section.category.toLowerCase().replace(/\s+/g, "-")}>
              {section.category}
            </h2>
            
            <div className="space-y-4">
              {section.questions.map((faq, index) => (
                <div
                  key={index}
                  className="not-prose rounded-lg border border-border/50 bg-card/50 p-5"
                >
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Still have questions */}
      <section className="not-prose mt-16">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Still have questions?</h3>
              <p className="mt-1 text-sm text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is happy to help.
              </p>
              <a
                href="mailto:support@zovo.dev"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                support@zovo.dev
              </a>
            </div>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
