"use client";

import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, FolderKanban, MoreHorizontal } from "lucide-react";

const statusColors: Record<string, "default" | "success" | "secondary" | "warning" | "destructive"> = {
  draft: "secondary",
  active: "success",
  on_hold: "warning",
  completed: "default",
  cancelled: "destructive",
};

export default function ProjectsPage() {
  const { data: projects, isLoading } = trpc.project.list.useQuery();

  return (
    <>
      <Header
        title="Projects"
        description="Manage your client projects"
        action={
          <Button asChild>
            <Link href="/dashboard/projects/new">
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
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 w-32 rounded bg-muted" />
                  <div className="h-4 w-24 rounded bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <Card className="mx-auto max-w-md">
            <CardContent className="flex flex-col items-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Create your first project to start managing clients, contracts,
                and invoices.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/dashboard/projects/new">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
              >
                <Card className="transition-colors hover:bg-secondary/50">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base">
                        {project.name}
                      </CardTitle>
                      <CardDescription>{project.client.name}</CardDescription>
                    </div>
                    <Badge variant={statusColors[project.status]}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {project.totalAmount
                          ? formatCurrency(project.totalAmount)
                          : "No budget set"}
                      </span>
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
