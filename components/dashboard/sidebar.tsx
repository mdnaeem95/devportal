"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban, Users, CreditCard, FileText, FileCode,
  Settings, HelpCircle, Sparkles, ChevronRight } from "lucide-react";

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
      <div className="flex h-16 items-center gap-2.5 border-b border-border/50 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-lg shadow-primary/25">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold gradient-text">Zoho</span>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          const isExactDashboard = item.href === "/dashboard" && pathname === "/dashboard";
          const active = isExactDashboard || isActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active ? "scale-110" : "group-hover:scale-105"
                )}
              />
              <span className="flex-1">{item.name}</span>
              <ChevronRight 
                className={cn(
                  "h-4 w-4 opacity-0 -translate-x-2 transition-all duration-200",
                  active && "opacity-100 translate-x-0",
                  "group-hover:opacity-50 group-hover:translate-x-0"
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="border-t border-border/50 px-3 py-4">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  "group-hover:scale-105"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Trial Banner */}
      <div className="border-t border-border/50 p-4">
        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-linear-to-br from-secondary/50 to-secondary/30 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Free Trial</p>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                Pro
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">12 days remaining</p>
            
            {/* Progress bar */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div 
                className="h-full rounded-full gradient-primary transition-all duration-1000 ease-out"
                style={{ width: "60%" }}
              />
            </div>
            
            <Link
              href="/dashboard/settings?tab=billing"
              className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-primary/10 py-2 text-xs font-medium text-primary transition-all duration-200 hover:bg-primary/20"
            >
              Upgrade to Pro
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}