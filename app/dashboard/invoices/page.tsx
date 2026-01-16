"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { AnimatedNumber, AnimatedCurrency } from "@/components/dashboard/animated-number";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Plus, FileText, ArrowUpRight, CheckCircle2, AlertCircle, Send, Eye, XCircle, TrendingUp,
  Clock, DollarSign, SplitSquareHorizontal } from "lucide-react";

type StatusFilter = "all" | "draft" | "pending" | "partially_paid" | "paid" | "overdue";

const statusConfig = {
  draft: {
    label: "Draft",
    variant: "secondary" as const,
    icon: FileText,
    color: "text-muted-foreground",
  },
  sent: {
    label: "Sent",
    variant: "default" as const,
    icon: Send,
    color: "text-blue-400",
  },
  viewed: {
    label: "Viewed",
    variant: "default" as const,
    icon: Eye,
    color: "text-purple-400",
  },
  partially_paid: {
    label: "Partial",
    variant: "warning" as const,
    icon: SplitSquareHorizontal,
    color: "text-yellow-500",
  },
  paid: {
    label: "Paid",
    variant: "success" as const,
    icon: CheckCircle2,
    color: "text-green-400",
  },
  overdue: {
    label: "Overdue",
    variant: "destructive" as const,
    icon: AlertCircle,
    color: "text-red-400",
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary" as const,
    icon: XCircle,
    color: "text-muted-foreground",
  },
};

const filterTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

function InvoiceCardSkeleton() {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  );
}

export default function InvoicesPage() {
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: invoices, isLoading } = trpc.invoice.list.useQuery();

  // Calculate stats
  const stats = {
    draft: invoices?.filter((i) => i.status === "draft").length ?? 0,
    pending: invoices?.filter((i) => ["sent", "viewed"].includes(i.status)).length ?? 0,
    partiallyPaid: invoices?.filter((i) => i.status === "partially_paid").length ?? 0,
    paid: invoices?.filter((i) => i.status === "paid").length ?? 0,
    overdue: invoices?.filter((i) => {
      if (i.status === "paid" || i.status === "cancelled" || i.status === "partially_paid") return false;
      return new Date(i.dueDate) < new Date();
    }).length ?? 0,
    totalOutstanding:
      invoices
        ?.filter((i) => ["sent", "viewed", "partially_paid"].includes(i.status) || 
          (i.status !== "paid" && i.status !== "cancelled" && new Date(i.dueDate) < new Date()))
        .reduce((sum, i) => sum + i.total - (i.paidAmount ?? 0), 0) ?? 0,
    totalPaid:
      invoices
        ?.filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + i.total, 0) ?? 0,
    totalPartiallyPaid:
      invoices
        ?.filter((i) => i.status === "partially_paid")
        .reduce((sum, i) => sum + (i.paidAmount ?? 0), 0) ?? 0,
  };

  // Filter invoices
  const filteredInvoices = invoices?.filter((invoice) => {
    const isOverdue =
      invoice.status !== "paid" &&
      invoice.status !== "cancelled" &&
      invoice.status !== "partially_paid" &&
      new Date(invoice.dueDate) < new Date();

    switch (statusFilter) {
      case "draft":
        return invoice.status === "draft";
      case "pending":
        return ["sent", "viewed"].includes(invoice.status) && !isOverdue;
      case "partially_paid":
        return invoice.status === "partially_paid";
      case "paid":
        return invoice.status === "paid";
      case "overdue":
        return isOverdue;
      default:
        return true;
    }
  });

  return (
    <>
      <Header
        title="Invoices"
        description={`${stats.pending + stats.partiallyPaid} pending · ${formatCurrency(stats.totalOutstanding)} outstanding`}
        onSearchClick={() => setCommandOpen(true)}
        action={
          <Button
            className="gradient-primary border-0 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer"
            asChild
          >
            <Link href="/dashboard/invoices/new">
              <Plus className="h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        }
      />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <div className="flex-1 overflow-auto">
        {/* Quick Stats */}
        <div className="border-b border-border/50 bg-card/30 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Draft</p>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={stats.draft} />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <Clock className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold mt-1 text-blue-400">
                      <AnimatedNumber value={stats.pending} />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Partial</p>
                      <SplitSquareHorizontal className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold mt-1 text-yellow-500">
                      <AnimatedNumber value={stats.partiallyPaid} />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Collected</p>
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold mt-1 text-green-500">
                      <AnimatedCurrency value={stats.totalPaid + stats.totalPartiallyPaid} />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <DollarSign className="h-4 w-4 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold mt-1 text-orange-500">
                      <AnimatedCurrency value={stats.totalOutstanding} />
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-border/50 bg-card/30 px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {filterTabs.map((tab) => {
              let count = 0;
              switch (tab.value) {
                case "all":
                  count = invoices?.length ?? 0;
                  break;
                case "draft":
                  count = stats.draft;
                  break;
                case "pending":
                  count = stats.pending;
                  break;
                case "partially_paid":
                  count = stats.partiallyPaid;
                  break;
                case "paid":
                  count = stats.paid;
                  break;
                case "overdue":
                  count = stats.overdue;
                  break;
              }

              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
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
                        ? tab.value === "overdue"
                          ? "bg-destructive/20 text-destructive"
                          : tab.value === "partially_paid"
                            ? "bg-yellow-500/20 text-yellow-600"
                            : "bg-primary/20 text-primary"
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
            <div className="space-y-3">
              <InvoiceCardSkeleton />
              <InvoiceCardSkeleton />
              <InvoiceCardSkeleton />
              <InvoiceCardSkeleton />
            </div>
          ) : filteredInvoices?.length === 0 ? (
            <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  {statusFilter === "all" ? "No invoices yet" : `No ${statusFilter === "partially_paid" ? "partially paid" : statusFilter} invoices`}
                </h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  {statusFilter === "all"
                    ? "Create your first invoice to start getting paid for your work."
                    : `You don't have any ${statusFilter === "partially_paid" ? "partially paid" : statusFilter} invoices right now.`}
                </p>
                {statusFilter === "all" ? (
                  <Button className="mt-6 gradient-primary border-0 cursor-pointer" asChild>
                    <Link href="/dashboard/invoices/new">
                      <Plus className="h-4 w-4" />
                      Create Invoice
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="mt-6 cursor-pointer" onClick={() => setStatusFilter("all")}>
                    View All Invoices
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredInvoices?.map((invoice, index) => {
                const status = statusConfig[invoice.status as keyof typeof statusConfig];
                const StatusIcon = status?.icon || FileText;
                const isOverdue =
                  invoice.status !== "paid" &&
                  invoice.status !== "cancelled" &&
                  invoice.status !== "partially_paid" &&
                  new Date(invoice.dueDate) < new Date();
                const isPartiallyPaid = invoice.status === "partially_paid";
                const paidAmount = invoice.paidAmount ?? 0;
                const remainingBalance = invoice.total - paidAmount;
                const paymentProgress = invoice.total > 0 ? (paidAmount / invoice.total) * 100 : 0;

                return (
                  <Link
                    key={invoice.id}
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="block"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <Card className={cn(
                      "bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:border-border hover:shadow-lg hover:-translate-y-0.5 group",
                      isPartiallyPaid && "border-yellow-500/30"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                              invoice.status === "paid"
                                ? "bg-green-500/20"
                                : isOverdue
                                ? "bg-red-500/20"
                                : isPartiallyPaid
                                ? "bg-yellow-500/20"
                                : "bg-secondary"
                            )}
                          >
                            <StatusIcon
                              className={cn("h-5 w-5", isOverdue ? "text-red-400" : status?.color)}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold group-hover:text-primary transition-colors">
                                {invoice.invoiceNumber}
                              </span>
                              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="truncate">{invoice.client.name}</span>
                              {invoice.project && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{invoice.project.name}</span>
                                </>
                              )}
                            </div>
                            {/* Progress bar for partially paid */}
                            {isPartiallyPaid && (
                              <div className="mt-2 flex items-center gap-2">
                                <Progress value={paymentProgress} className="h-1.5 flex-1" />
                                <span className="text-xs text-yellow-500 font-medium">
                                  {Math.round(paymentProgress)}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Amount & Status */}
                          <div className="text-right shrink-0">
                            <p
                              className={cn(
                                "font-semibold text-lg",
                                invoice.status === "paid" 
                                  ? "text-green-500" 
                                  : isPartiallyPaid 
                                    ? "text-yellow-500"
                                    : "text-foreground"
                              )}
                            >
                              {isPartiallyPaid 
                                ? formatCurrency(remainingBalance, invoice.currency ?? "USD")
                                : formatCurrency(invoice.total, invoice.currency ?? "USD")
                              }
                            </p>
                            {isPartiallyPaid && (
                              <p className="text-xs text-muted-foreground">
                                of {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                              </p>
                            )}
                            <div className="flex items-center justify-end gap-2 mt-1">
                              {isOverdue ? (
                                <Badge variant="destructive">Overdue</Badge>
                              ) : (
                                <Badge variant={status?.variant || "secondary"}>
                                  {status?.label || invoice.status}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {invoice.status === "paid"
                                  ? `Paid ${formatDate(invoice.paidAt)}`
                                  : `Due ${formatDate(invoice.dueDate)}`}
                              </span>
                            </div>
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