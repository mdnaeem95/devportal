"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeliverablesTab } from "@/components/projects/deliverables-tab";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ExternalLink, Copy, Check, FileText, CreditCard, Package, Clock,
  CheckCircle2, Circle, Plus, Receipt, Send, Eye, XCircle, ArrowUpRight, Calendar, DollarSign,
  Target, User, Pencil, Trash2, AlertTriangle, FolderOpen, Settings, Copy as CopyIcon } from "lucide-react";
import { MilestonesTab } from "@/components/projects/milestones-tab";

type TabId = "overview" | "milestones" | "contract" | "invoices" | "deliverables";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: FolderOpen },
  { id: "milestones", label: "Milestones", icon: Target },
  { id: "contract", label: "Contract", icon: FileText },
  { id: "invoices", label: "Invoices", icon: CreditCard },
  { id: "deliverables", label: "Deliverables", icon: Package },
];

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, color: "text-muted-foreground", bg: "bg-secondary" },
  active: { label: "Active", variant: "default" as const, color: "text-green-400", bg: "bg-green-500/20" },
  on_hold: { label: "On Hold", variant: "secondary" as const, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  completed: { label: "Completed", variant: "default" as const, color: "text-primary", bg: "bg-primary/20" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, color: "text-red-400", bg: "bg-red-500/20" },
};

const milestoneStatusConfig = {
  pending: { label: "Pending", icon: Circle, color: "text-muted-foreground", bg: "bg-secondary", canInvoice: false },
  in_progress: { label: "In Progress", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/20", canInvoice: false },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/20", canInvoice: true },
  invoiced: { label: "Invoiced", icon: Receipt, color: "text-primary", bg: "bg-primary/20", canInvoice: false },
  paid: { label: "Paid", icon: Check, color: "text-green-400", bg: "bg-green-500/20", canInvoice: false },
};

const contractStatusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, icon: FileText },
  sent: { label: "Sent", variant: "default" as const, icon: Send },
  viewed: { label: "Viewed", variant: "default" as const, icon: Eye },
  signed: { label: "Signed", variant: "default" as const, icon: CheckCircle2, color: "text-green-400" },
  declined: { label: "Declined", variant: "destructive" as const, icon: XCircle },
  expired: { label: "Expired", variant: "secondary" as const, icon: Clock },
};

const invoiceStatusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  sent: { label: "Sent", variant: "default" as const },
  viewed: { label: "Viewed", variant: "default" as const },
  paid: { label: "Paid", variant: "default" as const, color: "text-green-400" },
  overdue: { label: "Overdue", variant: "destructive" as const },
  cancelled: { label: "Cancelled", variant: "secondary" as const },
};

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [copied, setCopied] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const utils = trpc.useUtils();

  const { data: project, isLoading } = trpc.project.get.useQuery({ id: projectId });
  const { data: invoices } = trpc.invoice.list.useQuery({ projectId });
  const { data: contracts } = trpc.contract.list.useQuery({ projectId });
  const { data: deliverables } = trpc.deliverable.list.useQuery({ projectId });

  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated!");
      utils.project.get.invalidate({ id: projectId });
      setShowEditDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update project");
    },
  });

  const deleteProject = trpc.project.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted");
      router.push("/dashboard/projects");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete project");
    },
  });

  const duplicateProject = trpc.project.duplicate.useMutation({
    onSuccess: (newProject) => {
      toast.success("Project duplicated!");
      setIsDuplicating(false);
      router.push(`/dashboard/projects/${newProject.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to duplicate project");
      setIsDuplicating(false);
    },
  });

  const handleDuplicate = () => {
    setIsDuplicating(true);
    duplicateProject.mutate({ id: projectId });
  };

  const createInvoiceFromMilestone = trpc.invoice.createFromMilestone.useMutation({
    onSuccess: (invoice) => {
      toast.success("Invoice created!");
      router.push(`/dashboard/invoices/${invoice.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create invoice");
      setCreatingInvoice(null);
    },
  });

  const handleCreateInvoice = (milestoneId: string) => {
    setCreatingInvoice(milestoneId);
    createInvoiceFromMilestone.mutate({ milestoneId });
  };

  const copyPublicLink = () => {
    if (project) {
      const url = `${window.location.origin}/public/project/${project.publicId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openEditDialog = () => {
    if (project) {
      setEditName(project.name);
      setEditStatus(project.status);
      setEditDescription(project.description || "");
      setShowEditDialog(true);
    }
  };

  const handleUpdate = () => {
    updateProject.mutate({
      id: projectId,
      name: editName,
      status: editStatus as "draft" | "active" | "on_hold" | "completed" | "cancelled",
      description: editDescription || undefined,
    });
  };

  const handleDelete = () => {
    deleteProject.mutate({ id: projectId });
  };

  if (isLoading) {
    return (
      <>
        <Header title="Loading..." />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-4xl">
            <OverviewSkeleton />
          </div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header title="Project Not Found" />
        <div className="flex-1 overflow-auto p-6">
          <Card className="mx-auto max-w-md bg-card/50">
            <CardContent className="flex flex-col items-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Project not found</h3>
              <p className="mt-2 text-muted-foreground">
                This project doesn't exist or was deleted.
              </p>
              <Button className="mt-6 cursor-pointer" asChild>
                <Link href="/dashboard/projects">Back to Projects</Link>
              </Button>
            </CardContent>
          </Card>
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

  const projectWithRelations = project as typeof project & {
    client: { id: string; name: string; email: string; company: string | null };
  };

  return (
    <>
      <Header
        title={project.name}
        description={projectWithRelations.client.name}
        onSearchClick={() => setCommandOpen(true)}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="cursor-pointer hover:bg-secondary transition-colors" asChild>
              <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" className="cursor-pointer hover:bg-secondary hover:border-border transition-colors" onClick={openEditDialog}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              className="cursor-pointer hover:bg-secondary hover:border-border transition-colors" 
              onClick={handleDuplicate}
              disabled={isDuplicating}
            >
              {isDuplicating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
              {isDuplicating ? "Duplicating..." : "Duplicate"}
            </Button>
            <Button variant="outline" className="cursor-pointer hover:bg-secondary hover:border-border transition-colors" onClick={copyPublicLink}>
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Share"}
            </Button>
            <Button variant="outline" className="cursor-pointer hover:bg-secondary hover:border-border transition-colors" asChild>
              <Link href={`/public/project/${project.publicId}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
                Preview
              </Link>
            </Button>
          </div>
        }
      />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <div className="flex-1 overflow-auto">
        {/* Status Banner */}
        {project.status === "completed" && (
          <div className="border-b border-green-500/30 bg-green-500/10 px-6 py-3 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <p className="text-sm font-medium text-green-400">
                This project has been completed
              </p>
            </div>
          </div>
        )}

        {project.status === "on_hold" && (
          <div className="border-b border-yellow-500/30 bg-yellow-500/10 px-6 py-3 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <p className="text-sm font-medium text-yellow-400">
                This project is currently on hold
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-border/50 bg-card/30 px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
                  activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === "milestones" && totalMilestones > 0 && (
                  <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                    {completedMilestones}/{totalMilestones}
                  </span>
                )}
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
            <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
              {/* Quick Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "0ms" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", status.bg)}>
                        <Circle className={cn("h-4 w-4", status.color)} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "50ms" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                      {project.totalAmount ? (
                        <AnimatedNumber value={project.totalAmount / 100} formatFn={(v) => `$${v.toLocaleString()}`} />
                      ) : (
                        "—"
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "100ms" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Invoiced</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-bold">
                      <AnimatedNumber value={totalInvoiced / 100} formatFn={(v) => `$${v.toLocaleString()}`} />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/10 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "150ms" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Collected</p>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                        <Check className="h-4 w-4 text-green-400" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-green-400">
                      <AnimatedNumber value={totalPaid / 100} formatFn={(v) => `$${v.toLocaleString()}`} />
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Bar */}
              <Card className="bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "200ms" }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Overall Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {completedMilestones} of {totalMilestones} milestones
                    </p>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-primary transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-sm font-semibold text-primary">
                    {Math.round(progress)}%
                  </p>
                </CardContent>
              </Card>

              {/* Revenue Summary Card */}
              <Card className="bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "200ms" }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    Revenue Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const totalValue = project.totalAmount ?? 0;
                    const outstanding = totalInvoiced - totalPaid;
                    const remainingToInvoice = Math.max(0, totalValue - totalInvoiced);
                    
                    return (
                      <div className="space-y-4">
                        {/* Visual Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Revenue Progress</span>
                            <span>{totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 0}% collected</span>
                          </div>
                          <div className="h-4 rounded-full bg-secondary overflow-hidden flex">
                            {/* Paid (green) */}
                            {totalValue > 0 && totalPaid > 0 && (
                              <div 
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${(totalPaid / totalValue) * 100}%` }}
                                title={`Paid: $${(totalPaid / 100).toLocaleString()}`}
                              />
                            )}
                            {/* Outstanding (yellow) */}
                            {totalValue > 0 && outstanding > 0 && (
                              <div 
                                className="h-full bg-yellow-500 transition-all duration-500"
                                style={{ width: `${(outstanding / totalValue) * 100}%` }}
                                title={`Outstanding: $${(outstanding / 100).toLocaleString()}`}
                              />
                            )}
                            {/* Remaining to invoice (gray) */}
                            {totalValue > 0 && remainingToInvoice > 0 && (
                              <div 
                                className="h-full bg-muted-foreground/20 transition-all duration-500"
                                style={{ width: `${(remainingToInvoice / totalValue) * 100}%` }}
                                title={`Not invoiced: $${(remainingToInvoice / 100).toLocaleString()}`}
                              />
                            )}
                          </div>
                          {/* Legend */}
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <span className="text-muted-foreground">Paid</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                              <span className="text-muted-foreground">Outstanding</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                              <span className="text-muted-foreground">Not Invoiced</span>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border/50">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Project Value</p>
                            <p className="font-semibold">{formatCurrency(totalValue)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Invoiced</p>
                            <p className="font-semibold">{formatCurrency(totalInvoiced)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Collected</p>
                            <p className="font-semibold text-green-400">{formatCurrency(totalPaid)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                            <p className={cn("font-semibold", outstanding > 0 ? "text-yellow-400" : "text-muted-foreground")}>
                              {formatCurrency(outstanding)}
                            </p>
                          </div>
                        </div>

                        {/* Remaining to Invoice Alert */}
                        {remainingToInvoice > 0 && (
                          <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                            <Receipt className="h-4 w-4 text-primary shrink-0" />
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">{formatCurrency(remainingToInvoice)}</span> remaining to invoice
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Project Details */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Description */}
                <Card className="bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "250ms" }}>
                  <CardHeader>
                    <CardTitle className="text-base">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.description ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {project.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No description provided</p>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card className="bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "300ms" }}>
                  <CardHeader>
                    <CardTitle className="text-base">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Start:</span>
                      <span className="text-sm font-medium">
                        {project.startDate ? formatDate(project.startDate) : "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">End:</span>
                      <span className="text-sm font-medium">
                        {project.endDate ? formatDate(project.endDate) : "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm font-medium">{formatDate(project.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Client Info */}
              <Card className="bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "350ms" }}>
                <CardHeader>
                  <CardTitle className="text-base">Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/dashboard/clients/${projectWithRelations.client.id}`}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:bg-secondary/50 hover:border-border group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-lg font-semibold text-white transition-transform group-hover:scale-105">
                        {projectWithRelations.client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {projectWithRelations.client.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {projectWithRelations.client.company || projectWithRelations.client.email}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/30 bg-destructive/5 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: "400ms" }}>
                <CardHeader>
                  <CardTitle className="text-base text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="cursor-pointer text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Project
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "milestones" && (
            <div className="mx-auto max-w-4xl animate-in fade-in duration-300">
              <MilestonesTab 
                projectId={project.id}
                milestones={project.milestones || []}
              />
            </div>
          )}

          {activeTab === "contract" && (
            <div className="mx-auto max-w-4xl animate-in fade-in duration-300">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Contracts</CardTitle>
                    <Button size="sm" className="cursor-pointer gradient-primary border-0 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5" asChild>
                      <Link href={`/dashboard/contracts/new?project=${project.id}&client=${project.clientId}`}>
                        <Plus className="h-4 w-4" />
                        New Contract
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!contracts || contracts.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-secondary">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mt-6 font-semibold">No contracts yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                        Create a contract to protect your work with legal agreements.
                      </p>
                      <Button variant="outline" className="mt-6 cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors" asChild>
                        <Link href={`/dashboard/contracts/new?project=${project.id}&client=${project.clientId}`}>
                          <Plus className="h-4 w-4" />
                          Create Contract
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contracts.map((contract, index) => {
                        const cStatus = contractStatusConfig[contract.status];
                        const CIcon = cStatus.icon;
                        return (
                          <Link
                            key={contract.id}
                            href={`/dashboard/contracts/${contract.id}`}
                            className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:bg-secondary/50 hover:border-border group animate-in fade-in slide-in-from-bottom-2 duration-300"
                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
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
                                <p className="font-medium group-hover:text-primary transition-colors">{contract.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {contract.status === "signed" && contract.signedAt
                                    ? `Signed ${formatDate(contract.signedAt)}`
                                    : `Created ${formatDate(contract.createdAt)}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={cStatus.variant}>{cStatus.label}</Badge>
                              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                            </div>
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
            <div className="mx-auto max-w-4xl animate-in fade-in duration-300">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Invoices</CardTitle>
                    <Button size="sm" className="cursor-pointer gradient-primary border-0 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5" asChild>
                      <Link href={`/dashboard/invoices/new?project=${project.id}&client=${project.clientId}`}>
                        <Plus className="h-4 w-4" />
                        New Invoice
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!invoices || invoices.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-secondary">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mt-6 font-semibold">No invoices yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                        Create an invoice from a completed milestone or manually.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((invoice, index) => {
                        const invStatus = invoiceStatusConfig[invoice.status];
                        return (
                          <Link
                            key={invoice.id}
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:bg-secondary/50 hover:border-border group animate-in fade-in slide-in-from-bottom-2 duration-300"
                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                                  invoice.status === "paid" ? "bg-green-500/20" : "bg-secondary"
                                )}
                              >
                                <Receipt
                                  className={cn(
                                    "h-5 w-5",
                                    invoice.status === "paid" ? "text-green-400" : "text-muted-foreground"
                                  )}
                                />
                              </div>
                              <div>
                                <p className="font-mono font-medium group-hover:text-primary transition-colors">
                                  {invoice.invoiceNumber}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due {formatDate(invoice.dueDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className={cn("font-semibold", invoice.status === "paid" && "text-green-400")}>
                                  {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                                </p>
                                <Badge variant={invStatus.variant}>{invStatus.label}</Badge>
                              </div>
                              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "deliverables" && (
            <div className="mx-auto max-w-4xl animate-in fade-in duration-300">
              <DeliverablesTab
                projectId={project.id}
                milestones={project.milestones?.map((m) => ({ id: m.id, name: m.name })) ?? []}
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft" className="cursor-pointer">Draft</SelectItem>
                  <SelectItem value="active" className="cursor-pointer">Active</SelectItem>
                  <SelectItem value="on_hold" className="cursor-pointer">On Hold</SelectItem>
                  <SelectItem value="completed" className="cursor-pointer">Completed</SelectItem>
                  <SelectItem value="cancelled" className="cursor-pointer">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              className="cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateProject.isPending}
              className="cursor-pointer gradient-primary border-0 transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              {updateProject.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{project.name}"? This will also delete all associated milestones. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="ghost" 
              className="cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer transition-all hover:shadow-lg hover:shadow-destructive/25"
              onClick={handleDelete}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}