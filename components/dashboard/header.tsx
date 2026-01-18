"use client";

import { UserButton } from "@clerk/nextjs";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimerWidget } from "./timer-widget";
import { NotificationsPopover } from "./notifications-popover";
import { MobileSidebarTrigger } from "./sidebar";
import Link from "next/link";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  onSearchClick?: () => void;
}

export function Header({ title, description, action, onSearchClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/50 px-4 sm:px-6 backdrop-blur-md gap-4">
      {/* Left side - Mobile menu + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Menu Trigger */}
        <MobileSidebarTrigger />
        
        {/* Mobile Logo - only on small screens when title is hidden */}
        <Link href="/dashboard" className="flex sm:hidden items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary shadow-lg shadow-primary/25">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
        </Link>

        {/* Page Title - hidden on very small screens */}
        <div className="hidden sm:block min-w-0">
          <h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Button - triggers command palette */}
        <Button
          variant="outline"
          className="hidden md:flex h-9 w-64 justify-between bg-secondary/50 border-border/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
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

        {/* Timer Widget - hidden on very small screens */}
        <div className="hidden sm:block">
          <TimerWidget />
        </div>

        {action}

        {/* Notifications Popover */}
        <NotificationsPopover />

        <div className="hidden sm:block ml-1 h-8 w-px bg-border/50" />

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