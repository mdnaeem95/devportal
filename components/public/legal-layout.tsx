import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderKanban, Github, Twitter } from "lucide-react";
import { Route } from "next";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  lastUpdated: string;
}

export function LegalLayout({ children, title, description, lastUpdated }: LegalLayoutProps) {
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
            <span className="text-lg font-semibold tracking-tight">Zovo</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={"/sign-in" as Route}>Sign In</Link>
            </Button>
            <Button size="sm" className="gradient-primary border-0" asChild>
              <Link href={"/sign-up" as Route}>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        {/* Legal Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:leading-relaxed [&_ul]:space-y-2 [&_li]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary/80">
            {children}
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <FolderKanban className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Zovo</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/public/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/public/terms" className="hover:text-foreground transition-colors">Terms</Link>
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
            © {new Date().getFullYear()} Zovo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}