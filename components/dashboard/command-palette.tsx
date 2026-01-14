"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Search, FolderKanban, Users, CreditCard, Plus, Settings, ArrowRight, Loader2, LayoutDashboard } from "lucide-react";
import { Route } from "next";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ResultType = "project" | "client" | "invoice" | "action";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle?: string;
  href: Route;
  icon: React.ElementType;
}

const quickActions: SearchResult[] = [
  {
    id: "new-project",
    type: "action",
    title: "Create new project",
    href: "/dashboard/projects/new",
    icon: Plus,
  },
  {
    id: "new-client",
    type: "action",
    title: "Add new client",
    href: "/dashboard/clients/new",
    icon: Plus,
  },
  {
    id: "new-invoice",
    type: "action",
    title: "Create invoice",
    href: "/dashboard/invoices/new",
    icon: Plus,
  },
  {
    id: "dashboard",
    type: "action",
    title: "Go to Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "settings",
    type: "action",
    title: "Open Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Search queries - only run when query has content
  const { data: projects, isLoading: projectsLoading } = trpc.project.list.useQuery(
    undefined,
    { enabled: open && query.length > 0 }
  );
  const { data: clients, isLoading: clientsLoading } = trpc.clients.list.useQuery(
    undefined,
    { enabled: open && query.length > 0 }
  );
  const { data: invoices, isLoading: invoicesLoading } = trpc.invoice.list.useQuery(
    {},
    { enabled: open && query.length > 0 }
  );

  const isLoading = projectsLoading || clientsLoading || invoicesLoading;

  // Build search results
  const results = React.useMemo(() => {
    if (!query.trim()) {
      return quickActions;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Filter projects
    projects?.forEach((project) => {
      if (
        project.name.toLowerCase().includes(lowerQuery) ||
        project.client?.name?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: `project-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: project.client?.name,
          href: `/dashboard/projects/${project.id}` as Route,
          icon: FolderKanban,
        });
      }
    });

    // Filter clients
    clients?.forEach((client) => {
      if (
        client.name.toLowerCase().includes(lowerQuery) ||
        client.email?.toLowerCase().includes(lowerQuery) ||
        client.company?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: `client-${client.id}`,
          type: "client",
          title: client.name,
          subtitle: client.company || client.email,
          href: `/dashboard/clients/${client.id}` as Route,
          icon: Users,
        });
      }
    });

    // Filter invoices
    invoices?.forEach((invoice) => {
      if (
        invoice.invoiceNumber.toLowerCase().includes(lowerQuery) ||
        invoice.client?.name?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: `invoice-${invoice.id}`,
          type: "invoice",
          title: invoice.invoiceNumber,
          subtitle: invoice.client?.name,
          href: `/dashboard/invoices/${invoice.id}` as Route,
          icon: CreditCard,
        });
      }
    });

    // Also include matching quick actions
    quickActions.forEach((action) => {
      if (action.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push(action);
      }
    });

    return searchResults.slice(0, 10); // Limit results
  }, [query, projects, clients, invoices]);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Reset query when closed
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].href);
          onOpenChange(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    onOpenChange(false);
  };

  const typeLabels: Record<ResultType, string> = {
    project: "Project",
    client: "Client",
    invoice: "Invoice",
    action: "Action",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl sm:max-w-xl [&>button]:hidden">
        {/* Search Input */}
        <div className="flex items-center border-b border-border/50 px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, clients, invoices..."
            className="flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {!query && (
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Quick Actions
                </div>
              )}
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    selectedIndex === index
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md",
                      selectedIndex === index ? "bg-primary/20" : "bg-secondary"
                    )}
                  >
                    <result.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="font-medium">{result.title}</div>
                    {result.subtitle && (
                      <div className="truncate text-xs text-muted-foreground">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  {query && (
                    <span className="text-xs text-muted-foreground">
                      {typeLabels[result.type]}
                    </span>
                  )}
                  <ArrowRight
                    className={cn(
                      "h-4 w-4 transition-opacity",
                      selectedIndex === index ? "opacity-100" : "opacity-0"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 bg-secondary/30 px-4 py-2 text-xs text-muted-foreground">
          <div className="flex gap-2">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-secondary px-1.5 py-0.5">↑</kbd>
              <kbd className="rounded bg-secondary px-1.5 py-0.5">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-secondary px-1.5 py-0.5">↵</kbd>
              to select
            </span>
          </div>
          <span>
            <kbd className="rounded bg-secondary px-1.5 py-0.5">esc</kbd> to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage command palette state globally
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}