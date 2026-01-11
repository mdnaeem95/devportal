"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Loader2, Building, CheckCircle2, Circle, Clock, FileText, CreditCard, Package, Lock, ExternalLink,
  Download, File, FileCode, FileImage, FileArchive, FileJson, Figma, Github } from "lucide-react";

type TabId = "overview" | "milestones" | "files" | "invoices";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Circle },
  { id: "milestones", label: "Milestones", icon: CheckCircle2 },
  { id: "files", label: "Files", icon: Package },
  { id: "invoices", label: "Invoices", icon: CreditCard },
];

const statusConfig = {
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-secondary" },
  active: { label: "Active", color: "text-success", bg: "bg-success/20" },
  on_hold: { label: "On Hold", color: "text-warning", bg: "bg-warning/20" },
  completed: { label: "Completed", color: "text-primary", bg: "bg-primary/20" },
  cancelled: { label: "Cancelled", color: "text-destructive", bg: "bg-destructive/20" },
};

const milestoneStatusConfig = {
  pending: { label: "Pending", icon: Circle, color: "text-muted-foreground" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-warning" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-success" },
  invoiced: { label: "Invoiced", icon: FileText, color: "text-primary" },
  paid: { label: "Paid", icon: CheckCircle2, color: "text-success" },
};

const categoryIcons: Record<string, React.ElementType> = {
  code: FileCode,
  document: FileText,
  image: FileImage,
  archive: FileArchive,
  data: FileJson,
  design: Figma,
  other: File,
};

export default function PublicProjectPage({ params }: { params: { publicId: string } }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [password, setPassword] = useState("");
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: project, isLoading, error, refetch } = trpc.project.getPublic.useQuery({
    publicId: params.publicId,
    password: passwordSubmitted ? password : undefined,
  });

  const { data: deliverables } = trpc.deliverable.listPublic.useQuery(
    { projectPublicId: params.publicId },
    { enabled: !!project && !project.isLocked }
  );

  const trackDownload = trpc.deliverable.trackDownload.useMutation();

  const handleDownload = async (id: string, fileUrl: string, fileName: string) => {
    setDownloadingId(id);
    try {
      await trackDownload.mutateAsync({ id });
      // Trigger download
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.click();
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSubmitted(true);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error?.data?.code === "NOT_FOUND" || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-xl font-semibold">Project Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This project doesn't exist or you don't have access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password protection
  if (project.isLocked) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Lock className="h-7 w-7 text-muted-foreground" />
              </div>
              <h1 className="mt-6 text-xl font-semibold">Protected Project</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the password to view this project.
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full gradient-primary border-0">
                Unlock
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[project.status];
  const projectMilestones = project.milestones ?? [];
  const completedMilestones = projectMilestones.filter((m) => 
    ["completed", "invoiced", "paid"].includes(m.status)
  ).length;
  const totalMilestones = projectMilestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  // Separate GitHub repos from files
  const githubRepos = deliverables?.filter((d) => d.mimeType === "application/x-github-repo") || [];
  const files = deliverables?.filter((d) => d.mimeType !== "application/x-github-repo") || [];

  const projectInvoices = project.invoices ?? [];

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">{project.business?.name || "Developer"}</p>
              <p className="text-xs text-muted-foreground">Project Portal</p>
            </div>
          </div>
          <div className={cn("flex items-center gap-2 rounded-full px-3 py-1", status.bg)}>
            <div className={cn("h-2 w-2 rounded-full", status.color.replace("text-", "bg-"))} />
            <span className={cn("text-sm font-medium", status.color)}>{status.label}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="mt-2 text-muted-foreground">
            For {project.client?.name || "Client"}
            {project.client?.company && ` at ${project.client.company}`}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border/50">
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
                {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Progress */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Project Progress</p>
                  <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
                </div>
                <div className="h-3 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {completedMilestones} of {totalMilestones} milestones completed
                </p>
              </CardContent>
            </Card>

            {/* Description */}
            {project.description && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">About This Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{totalMilestones}</p>
                  <p className="text-sm text-muted-foreground">Milestones</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{deliverables?.length ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Deliverables</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{projectInvoices.length}</p>
                  <p className="text-sm text-muted-foreground">Invoices</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "milestones" && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              {projectMilestones.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No milestones defined yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projectMilestones.map((milestone, index) => {
                    const msStatus = milestoneStatusConfig[milestone.status];
                    const MsIcon = msStatus.icon;
                    const isComplete = ["completed", "invoiced", "paid"].includes(milestone.status);

                    return (
                      <div key={milestone.id} className="relative flex gap-4">
                        {/* Timeline connector */}
                        {index < projectMilestones.length - 1 && (
                          <div className="absolute left-5 top-10 h-full w-px bg-border" />
                        )}
                        
                        {/* Status icon */}
                        <div
                          className={cn(
                            "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                            isComplete
                              ? "border-success bg-success/20"
                              : "border-border bg-secondary"
                          )}
                        >
                          <MsIcon className={cn("h-5 w-5", msStatus.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium">{milestone.name}</p>
                              {milestone.description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {milestone.description}
                                </p>
                              )}
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {msStatus.label}
                              </Badge>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-semibold">{formatCurrency(milestone.amount)}</p>
                              {milestone.dueDate && (
                                <p className="text-xs text-muted-foreground">
                                  Due {formatDate(milestone.dueDate)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "files" && (
          <div className="space-y-6">
            {/* GitHub Repos */}
            {githubRepos.length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    Code Repositories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {githubRepos.map((repo) => (
                      <a
                        key={repo.id}
                        href={repo.githubUrl || repo.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            <Github className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{repo.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              Added {formatDate(repo.createdAt)}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Files */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Files & Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => {
                      const Icon = categoryIcons[file.category] || File;
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary shrink-0">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{file.fileName}</p>
                                {file.version > 1 && (
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    v{file.version}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {file.formattedSize && <span>{file.formattedSize}</span>}
                                {file.formattedSize && <span>•</span>}
                                <span>{formatDate(file.createdAt)}</span>
                              </div>
                              {file.versionNotes && (
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  "{file.versionNotes}"
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(file.id, file.fileUrl, file.fileName)}
                            disabled={downloadingId === file.id}
                          >
                            {downloadingId === file.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            Download
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "invoices" && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              {projectInvoices.length === 0 ? (
                <div className="py-8 text-center">
                  <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No invoices yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectInvoices.map((invoice) => {
                    const isPaid = invoice.status === "paid";
                    const isOverdue = !isPaid && invoice.dueDate && new Date(invoice.dueDate) < new Date();

                    return (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                      >
                        <div>
                          <p className="font-mono font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Due {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={cn("font-semibold", isPaid && "text-success")}>
                              {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                            </p>
                            <Badge
                              variant={
                                isPaid ? "success" : isOverdue ? "destructive" : "secondary"
                              }
                            >
                              {isPaid ? "Paid" : isOverdue ? "Overdue" : invoice.status}
                            </Badge>
                          </div>
                          {!isPaid && invoice.payToken && (
                            <Button asChild size="sm" className="gradient-primary border-0">
                              <Link href={`/public/pay/${invoice.payToken}`}>Pay Now</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Project portal for {project.client?.name}</p>
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <Link href="/" className="font-medium text-foreground hover:text-primary transition-colors">
                DevPortal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}