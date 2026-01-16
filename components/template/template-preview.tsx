"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";
import { interpolateTemplate, extractVariables, getSampleVariables, buildVariablesFromData, getVariablesForType, type TemplateVariables } from "@/lib/template/template-preview";
import { cn } from "@/lib/utils";
import { Eye, Code, Sparkles, Users, FolderKanban, AlertTriangle, Check, ChevronDown } from "lucide-react";

interface TemplatePreviewProps {
  content: string;
  type: "contract" | "invoice";
  className?: string;
  defaultMode?: "raw" | "preview";
  showDataSourceSelector?: boolean;
}

type DataSource = "sample" | "client" | "project";

export function TemplatePreview({
  content,
  type,
  className,
  defaultMode = "preview",
  showDataSourceSelector = true,
}: TemplatePreviewProps) {
  const [mode, setMode] = useState<"raw" | "preview">(defaultMode);
  const [dataSource, setDataSource] = useState<DataSource>("sample");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Fetch clients and projects for real data preview
  const { data: clients } = trpc.clients.list.useQuery(undefined, {
    enabled: showDataSourceSelector && dataSource === "client",
  });
  
  const { data: projects } = trpc.project.list.useQuery(undefined, {
    enabled: showDataSourceSelector && dataSource === "project",
  });

  // Fetch selected client details
  const { data: selectedClient } = trpc.clients.get.useQuery(
    { id: selectedClientId },
    { enabled: !!selectedClientId && dataSource === "client" }
  );

  // Fetch selected project details
  const { data: selectedProject } = trpc.project.get.useQuery(
    { id: selectedProjectId },
    { enabled: !!selectedProjectId && dataSource === "project" }
  );

  // Fetch user settings for business info
  const { data: settings } = trpc.settings.get.useQuery();

  // Extract variables from content
  const usedVariables = useMemo(() => extractVariables(content), [content]);
  const availableVariables = useMemo(() => getVariablesForType(type), [type]);

  // Build variables based on data source
  const variables = useMemo((): TemplateVariables => {
    if (dataSource === "sample") {
      return getSampleVariables(type);
    }

    const baseData = {
      business: settings ? {
        name: settings.businessName || undefined,
        address: settings.businessAddress || undefined,
      } : undefined,
    };

    if (dataSource === "client" && selectedClient) {
      return buildVariablesFromData({
        ...baseData,
        client: {
          name: selectedClient.name,
          email: selectedClient.email,
          company: selectedClient.company || undefined,
        },
      });
    }

    if (dataSource === "project" && selectedProject) {
      return buildVariablesFromData({
        ...baseData,
        client: selectedProject.client ? {
          name: selectedProject.client.name,
          email: selectedProject.client.email,
          company: selectedProject.client.company || undefined,
        } : undefined,
        project: {
          name: selectedProject.name,
          description: selectedProject.description || undefined,
          totalAmount: selectedProject.totalAmount || undefined,
          milestones: selectedProject.milestones?.map(m => ({
            name: m.name,
            amount: m.amount || 0,
          })),
          startDate: selectedProject.startDate ? new Date(selectedProject.startDate) : undefined,
          endDate: selectedProject.endDate ? new Date(selectedProject.endDate) : undefined,
        },
      });
    }

    return getSampleVariables(type);
  }, [dataSource, selectedClient, selectedProject, settings, type]);

  // Interpolate content
  const previewContent = useMemo(() => {
    return interpolateTemplate(content, variables, true);
  }, [content, variables]);

  // Check which variables are filled
  const variableStatus = useMemo(() => {
    return usedVariables.map(varName => ({
      name: varName,
      filled: variables[varName] !== undefined && variables[varName] !== "",
      value: variables[varName],
    }));
  }, [usedVariables, variables]);

  const filledCount = variableStatus.filter(v => v.filled).length;
  const missingCount = variableStatus.filter(v => !v.filled).length;

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      <CardHeader className="border-b border-border/50 bg-secondary/20 py-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base">
            {mode === "raw" ? (
              <>
                <Code className="h-4 w-4" />
                Template Code
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Live Preview
              </>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Variable Status */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-8">
                  {missingCount > 0 ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  )}
                  <span className="text-xs">
                    {filledCount}/{usedVariables.length} vars
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Template Variables</h4>
                    <Badge variant={missingCount > 0 ? "secondary" : "default"} className={missingCount === 0 ? "bg-green-500/20 text-green-500" : ""}>
                      {filledCount}/{usedVariables.length} filled
                    </Badge>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-auto">
                    {variableStatus.map(({ name, filled, value }) => (
                      <div
                        key={name}
                        className={cn(
                          "flex items-center justify-between rounded-md px-2 py-1.5 text-xs",
                          filled ? "bg-green-500/10" : "bg-yellow-500/10"
                        )}
                      >
                        <code className="font-mono">{`{{${name}}}`}</code>
                        {filled ? (
                          <span className="text-muted-foreground truncate max-w-32" title={value}>
                            {value && value.length > 20 ? `${value.slice(0, 20)}...` : value}
                          </span>
                        ) : (
                          <span className="text-yellow-500 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Missing
                          </span>
                        )}
                      </div>
                    ))}
                    {usedVariables.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No variables found in template
                      </p>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Data Source Selector */}
            {showDataSourceSelector && mode === "preview" && (
              <Select
                value={dataSource}
                onValueChange={(v) => {
                  setDataSource(v as DataSource);
                  setSelectedClientId("");
                  setSelectedProjectId("");
                }}
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sample">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      Sample Data
                    </div>
                  </SelectItem>
                  <SelectItem value="client">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-blue-400" />
                      From Client
                    </div>
                  </SelectItem>
                  <SelectItem value="project">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-3.5 w-3.5 text-green-400" />
                      From Project
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Mode Toggle */}
            <div className="flex items-center rounded-lg bg-secondary p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode("raw")}
                className={cn(
                  "h-7 px-3 text-xs rounded-md",
                  mode === "raw" && "bg-background shadow-sm"
                )}
              >
                <Code className="h-3.5 w-3.5 mr-1.5" />
                Raw
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode("preview")}
                className={cn(
                  "h-7 px-3 text-xs rounded-md",
                  mode === "preview" && "bg-background shadow-sm"
                )}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Client/Project Selector */}
        {showDataSourceSelector && mode === "preview" && dataSource === "client" && (
          <div className="pt-3 border-t border-border/50 mt-3">
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Select client:
              </Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <span>{client.name}</span>
                        {client.company && (
                          <span className="text-muted-foreground">({client.company})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  {(!clients || clients.length === 0) && (
                    <SelectItem value="_none" disabled>
                      No clients found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {showDataSourceSelector && mode === "preview" && dataSource === "project" && (
          <div className="pt-3 border-t border-border/50 mt-3">
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Select project:
              </Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <span>{project.name}</span>
                        {project.client && (
                          <span className="text-muted-foreground">— {project.client.name}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  {(!projects || projects.length === 0) && (
                    <SelectItem value="_none" disabled>
                      No projects found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-125 overflow-auto">
          {mode === "raw" ? (
            <pre className="p-4 font-mono text-sm whitespace-pre-wrap">{content}</pre>
          ) : (
            <div className="p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {previewContent}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact variable reference component
 */
interface VariableReferenceProps {
  type: "contract" | "invoice";
  className?: string;
}

export function VariableReference({ type, className }: VariableReferenceProps) {
  const variables = getVariablesForType(type);

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Available Variables
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {variables.map(({ name, description, example }) => (
              <Tooltip key={name}>
                <TooltipTrigger asChild>
                  <code className="text-xs bg-secondary px-2 py-1 rounded font-mono cursor-help hover:bg-secondary/80 transition-colors">
                    {`{{${name}}}`}
                  </code>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-medium">{description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: {example}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        <p className="mt-3 text-xs text-muted-foreground">
          Hover over variables to see descriptions. Both <code className="bg-secondary/50 px-1 rounded">camelCase</code> and <code className="bg-secondary/50 px-1 rounded">snake_case</code> formats are supported (e.g., <code className="bg-secondary/50 px-1 rounded">clientName</code> or <code className="bg-secondary/50 px-1 rounded">client_name</code>).
        </p>
      </CardContent>
    </Card>
  );
}