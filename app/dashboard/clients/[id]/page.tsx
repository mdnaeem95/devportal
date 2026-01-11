"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ArrowLeft, Loader2, ExternalLink, Copy, Check, FileText, CreditCard, Package, Clock, CheckCircle2, Circle } from "lucide-react";

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
  pending: { label: "Pending", icon: Circle, color: "text-muted-foreground" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-warning" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-success" },
  invoiced: { label: "Invoiced", icon: CreditCard, color: "text-primary" },
  paid: { label: "Paid", icon: Check, color: "text-success" },
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [copied, setCopied] = useState(false);

  const { data: project, isLoading, refetch } = trpc.project.get.useQuery({ id: params.id });

  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => refetch(),
  });

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
            <Link href="/projects">Back to Projects</Link>
          </Button>
        </div>
      </>
    );
  }

  const status = statusConfig[project.status];
  const completedMilestones = project.milestones?.filter((m) => 
    ["completed", "invoiced", "paid"].includes(m.status)
  ).length ?? 0;
  const totalMilestones = project.milestones?.length ?? 0;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <>
      <Header
        title={project.name}
        description={project.client.name}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" onClick={copyPublicLink}>
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Share Link"}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.publicId}`} target="_blank">
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
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
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
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="mt-1 text-xl font-bold">
                      {completedMilestones}/{totalMilestones}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="mt-1 text-sm font-medium">
                      {project.startDate ? formatDate(project.startDate) : "Not set"}
                      {project.endDate && ` → ${formatDate(project.endDate)}`}
                    </p>
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
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {project.description}
                    </p>
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
                    href={`/clients/${project.client.id}`}
                    className="flex items-center gap-4 rounded-lg border border-border/50 p-4 transition-all hover:bg-secondary/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary text-lg font-semibold text-white">
                      {project.client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{project.client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.client.company || project.client.email}
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
                      {project.milestones?.map((milestone, index) => {
                        const msStatus = milestoneStatusConfig[milestone.status];
                        const MsIcon = msStatus.icon;
                        return (
                          <div
                            key={milestone.id}
                            className="flex items-start gap-4 rounded-lg border border-border/50 p-4"
                          >
                            <div className={cn("mt-0.5", msStatus.color)}>
                              <MsIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium">{milestone.name}</p>
                                  {milestone.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {milestone.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-semibold">
                                    {formatCurrency(milestone.amount)}
                                  </p>
                                  {milestone.dueDate && (
                                    <p className="text-xs text-muted-foreground">
                                      Due {formatDate(milestone.dueDate)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {msStatus.label}
                                </Badge>
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
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Contracts Coming Soon</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create and manage dev-specific contracts with e-signatures.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="mx-auto max-w-4xl">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="py-12 text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Invoices Coming Soon</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Generate invoices from milestones and accept payments.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "deliverables" && (
            <div className="mx-auto max-w-4xl">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Deliverables Coming Soon</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload files and link GitHub repos for your clients.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}