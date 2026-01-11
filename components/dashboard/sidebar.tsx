"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, FileText, Settings, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Templates", href: "/dashboard/templates", icon: FileCode },
] as const;

const secondaryNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/50 bg-card/50 backdrop-blur-md">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <FolderKanban className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">DevPortal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-1">
          <div className="my-3 h-px bg-border/50" />
          {secondaryNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 p-3">
        <div className="rounded-lg bg-secondary/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Free Trial</p>
          <p className="mt-1 text-xs text-muted-foreground">12 days remaining</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-border">
            <div className="h-full w-[60%] rounded-full gradient-primary" />
          </div>
        </div>
      </div>
    </aside>
  );
}