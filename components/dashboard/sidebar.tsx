"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, Users, CreditCard, FileText, FileCode, Settings, HelpCircle, Sparkles } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Contracts", href: "/dashboard/contracts", icon: FileText },
  { name: "Invoices", href: "/dashboard/invoices", icon: CreditCard },
  { name: "Templates", href: "/dashboard/templates", icon: FileCode },
] as const;

const secondaryNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "#", icon: HelpCircle },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/50 bg-card/30 backdrop-blur-md">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border/50 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold gradient-text">DevPortal</span>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t border-border/50 px-3 py-4">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Trial Banner */}
      <div className="border-t border-border/50 p-4">
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-3">
          <p className="text-sm font-medium">Free Trial</p>
          <p className="text-xs text-muted-foreground">12 days remaining</p>
          <div className="mt-2 h-1.5 rounded-full bg-secondary">
            <div className="h-full w-3/5 rounded-full gradient-primary" />
          </div>
          <Link
            href="/dashboard/settings"
            className="mt-3 block text-center text-xs font-medium text-primary hover:underline"
          >
            Upgrade to Pro →
          </Link>
        </div>
      </div>
    </aside>
  );
}