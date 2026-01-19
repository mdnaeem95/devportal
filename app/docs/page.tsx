import Link from "next/link";
import { Metadata, Route } from "next";
import { BookOpen, Users, FolderKanban, FileText, CreditCard, Clock, Package, Code, HelpCircle, ArrowRight } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to use Zovo to manage your freelance business professionally.",
};

export default function DocsPage() {
  return (
    <DocsLayout pathname="/docs">
      {/* Hero section - no breadcrumb on landing */}
      <div className="not-prose mb-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-sm">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Documentation</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to Zovo Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Everything you need to manage your freelance business professionally. 
          From getting started to advanced features.
        </p>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/docs/quick-start"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Quick Start Guide
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs/api"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Code className="h-4 w-4" />
            API Reference
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="not-prose grid gap-4 sm:grid-cols-2 mb-12">
        {[
          {
            icon: Users,
            title: "Client Management",
            description: "Organize clients with status tracking, payment insights, and follow-up reminders.",
            href: "/docs/clients" as Route,
            color: "from-blue-500 to-cyan-500",
          },
          {
            icon: FolderKanban,
            title: "Projects & Milestones",
            description: "Create projects with milestones, track progress, and share with clients.",
            href: "/docs/projects" as Route,
            color: "from-purple-500 to-pink-500",
          },
          {
            icon: FileText,
            title: "Contracts & E-Signatures",
            description: "Send professional contracts with built-in e-signatures.",
            href: "/docs/contracts" as Route,
            color: "from-orange-500 to-red-500",
          },
          {
            icon: CreditCard,
            title: "Invoicing & Payments",
            description: "Create invoices, accept Stripe payments, and track partial payments.",
            href: "/docs/invoices" as Route,
            color: "from-green-500 to-emerald-500",
          },
          {
            icon: Clock,
            title: "Time Tracking",
            description: "Track billable hours with integrity features that build client trust.",
            href: "/docs/time-tracking" as Route,
            color: "from-yellow-500 to-orange-500",
          },
          {
            icon: Package,
            title: "Deliverables",
            description: "Upload files with versioning and track when clients download.",
            href: "/docs/deliverables" as Route,
            color: "from-indigo-500 to-purple-500",
          },
        ].map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="group rounded-xl border border-border/50 bg-card/50 p-5 hover:border-border hover:bg-card transition-all"
          >
            <div className={`inline-flex rounded-lg bg-gradient-to-br ${feature.color} p-2.5`}>
              <feature.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="mt-3 font-semibold flex items-center gap-2">
              {feature.title}
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
          </Link>
        ))}
      </div>

      {/* Getting Started steps */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Get Started in 5 Minutes</h2>
        
        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Create your account",
              description: "Sign up with email or Google. Start your 14-day free trial — no credit card required.",
            },
            {
              step: "2",
              title: "Add your first client",
              description: "Enter client details and notes. Star important clients for quick access.",
            },
            {
              step: "3",
              title: "Create a project with milestones",
              description: "Set up your project scope, add milestones with amounts and due dates.",
            },
            {
              step: "4",
              title: "Send a contract (optional)",
              description: "Use a template or create your own. Your client can sign without creating an account.",
            },
            {
              step: "5",
              title: "Invoice and get paid",
              description: "Create invoices from milestones. Clients pay via Stripe — funds go directly to your bank.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex gap-4 p-4 rounded-lg border border-border/50 bg-card/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-white text-sm font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link
            href="/docs/quick-start"
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
          >
            Read the full Quick Start guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Popular topics */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Popular Topics</h2>
        
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Connect Stripe for payments", href: "/docs/stripe-setup" as Route },
            { title: "Create contract templates", href: "/docs/contracts/templates" as Route },
            { title: "Set up partial payments", href: "/docs/invoices/partial-payments" as Route },
            { title: "Understand time tracking integrity", href: "/docs/time-tracking/integrity" as Route },
            { title: "Share project portal with clients", href: "/docs/projects/portal" as Route },
            { title: "Configure email notifications", href: "/docs/settings/notifications" as Route },
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
      </div>

      {/* Help section */}
      <div className="not-prose rounded-xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Need help?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Can't find what you're looking for? Check out our{" "}
              <Link href="/docs/faq" className="text-primary hover:underline">FAQ</Link>
              {" "}or{" "}
              <Link href="/docs/support" className="text-primary hover:underline">contact support</Link>.
            </p>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
}