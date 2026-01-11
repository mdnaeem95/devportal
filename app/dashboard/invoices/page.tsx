"use client";

import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Plus, FileText, ArrowUpRight, CheckCircle2, AlertCircle, Send, Eye, XCircle } from "lucide-react";

const statusConfig = {
  draft: { 
    label: "Draft", 
    variant: "secondary" as const, 
    icon: FileText,
    color: "text-muted-foreground" 
  },
  sent: { 
    label: "Sent", 
    variant: "default" as const, 
    icon: Send,
    color: "text-blue-400" 
  },
  viewed: { 
    label: "Viewed", 
    variant: "default" as const, 
    icon: Eye,
    color: "text-purple-400" 
  },
  paid: { 
    label: "Paid", 
    variant: "success" as const, 
    icon: CheckCircle2,
    color: "text-green-400" 
  },
  overdue: { 
    label: "Overdue", 
    variant: "destructive" as const, 
    icon: AlertCircle,
    color: "text-red-400" 
  },
  cancelled: { 
    label: "Cancelled", 
    variant: "secondary" as const, 
    icon: XCircle,
    color: "text-muted-foreground" 
  },
};

export default function InvoicesPage() {
  const { data: invoices, isLoading } = trpc.invoice.list.useQuery();

  const stats = {
    draft: invoices?.filter((i) => i.status === "draft").length ?? 0,
    pending: invoices?.filter((i) => ["sent", "viewed"].includes(i.status)).length ?? 0,
    paid: invoices?.filter((i) => i.status === "paid").length ?? 0,
    totalOutstanding: invoices
      ?.filter((i) => ["sent", "viewed", "overdue"].includes(i.status))
      .reduce((sum, i) => sum + i.total, 0) ?? 0,
  };

  return (
    <>
      <Header
        title="Invoices"
        description={`${stats.pending} pending, ${stats.paid} paid`}
        action={
          <Button className="gradient-primary border-0" asChild>
            <Link href="/dashboard/invoices/new">
              <Plus className="h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Quick Stats */}
        <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold">{stats.draft}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold text-success">{stats.paid}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-warning">
                {formatCurrency(stats.totalOutstanding)}
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card/50 animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 rounded bg-secondary" />
                      <div className="h-3 w-32 rounded bg-secondary" />
                    </div>
                    <div className="h-6 w-16 rounded bg-secondary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : invoices?.length === 0 ? (
          <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">No invoices yet</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                Create your first invoice to start getting paid for your work.
              </p>
              <Button className="mt-6 gradient-primary border-0" asChild>
                <Link href="/dashboard/invoices/new">
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {invoices?.map((invoice) => {
              const status = statusConfig[invoice.status];
              const StatusIcon = status.icon;
              const isOverdue = 
                invoice.status !== "paid" && 
                invoice.status !== "cancelled" && 
                new Date(invoice.dueDate) < new Date();
              
              return (
                <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
                  <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:border-border group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          invoice.status === "paid" ? "bg-green-500/20" : "bg-secondary"
                        )}>
                          <StatusIcon className={cn("h-5 w-5", status.color)} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold">
                              {invoice.invoiceNumber}
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
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
                        </div>

                        {/* Amount & Status */}
                        <div className="text-right shrink-0">
                          <p className={cn(
                            "font-semibold",
                            invoice.status === "paid" ? "text-success" : "text-foreground"
                          )}>
                            {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                          </p>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            {isOverdue && invoice.status !== "paid" ? (
                              <Badge variant="destructive">Overdue</Badge>
                            ) : (
                              <Badge variant={status.variant}>{status.label}</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {invoice.status === "paid" 
                                ? `Paid ${formatDate(invoice.paidAt)}`
                                : `Due ${formatDate(invoice.dueDate)}`
                              }
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
    </>
  );
}