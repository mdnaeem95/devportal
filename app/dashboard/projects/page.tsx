"use client";

import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Plus, FolderKanban, ArrowUpRight, Calendar, DollarSign } from "lucide-react";

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  active: { label: "Active", variant: "success" as const },
  on_hold: { label: "On Hold", variant: "warning" as const },
  completed: { label: "Completed", variant: "default" as const },
  cancelled: { label: "Cancelled", variant: "destructive" as const },
};

export default function ProjectsPage() {
  const { data: projects, isLoading } = trpc.project.list.useQuery();

  const activeCount = projects?.filter((p) => p.status === "active").length ?? 0;

  return (
    <>
      <Header
        title="Projects"
        description={`${activeCount} active, ${projects?.length ?? 0} total`}
        action={
          <Button className="gradient-primary border-0" asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card/50 animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-5 w-32 rounded bg-secondary" />
                    <div className="h-4 w-24 rounded bg-secondary" />
                    <div className="h-4 w-full rounded bg-secondary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">No projects yet</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                Create your first project to start managing clients, contracts, and invoices.
              </p>
              <Button className="mt-6 gradient-primary border-0" asChild>
                <Link href="/projects/new">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => {
              const status = statusConfig[project.status];
              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:border-border group h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{project.name}</h3>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
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
                          <span>
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
    </>
  );
}