import Link from "next/link";
import { FolderKanban, Github, Twitter, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocsSidebar, MobileDocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsSearch } from "@/components/docs/docs-search";
import { getAdjacentPages, findCurrentDoc } from "@/lib/docs/docs-navigation";
import { Route } from "next";

interface DocsLayoutProps {
  children: React.ReactNode;
  pathname: string;
}

export function DocsLayout({ children, pathname }: DocsLayoutProps) {
  const { prev, next } = getAdjacentPages(pathname);
  const currentDoc = findCurrentDoc(pathname);

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient glow effect at top */}
      <div className="gradient-glow fixed inset-x-0 top-0 h-125 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <FolderKanban className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Zovo</span>
            </Link>
            
            <span className="hidden sm:block text-border">/</span>
            
            <Link 
              href="/docs" 
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <DocsSearch />

            <MobileDocsSidebar />

            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href={"/sign-in" as Route}>Sign In</Link>
            </Button>
            <Button size="sm" className="gradient-primary border-0" asChild>
              <Link href={"/sign-up" as Route}>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] flex">
        {/* Sidebar - hidden on mobile */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border/50">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-6">
            <DocsSidebar />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="px-6 py-10 lg:px-12 lg:py-12 max-w-4xl">
            {/* Breadcrumb */}
            {currentDoc && (
              <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/docs" className="hover:text-foreground transition-colors">
                  Docs
                </Link>
                <span>/</span>
                <span>{currentDoc.section.title}</span>
                <span>/</span>
                <span className="text-foreground">{currentDoc.page.title}</span>
              </div>
            )}

            {/* Page content */}
            <article className="prose prose-neutral dark:prose-invert max-w-none">
              {children}
            </article>

            {/* Previous / Next navigation */}
            <nav className="mt-16 flex items-center justify-between border-t border-border pt-6">
              {prev ? (
                <Link
                  href={prev.href as Route}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Previous</div>
                    <div className="font-medium text-foreground">{prev.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              
              {next ? (
                <Link
                  href={next.href as Route}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div>
                    <div className="text-xs text-muted-foreground">Next</div>
                    <div className="font-medium text-foreground">{next.title}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </div>
        </main>

        {/* Table of contents sidebar - optional, for longer pages */}
        <aside className="hidden xl:block w-56 shrink-0">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-6">
            {/* On this page navigation can be added here */}
            <div className="text-sm">
              <p className="font-medium mb-4">On this page</p>
              <div id="toc-placeholder" className="space-y-2 text-muted-foreground">
                {/* TOC items will be populated by a client component or manually */}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-20">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
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
              <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            </div>

            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
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