"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, Menu, X } from "lucide-react";
import { docsNavigation, type DocSection } from "@/lib/docs/docs-navigation";
import { Button } from "@/components/ui/button";
import { Route } from "next";

interface DocsSidebarProps {
  className?: string;
}

export function DocsSidebar({ className }: DocsSidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>(
    // Auto-open section containing current page
    docsNavigation
      .filter((section) => section.pages.some((page) => page.href === pathname))
      .map((section) => section.title)
  );

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  return (
    <nav className={cn("space-y-1", className)}>
      {docsNavigation.map((section) => (
        <SidebarSection
          key={section.title}
          section={section}
          isOpen={openSections.includes(section.title)}
          onToggle={() => toggleSection(section.title)}
          currentPath={pathname}
        />
      ))}
    </nav>
  );
}

interface SidebarSectionProps {
  section: DocSection;
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
}

function SidebarSection({ section, isOpen, onToggle, currentPath }: SidebarSectionProps) {
  const Icon = section.icon;
  const isActive = section.pages.some((page) => page.href === currentPath);

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "flex cursor-pointer w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{section.title}</span>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
      </button>
      
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
          {section.pages.map((page) => (
            <Link
              key={page.href}
              href={page.href as Route}
              className={cn(
                "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                currentPath === page.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {page.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Mobile sidebar with sheet-style overlay
export function MobileDocsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when navigating
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold">Documentation</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-65px)]" onClick={handleLinkClick}>
          <DocsSidebar />
        </div>
      </div>
    </>
  );
}