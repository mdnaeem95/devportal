import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  FileText,
  CreditCard,
  Package,
  ArrowRight,
  Check,
  Terminal,
  GitBranch,
  Zap,
  Shield,
  Github,
  Twitter,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Gradient glow effect at top */}
      <div className="gradient-glow fixed inset-x-0 top-0 h-125 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <FolderKanban className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Zoho</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={{ pathname: "/sign-in" }}>Sign In</Link>
            </Button>
            <Button size="sm" className="gradient-primary border-0" asChild>
              <Link href={{ pathname: "/sign-up" }}>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-20">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            <span className="text-muted-foreground">Now in public beta</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            The professional backend for{" "}
            <span className="gradient-text">freelance developers</span>
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Stop juggling Google Docs, Stripe, and GitHub. Contracts, invoicing, 
            and deliverables in one place — designed for developers who work with direct clients.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" className="gradient-primary border-0 h-12 px-8 text-base" asChild>
              <Link href={{ pathname: "/sign-up" }}>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent" asChild>
              <Link href="#features">
                <Terminal className="mr-2 h-4 w-4" />
                See how it works
              </Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Terminal mockup */}
        <div className="mt-20 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="terminal mx-auto max-w-4xl">
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-yellow" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="ml-4 text-sm text-muted-foreground">zoho — dashboard</span>
            </div>
            <div className="p-6 font-mono text-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-success">✓</span>
                  <span className="text-muted-foreground">Contract signed by</span>
                  <span className="text-foreground">Acme Corp</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-accent">$12,500</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-success">✓</span>
                  <span className="text-muted-foreground">Invoice INV-0042 paid</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-accent">$4,200</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-warning">○</span>
                  <span className="text-muted-foreground">Milestone "API Integration" due in</span>
                  <span className="text-foreground">3 days</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary">→</span>
                  <span className="text-muted-foreground">Files delivered to</span>
                  <span className="text-foreground">TechStartup Inc</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-accent">v2.1.0</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-success">$</span>
                  <span>Outstanding:</span>
                  <span className="text-foreground font-semibold">$8,300</span>
                  <span className="text-muted-foreground mx-2">|</span>
                  <span>This month:</span>
                  <span className="text-success font-semibold">$16,700</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 border-t border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need, nothing you don't
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built by developers who got tired of duct-taping tools together.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger-children">
            {[
              {
                icon: FolderKanban,
                title: "Projects",
                description: "Milestones, timelines, and progress tracking. Share live status pages with clients.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: FileText,
                title: "Contracts",
                description: "Dev-specific templates with IP, code ownership, and scope protection built in.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: CreditCard,
                title: "Invoicing",
                description: "Generate from milestones. Stripe payments. Automatic reminders that actually work.",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: Package,
                title: "Deliverables",
                description: "Versioned file uploads. GitHub integration. Know when clients download.",
                gradient: "from-green-500 to-emerald-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-border hover:bg-card"
              >
                <div className={`inline-flex rounded-lg bg-linear-to-br ${feature.gradient} p-3`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Secondary features */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: GitBranch,
                title: "GitHub Integration",
                description: "Link repos directly. Show latest commits and releases on client pages.",
              },
              {
                icon: Zap,
                title: "Instant Setup",
                description: "New project in under 5 minutes. Sensible defaults, no configuration hell.",
              },
              {
                icon: Shield,
                title: "No Client Logins",
                description: "Shareable links for everything. Your clients never need to create accounts.",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One price, all features. No per-seat nonsense.
            </p>
          </div>

          <div className="mt-16 grid gap-8 mx-auto max-w-4xl md:grid-cols-2">
            {/* Solo */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <h3 className="text-lg font-semibold">Solo</h3>
              <p className="mt-1 text-sm text-muted-foreground">For independent freelancers</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  "Unlimited projects",
                  "Unlimited clients", 
                  "Contract templates",
                  "Invoicing & payments",
                  "File delivery",
                  "Email support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full" variant="outline" asChild>
                <Link href={{ pathname: "/sign-up" }}>Start Free Trial</Link>
              </Button>
            </div>

            {/* Pro */}
            <div className="relative rounded-xl border-2 border-primary/50 bg-card p-8">
              <div className="absolute -top-3 left-6">
                <span className="rounded-full gradient-primary px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </span>
              </div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-1 text-sm text-muted-foreground">For growing freelancers</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold">$39</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  "Everything in Solo",
                  "Custom branding",
                  "Priority support",
                  "Advanced analytics",
                  "API access",
                  "Remove Zoho branding",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full gradient-primary border-0" asChild>
                <Link href={{ pathname: "/sign-up" }}>Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-border/50 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to professionalize your freelance business?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join developers who've moved past spreadsheets and scattered tools.
          </p>
          <Button size="lg" className="mt-8 gradient-primary border-0 h-12 px-8" asChild>
            <Link href={{ pathname: "/sign-up" }}>
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <FolderKanban className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Zoho</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Docs</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zoho. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}