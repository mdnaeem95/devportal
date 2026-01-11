"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatDate, cn } from "@/lib/utils";
import { FolderKanban, Lock, Loader2, CheckCircle2, Circle, Clock, CreditCard, Check, Package, Calendar, AlertCircle } from "lucide-react";

type TabId = "overview" | "milestones" | "files" | "invoices";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: FolderKanban },
  { id: "milestones", label: "Milestones", icon: CheckCircle2 },
  { id: "files", label: "Files", icon: Package },
  { id: "invoices", label: "Invoices", icon: CreditCard },
];

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-500" },
  active: { label: "In Progress", color: "bg-blue-500" },
  on_hold: { label: "On Hold", color: "bg-yellow-500" },
  completed: { label: "Completed", color: "bg-green-500" },
  cancelled: { label: "Cancelled", color: "bg-red-500" },
};

const milestoneStatusConfig = {
  pending: { label: "Upcoming", icon: Circle, color: "text-muted-foreground", bg: "bg-secondary" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/20" },
  invoiced: { label: "Invoiced", icon: CreditCard, color: "text-purple-400", bg: "bg-purple-500/20" },
  paid: { label: "Paid", icon: Check, color: "text-green-400", bg: "bg-green-500/20" },
};

export default function PublicProjectPage({ params }: { params: { publicId: string } }) {
  const [password, setPassword] = useState("");
  const [submittedPassword, setSubmittedPassword] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const { data: project, isLoading, error } = trpc.project.getPublic.useQuery({
    publicId: params.publicId,
    password: submittedPassword,
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedPassword(password);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Password required
  if (error?.data?.code === "UNAUTHORIZED") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <Lock className="h-7 w-7 text-muted-foreground" />
              </div>
              <h1 className="mt-6 text-xl font-semibold">Password Protected</h1>
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
                autoFocus
              />
              <Button type="submit" className="w-full gradient-primary border-0">
                View Project
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found
  if (error?.data?.code === "NOT_FOUND" || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <AlertCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-xl font-semibold">Project Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This project doesn't exist or the link may have expired.
            </p>
          </CardContent>
        </Card>
      </div>
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
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <FolderKanban className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">{project.name}</p>
              <p className="text-xs text-muted-foreground">
                {project.client.company || project.client.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", status.color)} />
            <span className="text-sm text-muted-foreground">{status.label}</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 border-b border-border/50 bg-card/30">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <p className="mt-2 text-muted-foreground">
                For {project.client.name}
                {project.client.company && ` at ${project.client.company}`}
              </p>
              {project.startDate && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(project.startDate)}
                    {project.endDate && ` — ${formatDate(project.endDate)}`}
                  </span>
                </div>
              )}
            </div>
            
            {/* Progress Ring */}
            <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 -rotate-90 transform">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-secondary"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="url(#progress-gradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 1.76} 176`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="oklch(65% 0.24 265)" />
                      <stop offset="100%" stopColor="oklch(75% 0.18 195)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(progress)}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Progress</p>
                <p className="text-xs text-muted-foreground">
                  {completedMilestones} of {totalMilestones} milestones
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
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
      </div>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Description */}
            {project.description && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base">About This Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Milestone Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {project.milestones?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No milestones defined yet.</p>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-2.75 top-2 bottom-2 w-0.5 bg-border" />
                    
                    <div className="space-y-6">
                      {project.milestones?.map((milestone, index) => {
                        const msStatus = milestoneStatusConfig[milestone.status];
                        const MsIcon = msStatus.icon;
                        const isCompleted = ["completed", "invoiced", "paid"].includes(milestone.status);
                        
                        return (
                          <div key={milestone.id} className="relative flex gap-4 pl-8">
                            {/* Status dot */}
                            <div
                              className={cn(
                                "absolute left-0 flex h-6 w-6 items-center justify-center rounded-full",
                                isCompleted ? "bg-green-500" : msStatus.bg
                              )}
                            >
                              <MsIcon className={cn("h-3.5 w-3.5", isCompleted ? "text-white" : msStatus.color)} />
                            </div>
                            
                            <div className="flex-1 rounded-lg border border-border/50 bg-secondary/30 p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium">{milestone.name}</p>
                                  {milestone.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {milestone.description}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="secondary" className="shrink-0">
                                  {msStatus.label}
                                </Badge>
                              </div>
                              {milestone.dueDate && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Due {formatDate(milestone.dueDate)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "milestones" && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">All Milestones</CardTitle>
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
                    const isCompleted = ["completed", "invoiced", "paid"].includes(milestone.status);
                    
                    return (
                      <div
                        key={milestone.id}
                        className={cn(
                          "flex items-center gap-4 rounded-lg border p-4 transition-colors",
                          isCompleted 
                            ? "border-green-500/30 bg-green-500/5" 
                            : "border-border/50 bg-secondary/30"
                        )}
                      >
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          isCompleted ? "bg-green-500/20" : msStatus.bg
                        )}>
                          <MsIcon className={cn("h-5 w-5", isCompleted ? "text-green-400" : msStatus.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>
                            {milestone.name}
                          </p>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant="secondary">{msStatus.label}</Badge>
                          {milestone.dueDate && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(milestone.dueDate)}
                            </p>
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

        {activeTab === "files" && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Files Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Deliverables will appear here when uploaded.
              </p>
            </CardContent>
          </Card>
        )}

        {activeTab === "invoices" && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Invoices Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Invoices will appear here when generated.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/30 mt-auto">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Questions about this project? Contact your developer directly.</p>
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