"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, FileText, ChevronDown, Check, Sparkles } from "lucide-react";

const contractSchema = z.object({
  name: z.string().min(1, "Contract name is required"),
  clientId: z.string().min(1, "Please select a client"),
  projectId: z.string().optional(),
  templateId: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function NewContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("client");
  const preselectedProjectId = searchParams.get("project");

  const [step, setStep] = useState<"template" | "details">("template");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clients } = trpc.client.list.useQuery();
  const { data: projects } = trpc.project.list.useQuery();
  const { data: templates } = trpc.template.list.useQuery({ type: "contract" });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      name: "",
      clientId: preselectedClientId || "",
      projectId: preselectedProjectId || "",
      templateId: "",
    },
  });

  const selectedClientId = watch("clientId");
  const selectedProjectId = watch("projectId");

  // Filter projects by selected client
  const clientProjects = projects?.filter((p) => p.clientId === selectedClientId) || [];

  // Auto-populate contract name from project
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects?.find((p) => p.id === selectedProjectId);
      if (project) {
        setValue("name", `${project.name} - Agreement`);
      }
    }
  }, [selectedProjectId, projects, setValue]);

  const createFromTemplate = trpc.contract.createFromTemplate.useMutation({
    onSuccess: (contract) => {
      router.push(`/dashboard/contracts/${contract.id}`);
    },
    onError: (error) => {
      console.error("Failed to create contract:", error);
      setIsSubmitting(false);
    },
  });

  const createContract = trpc.contract.create.useMutation({
    onSuccess: (contract) => {
      router.push(`/dashboard/contracts/${contract.id}`);
    },
    onError: (error) => {
      console.error("Failed to create contract:", error);
      setIsSubmitting(false);
    },
  });

  const handleTemplateSelect = (templateId: string | null) => {
    setSelectedTemplateId(templateId);
    setValue("templateId", templateId || "");
  };

  const onSubmit = async (data: ContractFormData) => {
    setIsSubmitting(true);

    if (selectedTemplateId) {
      createFromTemplate.mutate({
        templateId: selectedTemplateId,
        clientId: data.clientId,
        projectId: data.projectId || undefined,
        name: data.name,
      });
    } else {
      // Create blank contract
      createContract.mutate({
        name: data.name,
        clientId: data.clientId,
        projectId: data.projectId || undefined,
        content: `# ${data.name}\n\nStart writing your contract here...`,
      });
    }
  };

  const systemTemplates = templates?.filter((t) => t.isSystem) || [];
  const customTemplates = templates?.filter((t) => !t.isSystem) || [];

  return (
    <>
      <Header
        title="New Contract"
        action={
          <Button variant="ghost" asChild>
            <Link href="/dashboard/contracts">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setStep("template")}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                step === "template"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-xs">
                1
              </span>
              Choose Template
            </button>
            <div className="h-px w-8 bg-border" />
            <button
              onClick={() => step === "details" && setStep("details")}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                step === "details"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-xs">
                2
              </span>
              Contract Details
            </button>
          </div>

          {step === "template" && (
            <div className="space-y-6">
              {/* Blank Contract Option */}
              <Card
                className={cn(
                  "bg-card/50 backdrop-blur-sm cursor-pointer transition-all",
                  selectedTemplateId === null
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-border"
                )}
                onClick={() => handleTemplateSelect(null)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Blank Contract</h3>
                        <p className="text-sm text-muted-foreground">
                          Start from scratch with a blank document
                        </p>
                      </div>
                    </div>
                    {selectedTemplateId === null && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Templates */}
              {systemTemplates.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Built-in Templates
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {systemTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={cn(
                          "bg-card/50 backdrop-blur-sm cursor-pointer transition-all",
                          selectedTemplateId === template.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "hover:border-border"
                        )}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              {template.description && (
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                  {template.description}
                                </p>
                              )}
                            </div>
                            {selectedTemplateId === template.id && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shrink-0">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Templates */}
              {customTemplates.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                    Your Templates
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {customTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={cn(
                          "bg-card/50 backdrop-blur-sm cursor-pointer transition-all",
                          selectedTemplateId === template.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "hover:border-border"
                        )}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              {template.description && (
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                  {template.description}
                                </p>
                              )}
                            </div>
                            {selectedTemplateId === template.id && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shrink-0">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setStep("details")} className="gradient-primary border-0">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === "details" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Contract Details</CardTitle>
                  <CardDescription>
                    {selectedTemplateId
                      ? `Using template: ${templates?.find((t) => t.id === selectedTemplateId)?.name}`
                      : "Creating a blank contract"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client */}
                  <div className="space-y-2">
                    <Label>
                      Client <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <select
                        {...register("clientId")}
                        className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select a client...</option>
                        {clients?.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name} {client.company ? `(${client.company})` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    {errors.clientId && (
                      <p className="text-sm text-destructive">{errors.clientId.message}</p>
                    )}
                  </div>

                  {/* Project (optional) */}
                  <div className="space-y-2">
                    <Label>Project (optional)</Label>
                    <div className="relative">
                      <select
                        {...register("projectId")}
                        disabled={!selectedClientId}
                        className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                      >
                        <option value="">No project (standalone contract)</option>
                        {clientProjects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Link to a project to auto-fill milestones and amounts
                    </p>
                  </div>

                  {/* Contract Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Contract Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Website Redesign Agreement"
                      {...register("name")}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep("template")}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gradient-primary border-0">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Creating..." : "Create Contract"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}