"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  FolderKanban,
  DollarSign,
  Calendar,
  GripVertical,
  ChevronDown,
} from "lucide-react";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  clientId: z.string().min(1, "Please select a client"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  milestones: z.array(
    z.object({
      name: z.string().min(1, "Milestone name is required"),
      description: z.string().optional(),
      amount: z.number().min(0, "Amount must be positive"),
      dueDate: z.string().optional(),
    })
  ).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("client");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMilestones, setShowMilestones] = useState(true);

  const { data: clients, isLoading: clientsLoading } = trpc.client.list.useQuery();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      clientId: preselectedClientId || "",
      milestones: [
        { name: "", description: "", amount: 0, dueDate: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  // Set preselected client when clients load
  useEffect(() => {
    if (preselectedClientId && clients) {
      setValue("clientId", preselectedClientId);
    }
  }, [preselectedClientId, clients, setValue]);

  const milestones = watch("milestones") || [];
  const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);

  const createProject = trpc.project.create.useMutation({
    onSuccess: (project) => {
      router.push(`/dashboard/projects/${project.id}`);
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    
    // Transform the data
    const projectData = {
      name: data.name,
      description: data.description,
      clientId: data.clientId,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      milestones: data.milestones
        ?.filter((m) => m.name.trim() !== "")
        .map((m) => ({
          name: m.name,
          description: m.description,
          amount: Math.round(m.amount * 100), // Convert to cents
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
        })),
    };

    createProject.mutate(projectData);
  };

  const addMilestone = () => {
    append({ name: "", description: "", amount: 0, dueDate: "" });
  };

  return (
    <>
      <Header
        title="New Project"
        action={
          <Button variant="ghost" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Details */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5" />
                  Project Details
                </CardTitle>
                <CardDescription>
                  Basic information about the project.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client Selection */}
                <div className="space-y-2">
                  <Label htmlFor="clientId">
                    Client <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="clientId"
                      {...register("clientId")}
                      className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
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
                  {clients?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No clients yet.{" "}
                      <Link href="/dashboard/clients/new" className="text-primary hover:underline">
                        Add a client first
                      </Link>
                    </p>
                  )}
                </div>

                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Project Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Website Redesign, Mobile App MVP"
                    {...register("name")}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    placeholder="Brief description of the project scope..."
                    {...register("description")}
                    rows={3}
                    className="flex w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Dates */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register("startDate")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register("endDate")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Milestones
                    </CardTitle>
                    <CardDescription>
                      Break down the project into billable milestones.
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-success">
                      {formatCurrency(totalAmount * 100)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-border/50 bg-secondary/30 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Milestone Name
                            </Label>
                            <Input
                              placeholder="e.g., Design Phase"
                              {...register(`milestones.${index}.name`)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Amount ($)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...register(`milestones.${index}.amount`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Description (optional)
                            </Label>
                            <Input
                              placeholder="What's included..."
                              {...register(`milestones.${index}.description`)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Due Date (optional)
                            </Label>
                            <Input
                              type="date"
                              {...register(`milestones.${index}.dueDate`)}
                            />
                          </div>
                        </div>
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={addMilestone}
                >
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </Button>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" asChild>
                <Link href="/dashboard/projects">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || clientsLoading}
                className="gradient-primary border-0"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}