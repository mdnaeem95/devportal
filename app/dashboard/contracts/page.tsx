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
import { formatDate, cn } from "@/lib/utils";
import { Plus, FileText, ArrowUpRight, Send, Eye, CheckCircle2, XCircle, Clock, AlertTriangle, FileSignature, PenTool } from "lucide-react";

type StatusFilter = "all" | "draft" | "pending" | "signed" | "declined";

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
  signed: {
    label: "Signed",
    variant: "success" as const,
    icon: CheckCircle2,
    color: "text-green-400",
  },
  declined: {
    label: "Declined",
    variant: "destructive" as const,
    icon: XCircle,
    color: "text-red-400",
  },
  expired: {
    label: "Expired",
    variant: "secondary" as const,
    icon: AlertTriangle,
    color: "text-orange-400",
  },
};

const filterTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "signed", label: "Signed" },
  { value: "declined", label: "Declined" },
];

function ContractCardSkeleton() {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-16 ml-auto" />
            <Skeleton className="h-3 w-24 ml-auto" />
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
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-12" />
      </CardContent>
    </Card>
  );
}

export default function ContractsPage() {
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: contracts, isLoading } = trpc.contract.list.useQuery();

  // Calculate stats
  const stats = {
    draft: contracts?.filter((c) => c.status === "draft").length ?? 0,
    pending: contracts?.filter((c) => ["sent", "viewed"].includes(c.status)).length ?? 0,
    signed: contracts?.filter((c) => c.status === "signed").length ?? 0,
    declined: contracts?.filter((c) => c.status === "declined").length ?? 0,
  };

  // Filter contracts
  const filteredContracts = contracts?.filter((contract) => {
    switch (statusFilter) {
      case "draft":
        return contract.status === "draft";
      case "pending":
        return ["sent", "viewed"].includes(contract.status);
      case "signed":
        return contract.status === "signed";
      case "declined":
        return contract.status === "declined";
      default:
        return true;
    }
  });

  return (
    <>
      <Header
        title="Contracts"
        description={`${stats.pending} awaiting signature · ${stats.signed} signed`}
        onSearchClick={() => setCommandOpen(true)}
        action={
          <Button
            className="gradient-primary border-0 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            asChild
          >
            <Link href="/dashboard/contracts/new">
              <Plus className="h-4 w-4" />
              New Contract
            </Link>
          </Button>
        }
      />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <div className="flex-1 overflow-auto">
        {/* Quick Stats */}
        <div className="border-b border-border/50 bg-card/30 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <>
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
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Awaiting Signature</p>
                      <PenTool className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold mt-1 text-purple-400">
                      <AnimatedNumber value={stats.pending} />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Signed</p>
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold mt-1 text-green-500">
                      <AnimatedNumber value={stats.signed} />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Declined</p>
                      <XCircle className="h-4 w-4 text-red-400" />
                    </div>
                    <p className="text-2xl font-bold mt-1 text-red-500">
                      <AnimatedNumber value={stats.declined} />
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
                  count = contracts?.length ?? 0;
                  break;
                case "draft":
                  count = stats.draft;
                  break;
                case "pending":
                  count = stats.pending;
                  break;
                case "signed":
                  count = stats.signed;
                  break;
                case "declined":
                  count = stats.declined;
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
            <div className="space-y-3">
              <ContractCardSkeleton />
              <ContractCardSkeleton />
              <ContractCardSkeleton />
              <ContractCardSkeleton />
            </div>
          ) : filteredContracts?.length === 0 ? (
            <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <FileSignature className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  {statusFilter === "all" ? "No contracts yet" : `No ${statusFilter} contracts`}
                </h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  {statusFilter === "all"
                    ? "Create your first contract to protect your work with proper legal agreements."
                    : `You don't have any ${statusFilter} contracts right now.`}
                </p>
                {statusFilter === "all" ? (
                  <Button className="mt-6 gradient-primary border-0" asChild>
                    <Link href="/dashboard/contracts/new">
                      <Plus className="h-4 w-4" />
                      Create Contract
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="mt-6" onClick={() => setStatusFilter("all")}>
                    View All Contracts
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredContracts?.map((contract, index) => {
                const status = statusConfig[contract.status as keyof typeof statusConfig];
                const StatusIcon = status?.icon || FileText;
                const isExpiringSoon =
                  contract.status !== "signed" &&
                  contract.status !== "declined" &&
                  contract.expiresAt &&
                  new Date(contract.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                return (
                  <Link
                    key={contract.id}
                    href={`/dashboard/contracts/${contract.id}`}
                    className="block animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 30}ms`, animationFillMode: "backwards" }}
                  >
                    <Card className="bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:border-border hover:shadow-lg hover:-translate-y-0.5 group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                              contract.status === "signed"
                                ? "bg-green-500/20"
                                : contract.status === "declined"
                                ? "bg-red-500/20"
                                : "bg-secondary"
                            )}
                          >
                            <StatusIcon className={cn("h-5 w-5", status?.color)} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate group-hover:text-primary transition-colors">
                                {contract.name}
                              </span>
                              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 shrink-0" />
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="truncate">{contract.client?.name ?? "Unknown Client"}</span>
                              {contract.project?.name && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{contract.project.name}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status & Date */}
                          <div className="text-right shrink-0">
                            <Badge variant={status?.variant || "secondary"}>{status?.label}</Badge>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              {isExpiringSoon && (
                                <Clock className="h-3 w-3 text-orange-400" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {contract.status === "signed" && contract.signedAt
                                  ? `Signed ${formatDate(contract.signedAt)}`
                                  : contract.sentAt
                                  ? `Sent ${formatDate(contract.sentAt)}`
                                  : `Created ${formatDate(contract.createdAt)}`}
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