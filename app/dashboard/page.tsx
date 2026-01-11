"use client";

import { Header } from "@/components/dashboard/header";
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonCard, SkeletonListItem } from "@/components/dashboard/skeleton";
import { AnimatedNumber, AnimatedCurrency } from "@/components/dashboard/animated-number";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { FolderKanban, Users, FileText, TrendingUp, Plus, ArrowRight, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: recentProjects, isLoading: projectsLoading } = trpc.dashboard.recentProjects.useQuery();
  const { data: pendingInvoices, isLoading: invoicesLoading } = trpc.dashboard.pendingInvoices.useQuery();

  return (
    <>
      <Header
        title="Dashboard"
        description="Welcome back! Here's your overview."
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

      <div className="flex-1 overflow-auto p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <Card className="group bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 transition-transform group-hover:scale-110">
                      <FolderKanban className="h-5 w-5 text-blue-400" />
                    </div>
                    {stats?.projectGrowth !== 0 && (
                      <Badge 
                        variant={stats?.projectGrowth && stats.projectGrowth > 0 ? "success" : "destructive"} 
                        className="text-xs"
                      >
                        {stats?.projectGrowth && stats.projectGrowth > 0 ? (
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                        )}
                        {Math.abs(stats?.projectGrowth ?? 0)}%
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">
                      <AnimatedNumber value={stats?.activeProjects ?? 0} />
                    </p>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 transition-transform group-hover:scale-110">
                      <Users className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">
                      <AnimatedNumber value={stats?.totalClients ?? 0} />
                    </p>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 transition-transform group-hover:scale-110">
                      <FileText className="h-5 w-5 text-orange-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {stats?.outstandingInvoices.count ?? 0} pending
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">
                      <AnimatedCurrency value={stats?.outstandingInvoices.total ?? 0} />
                    </p>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-green-500/5 hover:-translate-y-0.5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 transition-transform group-hover:scale-110">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    </div>
                    {stats?.revenueGrowth !== 0 && (
                      <Badge 
                        variant={stats?.revenueGrowth && stats.revenueGrowth > 0 ? "success" : "destructive"} 
                        className="text-xs"
                      >
                        {stats?.revenueGrowth && stats.revenueGrowth > 0 ? (
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                        )}
                        {Math.abs(stats?.revenueGrowth ?? 0)}%
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">
                      <AnimatedCurrency value={stats?.paidThisMonth ?? 0} />
                    </p>
                    <p className="text-sm text-muted-foreground">Paid This Month</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Recent Projects & Pending Invoices */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Recent Projects</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/dashboard/projects">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-3">
                  <SkeletonListItem />
                  <SkeletonListItem />
                  <SkeletonListItem />
                </div>
              ) : recentProjects?.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <FolderKanban className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">No projects yet</p>
                  <Button variant="link" size="sm" asChild className="mt-2">
                    <Link href="/dashboard/projects/new">Create your first project</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProjects?.map((project, index) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all duration-200 hover:bg-secondary/50 hover:border-border hover:shadow-sm active:scale-[0.99]"
                      style={{ animationDelay: `${index * 50}ms` }}
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
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/dashboard/invoices">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-3">
                  <SkeletonListItem />
                  <SkeletonListItem />
                  <SkeletonListItem />
                </div>
              ) : pendingInvoices?.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">No pending invoices</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All caught up! 🎉
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingInvoices?.map((invoice, index) => {
                    const isOverdue = new Date(invoice.dueDate) < new Date();
                    return (
                      <Link
                        key={invoice.id}
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all duration-200 hover:bg-secondary/50 hover:border-border hover:shadow-sm active:scale-[0.99]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium font-mono text-sm">
                              {invoice.invoiceNumber}
                            </p>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {invoice.client.name}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col items-end gap-1">
                          <p className="font-semibold text-green-500">
                            {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                          </p>
                          <span className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                            {isOverdue ? "Was due" : "Due"} {formatDate(invoice.dueDate)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Press{" "}
            <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">
              ⌘ K
            </kbd>{" "}
            to search or navigate quickly
          </p>
        </div>
      </div>
    </>
  );
}