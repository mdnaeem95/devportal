"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { AnimatedNumber } from "@/components/dashboard/animated-number";
import { trpc } from "@/lib/trpc";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, FileText, FileCode, ArrowUpRight, Copy, Lock, Loader2, Receipt, Sparkles, Star, Layers } from "lucide-react";

type TabId = "contract" | "invoice";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "contract", label: "Contract Templates", icon: FileText },
  { id: "invoice", label: "Invoice Templates", icon: Receipt },
];

function TemplateCardSkeleton() {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-12" />
      </CardContent>
    </Card>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const [activeTab, setActiveTab] = useState<TabId>("contract");
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const { data: templates, isLoading, refetch } = trpc.template.list.useQuery({
    type: activeTab,
  });

  const duplicateTemplate = trpc.template.duplicate.useMutation({
    onSuccess: (template) => {
      toast.success("Template duplicated!");
      refetch();
      router.push(`/dashboard/templates/${template.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to duplicate template");
      setDuplicating(null);
    },
    onSettled: () => setDuplicating(null),
  });

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDuplicating(id);
    duplicateTemplate.mutate({ id });
  };

  const systemTemplates = templates?.filter((t) => t.isSystem) || [];
  const customTemplates = templates?.filter((t) => !t.isSystem) || [];

  // Stats
  const stats = {
    system: systemTemplates.length,
    custom: customTemplates.length,
    total: templates?.length ?? 0,
  };

  return (
    <>
      <Header
        title="Templates"
        description="Manage your contract and invoice templates"
        onSearchClick={() => setCommandOpen(true)}
        action={
          <Button
            className="gradient-primary border-0 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            asChild
          >
            <Link href={`/dashboard/templates/new?type=${activeTab}`}>
              <Plus className="h-4 w-4" />
              New Template
            </Link>
          </Button>
        }
      />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <div className="flex-1 overflow-auto">
        {/* Stats */}
        <div className="border-b border-border/50 bg-card/30 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Total Templates</p>
                      <Layers className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={stats.total} />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Built-in</p>
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold mt-1 text-purple-400">
                      <AnimatedNumber value={stats.system} />
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Custom</p>
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold mt-1 text-primary">
                      <AnimatedNumber value={stats.custom} />
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

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

        <div className="p-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
              <TemplateCardSkeleton />
            </div>
          ) : (
            <div className="space-y-8">
              {/* System Templates */}
              {systemTemplates.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Built-in Templates
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {systemTemplates.map((template, index) => (
                      <Card
                        key={template.id}
                        className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:border-border hover:shadow-lg hover:-translate-y-0.5 group relative animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 transition-transform group-hover:scale-110">
                                <FileCode className="h-5 w-5 text-purple-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{template.name}</h3>
                                <Badge variant="secondary" className="mt-1">
                                  <Lock className="h-3 w-3 mr-1" />
                                  System
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {template.description && (
                            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                          )}
                          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Read-only
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleDuplicate(template.id, e)}
                              disabled={duplicating === template.id}
                              className="transition-all hover:border-primary hover:text-primary"
                            >
                              {duplicating === template.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                              Duplicate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Templates */}
              <div>
                {customTemplates.length > 0 && (
                  <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Your Templates
                  </h2>
                )}
                {customTemplates.length === 0 && systemTemplates.length === 0 ? (
                  <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center py-12">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mt-6 text-lg font-semibold">No templates yet</h3>
                      <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                        Create your first {activeTab} template to streamline your workflow.
                      </p>
                      <Button className="mt-6 gradient-primary border-0" asChild>
                        <Link href={`/dashboard/templates/new?type=${activeTab}`}>
                          <Plus className="h-4 w-4" />
                          Create Template
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : customTemplates.length === 0 ? (
                  <Card className="bg-card/50 backdrop-blur-sm border-dashed">
                    <CardContent className="flex flex-col items-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No custom templates yet. Duplicate a system template or create your own.
                      </p>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href={`/dashboard/templates/new?type=${activeTab}`}>
                          <Plus className="h-4 w-4" />
                          Create Custom Template
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {customTemplates.map((template, index) => (
                      <Link
                        key={template.id}
                        href={`/dashboard/templates/${template.id}`}
                        className="block animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${(systemTemplates.length + index) * 50}ms`, animationFillMode: "backwards" }}
                      >
                        <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:border-border hover:shadow-lg hover:-translate-y-0.5 group h-full">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary transition-transform group-hover:scale-110">
                                  <FileCode className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                      {template.name}
                                    </h3>
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                                  </div>
                                  {template.isDefault && (
                                    <Badge variant="default" className="mt-1">
                                      <Star className="h-3 w-3 mr-1" />
                                      Default
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {template.description && (
                              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                                {template.description}
                              </p>
                            )}
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <span className="text-xs text-muted-foreground">
                                Updated {formatDate(template.updatedAt)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}