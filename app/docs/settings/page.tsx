import Link from "next/link";
import { Metadata, Route } from "next";
import { Building2, Image, CreditCard, Bell, Globe, ArrowRight } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Settings Overview",
  description: "Configure your Zovo account, business profile, branding, and preferences.",
};

export default function SettingsPage() {
  return (
    <DocsLayout pathname="/docs/settings">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Settings</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Configure your account, business information, and preferences. Access settings 
        from the sidebar menu or use{" "}
        <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs">⌘K</kbd>{" "}
        and type "settings".
      </p>

      {/* Settings sections */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="sections">Settings Sections</h2>

        <div className="not-prose space-y-4">
          {[
            {
              icon: Building2,
              title: "Business Profile",
              description: "Your business name, address, and tax ID. This information appears on invoices and contracts.",
              href: "/docs/account-setup#business-profile" as Route,
            },
            {
              icon: Image,
              title: "Branding & Logo",
              description: "Upload your logo to add it to invoices, contracts, and email communications.",
              href: "/docs/settings/branding" as Route,
            },
            {
              icon: CreditCard,
              title: "Stripe Connect",
              description: "Connect or manage your Stripe account for accepting payments.",
              href: "/docs/settings/stripe" as Route,
            },
            {
              icon: Bell,
              title: "Notifications",
              description: "Configure which email notifications you receive.",
              href: "/docs/settings/notifications" as Route,
            },
            {
              icon: Globe,
              title: "Preferences",
              description: "Default currency, timezone, and other preferences.",
              href: "/docs/account-setup#currency" as Route,
            },
          ].map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card/50 hover:border-border hover:bg-card transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
                <section.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-2">
                  {section.title}
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick settings checklist */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="checklist">Setup Checklist</h2>
        <p className="mb-4">
          Make sure you've configured these essential settings before sending your first invoice:
        </p>

        <div className="not-prose space-y-3">
          {[
            { label: "Business name added", required: true },
            { label: "Business address configured", required: true },
            { label: "Stripe account connected", required: true },
            { label: "Default currency set", required: true },
            { label: "Logo uploaded", required: false },
            { label: "Tax ID added (if applicable)", required: false },
          ].map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50"
            >
              <div className="h-5 w-5 rounded border-2 border-muted-foreground flex items-center justify-center">
                {/* Checkbox placeholder */}
              </div>
              <span className="flex-1">{item.label}</span>
              {item.required && (
                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">Required</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Detailed guides */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-6">Detailed Guides</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Account Setup",
              description: "Complete business profile configuration",
              href: "/docs/account-setup" as Route,
            },
            {
              title: "Branding & Logo",
              description: "Customize your visual identity",
              href: "/docs/settings/branding" as Route,
            },
            {
              title: "Stripe Connect",
              description: "Payment setup and management",
              href: "/docs/stripe-setup" as Route,
            },
            {
              title: "Notifications",
              description: "Email preferences and alerts",
              href: "/docs/settings/notifications" as Route,
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border hover:bg-card/50 transition-colors group"
            >
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
}
