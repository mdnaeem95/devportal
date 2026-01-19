"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllDocPages } from "@/lib/docs/docs-navigation";
import { Route } from "next";

interface DocsSearchProps {
  className?: string;
}

export function DocsSearch({ className }: DocsSearchProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const allPages = React.useMemo(() => getAllDocPages(), []);

  const filteredPages = React.useMemo(() => {
    if (!query.trim()) return allPages.slice(0, 8);
    
    const lowerQuery = query.toLowerCase();
    return allPages
      .filter((page) => {
        const titleMatch = page.title.toLowerCase().includes(lowerQuery);
        const descMatch = page.description?.toLowerCase().includes(lowerQuery);
        const sectionMatch = page.section.toLowerCase().includes(lowerQuery);
        const hrefMatch = page.href.toLowerCase().includes(lowerQuery);
        return titleMatch || descMatch || sectionMatch || hrefMatch;
      })
      .slice(0, 10);
  }, [query, allPages]);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredPages]);

  // Keyboard shortcut to open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < filteredPages.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredPages[selectedIndex]) {
          router.push(filteredPages[selectedIndex].href as Route);
          setOpen(false);
        }
        break;
    }
  };

  // Scroll selected item into view
  React.useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleSelect = (href: string) => {
    router.push(href as Route);
    setOpen(false);
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "hidden md:flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-secondary/50 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
          className
        )}
      >
        <Search className="h-4 w-4" />
        <span>Search docs...</span>
        <kbd className="ml-2 rounded border border-border bg-background px-1.5 py-0.5 text-xs font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Mobile search button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Search modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          
          {/* Dialog */}
          <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 px-4">
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search documentation..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
                {filteredPages.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredPages.map((page, index) => (
                      <button
                        key={page.href}
                        data-index={index}
                        onClick={() => handleSelect(page.href)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          index === selectedIndex
                            ? "bg-primary/10 text-foreground"
                            : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {page.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {page.section} · {page.description}
                          </div>
                        </div>
                        {index === selectedIndex && (
                          <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer hints */}
              <div className="border-t border-border px-4 py-2.5 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">↑</kbd>
                  <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">↓</kbd>
                  <span className="ml-1">Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono">↵</kbd>
                  <span className="ml-1">Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono">ESC</kbd>
                  <span className="ml-1">Close</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}