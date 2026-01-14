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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/dashboard/skeleton";
import { AnimatedCurrency } from "@/components/dashboard/animated-number";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Plus, Trash2, FolderKanban, DollarSign, Calendar as CalendarIcon, ChevronDown, Check, Users, Sparkles, UserPlus } from "lucide-react";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  clientId: z.string().min(1, "Please select a client"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  milestones: z.array(
    z.object({
      name: z.string().min(1, "Milestone name is required"),
      description: z.string().optional(),
      amount: z.number().min(0, "Amount must be positive"),
      dueDate: z.date().optional(),
    })
  ).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const newClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  company: z.string().optional(),
});

type NewClientFormData = z.infer<typeof newClientSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("client");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState<NewClientFormData>({ name: "", email: "", company: "" });
  const [newClientErrors, setNewClientErrors] = useState<Partial<Record<keyof NewClientFormData, string>>>({});

  const utils = trpc.useUtils();
  const { data: clients, isLoading: clientsLoading } = trpc.clients.list.useQuery();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      clientId: preselectedClientId || "",
      milestones: [
        { name: "", description: "", amount: 0 },
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
  const selectedClientId = watch("clientId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const selectedClient = clients?.find((c) => c.id === selectedClientId);
  const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);

  // Count valid milestones (with names)
  const validMilestones = milestones.filter((m) => m.name?.trim()).length;

  const createProject = trpc.project.create.useMutation({
    onSuccess: (project) => {
      toast.success("Project created successfully!");
      router.push(`/dashboard/projects/${project.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
      setIsSubmitting(false);
    },
  });

  const createClient = trpc.clients.create.useMutation({
    onSuccess: (client) => {
      toast.success("Client created!");
      utils.clients.list.invalidate();
      setValue("clientId", client.id);
      setIsNewClientDialogOpen(false);
      setNewClientForm({ name: "", email: "", company: "" });
      setNewClientErrors({});
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create client");
    },
  });

  const handleCreateClient = () => {
    const result = newClientSchema.safeParse(newClientForm);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof NewClientFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof NewClientFormData] = err.message;
        }
      });
      setNewClientErrors(fieldErrors);
      return;
    }
    setNewClientErrors({});
    createClient.mutate(result.data);
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    
    const projectData = {
      name: data.name,
      description: data.description,
      clientId: data.clientId,
      startDate: data.startDate,
      endDate: data.endDate,
      milestones: data.milestones
        ?.filter((m) => m.name.trim() !== "")
        .map((m) => ({
          name: m.name,
          description: m.description,
          amount: Math.round(m.amount * 100),
          dueDate: m.dueDate,
        })),
    };

    createProject.mutate(projectData);
  };

  const addMilestone = () => {
    append({ name: "", description: "", amount: 0 });
  };

  return (
    <>
      <Header
        title="New Project"
        action={
          <Button variant="ghost" className="cursor-pointer hover:bg-secondary" asChild>
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
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-secondary/20">
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <FolderKanban className="h-4 w-4 text-primary" />
                  </div>
                  Project Details
                </CardTitle>
                <CardDescription>
                  Basic information about the project.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Client Selection */}
                <div className="space-y-2">
                  <Label htmlFor="clientId">
                    Client <span className="text-destructive">*</span>
                  </Label>
                  {clientsLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select
                          id="clientId"
                          {...register("clientId")}
                          className={cn(
                            "flex h-10 w-full cursor-pointer appearance-none rounded-lg border bg-secondary/50 px-3 py-2 text-sm transition-all focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20",
                            errors.clientId
                              ? "border-destructive focus:ring-destructive/20"
                              : "border-border/50 focus:border-primary/50",
                            selectedClientId && "border-primary/50 bg-primary/5"
                          )}
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
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer shrink-0 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                        onClick={() => setIsNewClientDialogOpen(true)}
                      >
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Client</span>
                      </Button>
                    </div>
                  )}
                  {errors.clientId && (
                    <p className="text-sm text-destructive">{errors.clientId.message}</p>
                  )}
                  {selectedClient && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1">
                      <Check className="h-3 w-3 text-primary" />
                      <span>{selectedClient.email}</span>
                    </div>
                  )}
                  {!clientsLoading && clients?.length === 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">No clients yet.</span>
                      <button
                        type="button"
                        onClick={() => setIsNewClientDialogOpen(true)}
                        className="text-primary hover:underline font-medium cursor-pointer"
                      >
                        Add a client first →
                      </button>
                    </div>
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
                    className={cn(
                      errors.name && "border-destructive focus:ring-destructive/20"
                    )}
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
                    className="flex w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                {/* Dates */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal cursor-pointer hover:bg-secondary transition-colors",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => setValue("startDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      End Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal cursor-pointer hover:bg-secondary transition-colors",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => setValue("endDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-secondary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                        <DollarSign className="h-4 w-4 text-green-500" />
                      </div>
                      Milestones
                    </CardTitle>
                    <CardDescription>
                      Break down the project into billable milestones.
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Total Value
                    </p>
                    <p className="text-2xl font-bold text-green-500">
                      <AnimatedCurrency value={totalAmount * 100} />
                    </p>
                    {validMilestones > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {validMilestones} milestone{validMilestones !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={cn(
                      "group rounded-lg border bg-secondary/20 p-4 transition-all duration-200",
                      milestones[index]?.name
                        ? "border-border/50"
                        : "border-dashed border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                          milestones[index]?.name
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Milestone Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              placeholder="e.g., Design Phase, Development, Launch"
                              {...register(`milestones.${index}.name`)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Amount ($)
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-9"
                                {...register(`milestones.${index}.amount`, {
                                  valueAsNumber: true,
                                })}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Description
                            </Label>
                            <Input
                              placeholder="What's included in this milestone..."
                              {...register(`milestones.${index}.description`)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Due Date
                            </Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal cursor-pointer hover:bg-secondary transition-colors h-10",
                                    !milestones[index]?.dueDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {milestones[index]?.dueDate 
                                    ? format(milestones[index].dueDate!, "PPP") 
                                    : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={milestones[index]?.dueDate}
                                  onSelect={(date) => setValue(`milestones.${index}.dueDate`, date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
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
                  className="w-full cursor-pointer border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
                  onClick={addMilestone}
                >
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </Button>

                {/* Quick tip */}
                <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Tip:</span> Milestones help you track progress and bill incrementally. You can create invoices directly from milestones later.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/50 p-4">
              <div className="text-sm text-muted-foreground">
                {isDirty ? (
                  <span className="text-primary">Unsaved changes</span>
                ) : (
                  <span>Fill in the project details above</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="cursor-pointer hover:bg-secondary transition-colors"
                  asChild
                >
                  <Link href="/dashboard/projects">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || clientsLoading}
                  className="cursor-pointer gradient-primary border-0 min-w-35 transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* New Client Dialog */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Client
            </DialogTitle>
            <DialogDescription>
              Create a new client to associate with this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="client-name"
                placeholder="Client name"
                value={newClientForm.name}
                onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                className={cn(newClientErrors.name && "border-destructive")}
              />
              {newClientErrors.name && (
                <p className="text-sm text-destructive">{newClientErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="client-email"
                type="email"
                placeholder="client@example.com"
                value={newClientForm.email}
                onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                className={cn(newClientErrors.email && "border-destructive")}
              />
              {newClientErrors.email && (
                <p className="text-sm text-destructive">{newClientErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-company">Company</Label>
              <Input
                id="client-company"
                placeholder="Company name (optional)"
                value={newClientForm.company}
                onChange={(e) => setNewClientForm({ ...newClientForm, company: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => setIsNewClientDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateClient} 
              disabled={createClient.isPending}
              className="cursor-pointer transition-all hover:shadow-md"
            >
              {createClient.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Client
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}