"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliverablesTab } from "@/components/projects/deliverables-tab";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  FileText,
  CreditCard,
  Package,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Receipt,
  Send,
  Eye,
  XCircle,
} from "lucide-react";

type TabId = "overview" | "milestones" | "contract" | "invoices" | "deliverables";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Circle },
  { id: "milestones", label: "Milestones", icon: CheckCircle2 },
  { id: "contract", label: "Contract", icon: FileText },
  { id: "invoices", label: "Invoices", icon: CreditCard },
  { id: "deliverables", label: "Deliverables", icon: Package },
];

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, color: "text-muted-foreground" },
  active: { label: "Active", variant: "success" as const, color: "text-success" },
  on_hold: { label: "On Hold", variant: "warning" as const, color: "text-warning" },
  completed: { label: "Completed", variant: "default" as const, color: "text-primary" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, color: "text-destructive" },
};

const milestoneStatusConfig = {
  pending: { label: "Pending", icon: Circle, color: "text-muted-foreground", canInvoice: false },
  in_progress: { label: "In Progress", icon: Clock, color: "text-warning", canInvoice: false },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-success", canInvoice: true },
  invoiced: { label: "Invoiced", icon: Receipt, color: "text-primary", canInvoice: false },
  paid: { label: "Paid", icon: Check, color: "text-success", canInvoice: false },
};

const contractStatusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, icon: FileText },
  sent: { label: "Sent", variant: "default" as const, icon: Send },
  viewed: { label: "Viewed", variant: "default" as const, icon: Eye },
  signed: { label: "Signed", variant: "success" as const, icon: CheckCircle2 },
  declined: { label: "Declined", variant: "destructive" as const, icon: XCircle },
  expired: { label: "Expired", variant: "secondary" as const, icon: Clock },
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [copied, setCopied] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState<string | null>(null);

  const { data: project, isLoading, refetch } = trpc.project.get.useQuery({ id: params.id });
  const { data: invoices } = trpc.invoice.list.useQuery({ projectId: params.id });
  const { data: contracts } = trpc.contract.list.useQuery({ projectId: params.id });
  const { data: deliverables } = trpc.deliverable.list.useQuery({ projectId: params.id });

  const createInvoiceFromMilestone = trpc.invoice.createFromMilestone.useMutation({
    onSuccess: (invoice) => {
      router.push(`/dashboard/invoices/${invoice.id}`);
    },
    onError: () => {
      setCreatingInvoice(null);
    },
  });

  const handleCreateInvoice = (milestoneId: string) => {
    setCreatingInvoice(milestoneId);
    createInvoiceFromMilestone.mutate({ milestoneId });
  };

  const copyPublicLink = () => {
    if (project) {
      const url = `${window.location.origin}/p/${project.publicId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Project" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header title="Project Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">This project doesn't exist or was deleted.</p>
          <Button asChild>
            <Link href="/dashboard/projects">Back to Projects</Link>
          </Button>
        </div>
      </>
    );
  }

  const status = statusConfig[project.status];
  const completedMilestones =
    project.milestones?.filter((m) => ["completed", "invoiced", "paid"].includes(m.status)).length ?? 0;
  const totalMilestones = project.milestones?.length ?? 0;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const totalInvoiced = invoices?.reduce((sum, inv) => sum + inv.total, 0) ?? 0;
  const totalPaid =
    invoices?.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0) ?? 0;

  // Cast project client for type safety
  const projectWithRelations = project as typeof project & {
    client: { id: string; name: string; email: string; company: string | null };
  };

  return (
    <>
      <Header
        title={project.name}
        description={projectWithRelations.client.name}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" onClick={copyPublicLink}>
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Share Link"}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/public/project/${project.publicId}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
                Preview
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto">
        {/* Tabs */}
        <div className="border-b border-border/50 bg-card/30 px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
                  activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === "invoices" && invoices && invoices.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                    {invoices.length}
                  </span>
                )}
                {tab.id === "contract" && contracts && contracts.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                    {contracts.length}
                  </span>
                )}
                {tab.id === "deliverables" && deliverables && deliverables.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                    {deliverables.length}
                  </span>
                )}
                {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Quick Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="mt-1 text-xl font-bold">
                      {project.totalAmount ? formatCurrency(project.totalAmount) : "—"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Invoiced</p>
                    <p className="mt-1 text-xl font-bold">{formatCurrency(totalInvoiced)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Collected</p>
                    <p className="mt-1 text-xl font-bold text-success">{formatCurrency(totalPaid)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Bar */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Overall Progress</p>
                    <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full gradient-primary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {project.description && (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Client Info */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/dashboard/clients/${projectWithRelations.client.id}`}
                    className="flex items-center gap-4 rounded-lg border border-border/50 p-4 transition-all hover:bg-secondary/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary text-lg font-semibold text-white">
                      {projectWithRelations.client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{projectWithRelations.client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {projectWithRelations.client.company || projectWithRelations.client.email}
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "milestones" && (
            <div className="mx-auto max-w-4xl">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Milestones</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {completedMilestones} of {totalMilestones} completed
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.milestones?.length === 0 ? (
                    <div className="py-8 text-center">
                      <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">No milestones yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {project.milestones?.map((milestone) => {
                        const msStatus = milestoneStatusConfig[milestone.status];
                        const MsIcon = msStatus.icon;
                        return (
                          <div key={milestone.id} className="flex items-start gap-4 rounded-lg border border-border/50 p-4">
                            <div className={cn("mt-0.5", msStatus.color)}>
                              <MsIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium">{milestone.name}</p>
                                  {milestone.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-semibold">{formatCurrency(milestone.amount)}</p>
                                  {milestone.dueDate && (
                                    <p className="text-xs text-muted-foreground">Due {formatDate(milestone.dueDate)}</p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {msStatus.label}
                                </Badge>
                                {msStatus.canInvoice && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => handleCreateInvoice(milestone.id)}
                                    disabled={creatingInvoice === milestone.id}
                                  >
                                    {creatingInvoice === milestone.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Receipt className="h-3 w-3" />
                                    )}
                                    Create Invoice
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "contract" && (
            <div className="mx-auto max-w-4xl">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Contracts</CardTitle>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/contracts/new?project=${project.id}&client=${project.clientId}`}>
                        <Plus className="h-4 w-4" />
                        New Contract
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!contracts || contracts.length === 0 ? (
                    <div className="py-8 text-center">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">No contracts yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Create a contract to protect your work with legal agreements
                      </p>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href={`/dashboard/contracts/new?project=${project.id}&client=${project.clientId}`}>
                          <Plus className="h-4 w-4" />
                          Create Contract
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contracts.map((contract) => {
                        const cStatus = contractStatusConfig[contract.status];
                        const CIcon = cStatus.icon;
                        return (
                          <Link
                            key={contract.id}
                            href={`/dashboard/contracts/${contract.id}`}
                            className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:bg-secondary/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-lg",
                                  contract.status === "signed" ? "bg-green-500/20" : "bg-secondary"
                                )}
                              >
                                <CIcon
                                  className={cn(
                                    "h-5 w-5",
                                    contract.status === "signed"
                                      ? "text-green-400"
                                      : contract.status === "declined"
                                      ? "text-red-400"
                                      : "text-muted-foreground"
                                  )}
                                />
                              </div>
                              <div>
                                <p className="font-medium">{contract.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {contract.status === "signed" && contract.signedAt
                                    ? `Signed ${formatDate(contract.signedAt)}`
                                    : `Created ${formatDate(contract.createdAt)}`}
                                </p>
                              </div>
                            </div>
                            <Badge variant={cStatus.variant}>{cStatus.label}</Badge>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="mx-auto max-w-4xl">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Invoices</CardTitle>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/invoices/new?project=${project.id}&client=${project.clientId}`}>
                        <Plus className="h-4 w-4" />
                        New Invoice
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!invoices || invoices.length === 0 ? (
                    <div className="py-8 text-center">
                      <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">No invoices yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Create an invoice from a completed milestone or manually
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <Link
                          key={invoice.id}
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:bg-secondary/50"
                        >
                          <div>
                            <p className="font-mono font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">Due {formatDate(invoice.dueDate)}</p>
                          </div>
                          <div className="text-right">
                            <p className={cn("font-semibold", invoice.status === "paid" && "text-success")}>
                              {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                            </p>
                            <Badge
                              variant={
                                invoice.status === "paid"
                                  ? "success"
                                  : invoice.status === "sent" || invoice.status === "viewed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "deliverables" && (
            <div className="mx-auto max-w-4xl">
              <DeliverablesTab
                projectId={project.id}
                milestones={project.milestones?.map((m) => ({ id: m.id, name: m.name })) ?? []}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}