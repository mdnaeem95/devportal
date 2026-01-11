"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  onSearchClick?: () => void;
}

export function Header({ title, description, action, onSearchClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/50 px-6 backdrop-blur-md">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search Button - triggers command palette */}
        <Button
          variant="outline"
          className="hidden h-9 w-64 justify-between bg-secondary/50 border-border/50 text-muted-foreground hover:bg-secondary hover:text-foreground md:flex"
          onClick={onSearchClick}
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search...
          </span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-secondary px-1.5 font-mono text-[10px] font-medium sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onSearchClick}
        >
          <Search className="h-4 w-4" />
        </Button>

        {action}

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </Button>

        <div className="ml-1 h-8 w-px bg-border/50" />

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 transition-transform hover:scale-105",
            },
          }}
        />
      </div>
    </header>
  );
}