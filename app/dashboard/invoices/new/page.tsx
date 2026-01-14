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
import { Skeleton } from "@/components/dashboard/skeleton";
import { AnimatedCurrency } from "@/components/dashboard/animated-number";
import { InvoiceFromTime } from "@/components/invoices/invoice-from-time";
import { trpc } from "@/lib/trpc";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2, FileText, DollarSign, Calendar, ChevronDown, Check,
  Sparkles, Percent, Clock, PenLine } from "lucide-react";

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  projectId: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  currency: z.string().default("USD"),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Price must be positive"),
      })
    )
    .min(1, "At least one line item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

type CreationMode = "manual" | "from-time";

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "SGD", label: "SGD (S$)" },
  { value: "AUD", label: "AUD (A$)" },
  { value: "CAD", label: "CAD (C$)" },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("client");
  const preselectedProjectId = searchParams.get("project");
  const preselectedMilestoneId = searchParams.get("milestone");
  const fromTimeParam = searchParams.get("from") === "time";

  const [creationMode, setCreationMode] = useState<CreationMode>(fromTimeParam ? "from-time" : "manual");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clients, isLoading: clientsLoading } = trpc.clients.list.useQuery();
  const { data: projects, isLoading: projectsLoading } = trpc.project.list.useQuery();

  // Get default due date (14 days from now)
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);
  const formattedDueDate = defaultDueDate.toISOString().split("T")[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: preselectedClientId || "",
      projectId: preselectedProjectId || "",
      dueDate: formattedDueDate,
      currency: "USD",
      taxRate: 0,
      notes: "",
      lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // Set preselected values when data loads
  useEffect(() => {
    if (preselectedClientId && clients) {
      setValue("clientId", preselectedClientId);
    }
    if (preselectedProjectId && projects) {
      setValue("projectId", preselectedProjectId);
    }
  }, [preselectedClientId, preselectedProjectId, clients, projects, setValue]);

  const watchClientId = watch("clientId");
  const watchProjectId = watch("projectId");
  const watchLineItems = watch("lineItems");
  const watchTaxRate = watch("taxRate") || 0;
  const watchCurrency = watch("currency");

  const selectedClient = clients?.find((c) => c.id === watchClientId);
  const selectedProject = projects?.find((p) => p.id === watchProjectId);

  // Filter projects by selected client
  const clientProjects = projects?.filter((p) => p.clientId === watchClientId);

  // Calculate totals
  const subtotal = watchLineItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0) * 100;
  }, 0);
  const taxAmount = Math.round(subtotal * (watchTaxRate / 100));
  const total = subtotal + taxAmount;

  const createInvoice = trpc.invoice.create.useMutation({
    onSuccess: (invoice) => {
      toast.success("Invoice created successfully!");
      router.push(`/dashboard/invoices/${invoice.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create invoice");
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);

    const invoiceData = {
      clientId: data.clientId,
      projectId: data.projectId || undefined,
      dueDate: new Date(data.dueDate),
      currency: data.currency,
      taxRate: data.taxRate || undefined,
      notes: data.notes || undefined,
      lineItems: data.lineItems.map((item, index) => {
        const unitPriceCents = Math.round(item.unitPrice * 100);
        const amount = item.quantity * unitPriceCents;
        return {
          id: `item-${Date.now()}-${index}`,
          description: item.description,
          quantity: item.quantity,
          unitPrice: unitPriceCents,
          amount,
        };
      }),
    };

    createInvoice.mutate(invoiceData);
  };

  const addLineItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0 });
  };

  return (
    <>
      <Header
        title="New Invoice"
        action={
          <Button variant="ghost" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          {/* Creation Mode Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 rounded-xl bg-secondary/50 border border-border/50">
              <button
                type="button"
                onClick={() => setCreationMode("manual")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                  creationMode === "manual"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <PenLine className="h-4 w-4" />
                Manual Invoice
              </button>
              <button
                type="button"
                onClick={() => setCreationMode("from-time")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                  creationMode === "from-time"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="h-4 w-4" />
                From Time Entries
              </button>
            </div>
          </div>

          {/* From Time Mode */}
          {creationMode === "from-time" && (
            <InvoiceFromTime
              clientId={preselectedClientId || undefined}
              projectId={preselectedProjectId || undefined}
            />
          )}

          {/* Manual Mode */}
          {creationMode === "manual" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Invoice Details */}
              <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20">
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    Invoice Details
                  </CardTitle>
                  <CardDescription>Select the client and project for this invoice.</CardDescription>
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
                      <div className="relative">
                        <select
                          id="clientId"
                          {...register("clientId")}
                          className={cn(
                            "flex h-10 w-full appearance-none rounded-lg border bg-secondary/50 px-3 py-2 text-sm transition-all focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20",
                            errors.clientId
                              ? "border-destructive focus:ring-destructive/20"
                              : "border-border/50 focus:border-primary/50",
                            watchClientId && "border-primary/50 bg-primary/5"
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
                  </div>

                  {/* Project Selection (optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Project (optional)</Label>
                    <div className="relative">
                      <select
                        id="projectId"
                        {...register("projectId")}
                        disabled={!watchClientId}
                        className={cn(
                          "flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-all focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <option value="">No project (general invoice)</option>
                        {clientProjects?.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Due Date & Currency Row */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">
                        Due Date <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="dueDate"
                          type="date"
                          className={cn("pl-9", errors.dueDate && "border-destructive")}
                          {...register("dueDate")}
                        />
                      </div>
                      {errors.dueDate && (
                        <p className="text-sm text-destructive">{errors.dueDate.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <div className="relative">
                        <select
                          id="currency"
                          {...register("currency")}
                          className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-all focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {currencies.map((currency) => (
                            <option key={currency.value} value={currency.value}>
                              {currency.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                          <DollarSign className="h-4 w-4 text-green-500" />
                        </div>
                        Line Items
                      </CardTitle>
                      <CardDescription>Add items to be billed on this invoice.</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                      <p className="text-2xl font-bold text-green-500">
                        <AnimatedCurrency value={total} currency={watchCurrency} />
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={cn(
                        "group rounded-lg border bg-secondary/20 p-4 transition-all duration-200",
                        watchLineItems[index]?.description
                          ? "border-border/50"
                          : "border-dashed border-border"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors shrink-0",
                            watchLineItems[index]?.description
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Description <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              placeholder="e.g., Website development, Design work, Consulting"
                              {...register(`lineItems.${index}.description`)}
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                placeholder="1"
                                {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Unit Price</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="pl-9"
                                  {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Amount</Label>
                              <div className="flex h-10 items-center rounded-lg bg-secondary/50 px-3 font-medium">
                                {formatCurrency(
                                  (watchLineItems[index]?.quantity || 0) *
                                    (watchLineItems[index]?.unitPrice || 0) *
                                    100,
                                  watchCurrency
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 shrink-0"
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
                    className="w-full border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={addLineItem}
                  >
                    <Plus className="h-4 w-4" />
                    Add Line Item
                  </Button>

                  {/* Totals Summary */}
                  <div className="flex justify-end pt-4 border-t border-border/50">
                    <div className="w-72 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatCurrency(subtotal, watchCurrency)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Tax</span>
                          <div className="relative w-20">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="0"
                              className="h-7 text-xs pr-6"
                              {...register("taxRate", { valueAsNumber: true })}
                            />
                            <Percent className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </div>
                        <span className="font-medium">{formatCurrency(taxAmount, watchCurrency)}</span>
                      </div>
                      <div className="flex justify-between border-t border-border/50 pt-3 text-lg font-bold">
                        <span>Total</span>
                        <span className="text-green-500">{formatCurrency(total, watchCurrency)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20">
                  <CardTitle className="text-base">Notes (optional)</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <textarea
                    placeholder="Any additional notes for the client (payment instructions, thank you message, etc.)"
                    rows={3}
                    className="flex w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    {...register("notes")}
                  />
                </CardContent>
              </Card>

              {/* Tip */}
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Tip:</span> After creating the
                  invoice, you can send it directly to your client via email with a payment link.
                </p>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="text-sm text-muted-foreground">
                  {isDirty ? (
                    <span className="text-primary">Unsaved changes</span>
                  ) : (
                    <span>Fill in the invoice details above</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="ghost" asChild>
                    <Link href="/dashboard/invoices">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || clientsLoading}
                    className="gradient-primary border-0 min-w-35"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Create Invoice
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}