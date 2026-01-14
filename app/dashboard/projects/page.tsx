"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { trpc } from "@/lib/trpc";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Plus, FolderKanban, ArrowUpRight, CheckCircle2, Clock, Pause,
  XCircle, FileEdit, AlertTriangle, TrendingUp, Users, DollarSign
} from "lucide-react";

type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "cancelled";

const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ElementType; color: string; bg: string }
> = {
  draft: { label: "Draft", variant: "secondary", icon: FileEdit, color: "text-muted-foreground", bg: "bg-secondary" },
  active: { label: "Active", variant: "default", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/20" },
  on_hold: { label: "On Hold", variant: "secondary", icon: Pause, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  completed: { label: "Completed", variant: "default", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/20" },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle, color: "text-red-400", bg: "bg-red-500/20" },
};

const filterTabs: { id: ProjectStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "draft", label: "Draft" },
  { id: "on_hold", label: "On Hold" },
];

function ProjectsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Tabs Skeleton */}
      <Skeleton className="h-10 w-80" />
      {/* Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-5">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-2 w-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | "all">("all");

  const { data: projects, isLoading } = trpc.project.list.useQuery(
    activeFilter === "all" ? undefined : { status: activeFilter }
  );

  // Calculate stats
  const activeCount = projects?.filter((p) => p.status === "active").length ?? 0;
  const completedCount = projects?.filter((p) => p.status === "completed").length ?? 0;
  const totalValue = projects?.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0) ?? 0;
  const overdueCount = projects?.filter((p) => p.hasOverdue).length ?? 0;

  // Get counts for filter tabs
  const getFilterCount = (status: ProjectStatus | "all") => {
    if (!projects) return 0;
    if (status === "all") return projects.length;
    return projects.filter((p) => p.status === status).length;
  };

  return (
    <>
      <Header
        title="Projects"
        description="Manage your client projects"
        onSearchClick={() => setCommandOpen(true)}
        action={
          <Button className="cursor-pointer gradient-primary border-0 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5" asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        }
      />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {isLoading ? (
            <ProjectsSkeleton />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "0ms" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Active</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                      <AnimatedNumber value={activeCount} />
                    </p>
                    <p className="text-xs text-muted-foreground">projects in progress</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "50ms" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                      <AnimatedNumber value={completedCount} />
                    </p>
                    <p className="text-xs text-muted-foreground">projects delivered</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/10 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "100ms" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                        <DollarSign className="h-4 w-4 text-green-400" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-400">
                      <AnimatedNumber value={totalValue / 100} formatFn={(v) => `$${v.toLocaleString()}`} />
                    </p>
                    <p className="text-xs text-muted-foreground">across all projects</p>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300",
                  overdueCount > 0 && "border-red-500/30 hover:shadow-red-500/10"
                )} style={{ animationDelay: "150ms" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Overdue</p>
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        overdueCount > 0 ? "bg-red-500/20" : "bg-secondary"
                      )}>
                        <AlertTriangle className={cn(
                          "h-4 w-4",
                          overdueCount > 0 ? "text-red-400" : "text-muted-foreground"
                        )} />
                      </div>
                    </div>
                    <p className={cn(
                      "mt-2 text-2xl font-bold",
                      overdueCount > 0 && "text-red-400"
                    )}>
                      <AnimatedNumber value={overdueCount} />
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {overdueCount > 0 ? "need attention" : "all on track"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 border-b border-border/50">
                {filterTabs.map((tab) => {
                  const count = getFilterCount(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative",
                        activeFilter === tab.id
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs",
                            activeFilter === tab.id
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {count}
                        </span>
                      )}
                      {activeFilter === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Project Cards */}
              {!projects || projects.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center py-16">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                      <FolderKanban className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold">No projects yet</h3>
                    <p className="mt-2 text-center text-muted-foreground max-w-sm">
                      Create your first project to start tracking milestones, deliverables, and invoices.
                    </p>
                    <Button className="mt-6 cursor-pointer gradient-primary border-0 transition-all hover:shadow-lg hover:shadow-primary/25" asChild>
                      <Link href="/dashboard/projects/new">
                        <Plus className="h-4 w-4" />
                        Create Project
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project, index) => {
                    const status = statusConfig[project.status];
                    const StatusIcon = status.icon;
                    const progress = project.progress ?? 0;
                    const hasOverdue = project.hasOverdue;

                    return (
                      <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className={cn(
                          "group block rounded-xl border bg-card/50 backdrop-blur-sm p-5 transition-all hover:bg-card hover:-translate-y-1 hover:shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300",
                          hasOverdue ? "border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/10" : "border-border/50 hover:border-border"
                        )}
                        style={{ animationDelay: `${index * 30}ms`, animationFillMode: "backwards" }}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {project.name}
                              </h3>
                              {hasOverdue && (
                                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {project.client.name}
                            </p>
                          </div>
                          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-transform group-hover:scale-110", status.bg)}>
                            <StatusIcon className={cn("h-4 w-4", status.color)} />
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">
                              Progress
                            </span>
                            <span className="text-xs font-medium">
                              {project.completedMilestones}/{project.totalMilestones} milestones
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500 ease-out",
                                progress === 100
                                  ? "bg-green-500"
                                  : hasOverdue
                                  ? "bg-linear-to-r from-red-500 to-orange-500"
                                  : "gradient-primary"
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <Badge variant={status.variant} className="text-xs">
                              {status.label}
                            </Badge>
                            {hasOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {project.totalAmount ? (
                              <span className="text-sm font-semibold text-green-400">
                                {formatCurrency(project.totalAmount)}
                              </span>
                            ) : null}
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}