"use client";

import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatDate, cn } from "@/lib/utils";
import { Plus, FileText, ArrowUpRight, Send, Eye, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";

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
    color: "text-yellow-400",
  },
};

export default function ContractsPage() {
  const { data: contracts, isLoading } = trpc.contract.list.useQuery();

  const stats = {
    draft: contracts?.filter((c) => c.status === "draft").length ?? 0,
    pending: contracts?.filter((c) => ["sent", "viewed"].includes(c.status)).length ?? 0,
    signed: contracts?.filter((c) => c.status === "signed").length ?? 0,
  };

  return (
    <>
      <Header
        title="Contracts"
        description={`${stats.pending} awaiting signature, ${stats.signed} signed`}
        action={
          <Button className="gradient-primary border-0" asChild>
            <Link href="/dashboard/contracts/new">
              <Plus className="h-4 w-4" />
              New Contract
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Quick Stats */}
        <div className="grid gap-4 mb-6 sm:grid-cols-3">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold">{stats.draft}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Awaiting Signature</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Signed</p>
              <p className="text-2xl font-bold text-success">{stats.signed}</p>
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
                      <div className="h-4 w-48 rounded bg-secondary" />
                      <div className="h-3 w-32 rounded bg-secondary" />
                    </div>
                    <div className="h-6 w-16 rounded bg-secondary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contracts?.length === 0 ? (
          <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">No contracts yet</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                Create your first contract to protect your work with proper legal agreements.
              </p>
              <Button className="mt-6 gradient-primary border-0" asChild>
                <Link href="/dashboard/contracts/new">
                  <Plus className="h-4 w-4" />
                  Create Contract
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {contracts?.map((contract) => {
              const status = statusConfig[contract.status];
              const StatusIcon = status.icon;
              const isExpiringSoon =
                contract.status !== "signed" &&
                contract.expiresAt &&
                new Date(contract.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

              // Extract relation data with type assertion
              const contractWithRelations = contract as typeof contract & {
                client?: { name: string } | null;
                project?: { name: string } | null;
              };
              
              const clientName = contractWithRelations.client?.name ?? "Unknown Client";
              const projectName = contractWithRelations.project?.name ?? null;

              return (
                <Link key={contract.id} href={`/dashboard/contracts/${contract.id}`}>
                  <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:border-border group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg",
                            contract.status === "signed" ? "bg-green-500/20" : "bg-secondary"
                          )}
                        >
                          <StatusIcon className={cn("h-5 w-5", status.color)} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{contract.name}</span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="truncate">{clientName}</span>
                            {projectName && (
                              <>
                                <span>•</span>
                                <span className="truncate">{projectName}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status & Date */}
                        <div className="text-right shrink-0">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            {isExpiringSoon && contract.status !== "signed" && (
                              <Clock className="h-3 w-3 text-warning" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {contract.status === "signed" && contract.signedAt
                                ? `Signed ${formatDate(contract.signedAt)}`
                                : contract.status === "sent" || contract.status === "viewed"
                                ? contract.sentAt
                                  ? `Sent ${formatDate(contract.sentAt)}`
                                  : `Created ${formatDate(contract.createdAt)}`
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
    </>
  );
}