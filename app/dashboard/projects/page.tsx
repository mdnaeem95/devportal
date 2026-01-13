"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Plus, FolderKanban, ArrowUpRight, Calendar, DollarSign } from "lucide-react";

type StatusFilter = "all" | "active" | "completed" | "draft" | "on_hold";

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  active: { label: "Active", variant: "success" as const },
  on_hold: { label: "On Hold", variant: "warning" as const },
  completed: { label: "Completed", variant: "default" as const },
  cancelled: { label: "Cancelled", variant: "destructive" as const },
};

const filterTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];

function ProjectCardSkeleton() {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-2/3" />
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectsPage() {
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: projects, isLoading } = trpc.project.list.useQuery();

  // Filter projects
  const filteredProjects = projects?.filter((p) => {
    if (statusFilter === "all") return true;
    return p.status === statusFilter;
  });

  // Stats
  const stats = {
    total: projects?.length ?? 0,
    active: projects?.filter((p) => p.status === "active").length ?? 0,
    totalValue: projects?.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0) ?? 0,
  };

  return (
    <>
      <Header
        title="Projects"
        description={`${stats.active} active · ${formatCurrency(stats.totalValue)} total value`}
        onSearchClick={() => setCommandOpen(true)}
        action={
          <Button className="gradient-primary border-0 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5" asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        }
      />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <div className="flex-1 overflow-auto">
        {/* Filter Tabs */}
        <div className="border-b border-border/50 bg-card/30 px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {filterTabs.map((tab) => {
              const count = tab.value === "all" 
                ? stats.total 
                : projects?.filter((p) => p.status === tab.value).length ?? 0;
              
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
                    statusFilter === tab.value
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs",
                      statusFilter === tab.value
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                  {statusFilter === tab.value && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          ) : filteredProjects?.length === 0 ? (
            <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <FolderKanban className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  {statusFilter === "all" ? "No projects yet" : `No ${statusFilter.replace("_", " ")} projects`}
                </h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  {statusFilter === "all"
                    ? "Create your first project to start managing clients, contracts, and invoices."
                    : `You don't have any projects with "${statusFilter.replace("_", " ")}" status.`}
                </p>
                {statusFilter === "all" && (
                  <Button className="mt-6 gradient-primary border-0" asChild>
                    <Link href="/dashboard/projects/new">
                      <Plus className="h-4 w-4" />
                      Create Project
                    </Link>
                  </Button>
                )}
                {statusFilter !== "all" && (
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setStatusFilter("all")}
                  >
                    View All Projects
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects?.map((project, index) => {
                const status = statusConfig[project.status];
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:border-border hover:shadow-lg hover:-translate-y-1 h-full">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {project.name}
                              </h3>
                              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 shrink-0" />
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground truncate">
                              {project.client.name}
                            </p>
                          </div>
                          <Badge variant={status.variant} className="shrink-0">
                            {status.label}
                          </Badge>
                        </div>

                        {project.description && (
                          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        <div className="mt-auto pt-4 flex items-center justify-between text-sm border-t border-border/50">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span className={project.totalAmount ? "text-foreground font-medium" : ""}>
                              {project.totalAmount
                                ? formatCurrency(project.totalAmount)
                                : "No budget"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(project.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}