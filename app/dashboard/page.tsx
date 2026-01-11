"use client";

import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { FolderKanban, Users, FileText, TrendingUp, Plus, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.dashboard.stats.useQuery();
  const { data: recentProjects } = trpc.dashboard.recentProjects.useQuery();
  const { data: pendingInvoices } = trpc.dashboard.pendingInvoices.useQuery();

  return (
    <>
      <Header
        title="Dashboard"
        description="Welcome back! Here's your overview."
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
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <FolderKanban className="h-5 w-5 text-blue-400" />
                </div>
                <Badge variant="success" className="text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  12%
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">
                  {statsLoading ? "—" : stats?.activeProjects}
                </p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">
                  {statsLoading ? "—" : stats?.totalClients}
                </p>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                  <FileText className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {stats?.outstandingInvoices.count ?? 0} pending
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">
                  {statsLoading
                    ? "—"
                    : formatCurrency(stats?.outstandingInvoices.total ?? 0)}
                </p>
                <p className="text-sm text-muted-foreground">Outstanding</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <Badge variant="success" className="text-xs">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  23%
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">
                  {statsLoading
                    ? "—"
                    : formatCurrency(stats?.paidThisMonth ?? 0)}
                </p>
                <p className="text-sm text-muted-foreground">Paid This Month</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects & Pending Invoices */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Recent Projects</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link href="/projects">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentProjects?.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <FolderKanban className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">No projects yet</p>
                  <Button variant="link" size="sm" asChild className="mt-2">
                    <Link href="/projects/new">Create your first project</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProjects?.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:bg-secondary/50 hover:border-border"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{project.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.client.name}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            project.status === "active"
                              ? "success"
                              : project.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {project.status.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(project.updatedAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Invoices */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Pending Invoices</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link href="/dashboard/invoices">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingInvoices?.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">No pending invoices</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingInvoices?.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium font-mono text-sm">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {invoice.client.name}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-1">
                        <p className="font-semibold text-success">
                          {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          Due {formatDate(invoice.dueDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}