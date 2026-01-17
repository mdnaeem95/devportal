"use client";

import { useState, useEffect, useMemo } from "react";
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
import { ArrowLeft, Loader2, Plus, Trash2, FileText, DollarSign, Calendar, ChevronDown, Sparkles,
  Percent, Clock, PenLine } from "lucide-react";

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

  const [creationMode, setCreationMode] = useState<CreationMode>(
    fromTimeParam ? "from-time" : "manual"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clients, isLoading: clientsLoading } = trpc.clients.list.useQuery();
  const { data: projects, isLoading: projectsLoading } = trpc.project.list.useQuery();
  const { data: settings, isLoading: settingsLoading } = trpc.settings.get.useQuery();

  // Calculate default due date based on payment terms
  const getDefaultDueDate = (paymentTermsDays: number) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);
    return dueDate.toISOString().split("T")[0];
  };

  // Compute default values from settings - only once settings are loaded
  const defaultValues = useMemo(() => {
    const paymentTerms = settings?.invoiceDefaults?.paymentTerms ?? 14;
    const taxRate = settings?.invoiceDefaults?.taxRate ?? 0;
    const notes = settings?.invoiceDefaults?.notes ?? "";
    const currency = settings?.currency ?? "USD";

    return {
      clientId: preselectedClientId || "",
      projectId: preselectedProjectId || "",
      dueDate: getDefaultDueDate(paymentTerms),
      currency,
      taxRate,
      notes,
      lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
    };
  }, [settings, preselectedClientId, preselectedProjectId]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // Reset form when settings load (to apply defaults)
  useEffect(() => {
    if (settings) {
      reset(defaultValues);
    }
  }, [settings, reset, defaultValues]);

  // Set preselected client/project when data loads
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
  const watchNotes = watch("notes");

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

    // Calculate minimum payment amount based on settings
    const allowPartial = settings?.invoiceDefaults?.allowPartialPayments ?? false;
    const minPercent = settings?.invoiceDefaults?.minimumPaymentPercent;
    const minimumPaymentAmount =
      allowPartial && minPercent ? Math.round((total * minPercent) / 100) : undefined;

    const invoiceData = {
      clientId: data.clientId,
      projectId: data.projectId || undefined,
      dueDate: new Date(data.dueDate),
      currency: data.currency,
      taxRate: data.taxRate || undefined,
      notes: data.notes || undefined,
      // Include partial payment settings from user preferences
      allowPartialPayments: allowPartial,
      minimumPaymentAmount,
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

  // Show skeleton while settings load (so we can apply defaults)
  if (settingsLoading) {
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
          <div className="mx-auto max-w-3xl space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </>
    );
  }

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
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Creation Mode Toggle */}
          <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setCreationMode("manual")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
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
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                creationMode === "from-time"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="h-4 w-4" />
              From Time Tracking
            </button>
          </div>

          {/* Settings Summary Banner */}
          {settings && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground p-3 bg-secondary/30 rounded-lg border border-border/50">
              <span className="font-medium text-foreground">Using your defaults:</span>
              <span>Net {settings.invoiceDefaults.paymentTerms} days</span>
              {settings.invoiceDefaults.taxRate ? (
                <span>• {settings.invoiceDefaults.taxRate}% tax</span>
              ) : (
                <span>• No tax</span>
              )}
              <span>• {settings.currency}</span>
              {settings.invoiceDefaults.allowPartialPayments && (
                <span>• Partial payments ({settings.invoiceDefaults.minimumPaymentPercent}% min)</span>
              )}
            </div>
          )}

          {/* From Time Tracking Mode */}
          {creationMode === "from-time" && (
            <InvoiceFromTime
              projectId={preselectedProjectId || undefined}
              clientId={preselectedClientId || undefined}
            />
          )}

          {/* Manual Invoice Mode */}
          {creationMode === "manual" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Client & Project Selection */}
              <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20">
                  <CardTitle className="text-base">Client & Project</CardTitle>
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
                            "flex h-10 w-full appearance-none rounded-lg border bg-secondary/50 px-3 py-2 text-sm transition-colors focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20",
                            errors.clientId
                              ? "border-destructive"
                              : "border-border/50 focus:border-primary/50"
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
                      <p className="text-xs text-destructive">{errors.clientId.message}</p>
                    )}
                  </div>

                  {/* Project Selection (optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Project (optional)</Label>
                    {projectsLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <div className="relative">
                        <select
                          id="projectId"
                          {...register("projectId")}
                          disabled={!watchClientId}
                          className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">No project selected</option>
                          {clientProjects?.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Details */}
              <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20">
                  <CardTitle className="text-base">Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Due Date */}
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">
                        Due Date <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="dueDate"
                          type="date"
                          className="pl-9"
                          {...register("dueDate")}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Auto-set from your default: Net {settings?.invoiceDefaults?.paymentTerms ?? 14} days
                      </p>
                    </div>

                    {/* Currency */}
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <div className="relative">
                        <select
                          id="currency"
                          {...register("currency")}
                          className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {currencies.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
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
                  <CardTitle className="text-base">Line Items</CardTitle>
                  <CardDescription>Add the items you're billing for</CardDescription>
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
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          {/* Description */}
                          <div className="space-y-1">
                            <Label htmlFor={`lineItems.${index}.description`} className="text-xs">
                              Description
                            </Label>
                            <Input
                              id={`lineItems.${index}.description`}
                              placeholder="e.g., Website Development - Homepage"
                              {...register(`lineItems.${index}.description`)}
                              className={cn(
                                errors.lineItems?.[index]?.description && "border-destructive"
                              )}
                            />
                            {errors.lineItems?.[index]?.description && (
                              <p className="text-xs text-destructive">
                                {errors.lineItems[index]?.description?.message}
                              </p>
                            )}
                          </div>

                          {/* Quantity & Price */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`lineItems.${index}.quantity`} className="text-xs">
                                Quantity
                              </Label>
                              <Input
                                id={`lineItems.${index}.quantity`}
                                type="number"
                                min="1"
                                step="1"
                                placeholder="1"
                                {...register(`lineItems.${index}.quantity`, {
                                  valueAsNumber: true,
                                })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`lineItems.${index}.unitPrice`} className="text-xs">
                                Unit Price ({watchCurrency})
                              </Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id={`lineItems.${index}.unitPrice`}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="pl-9"
                                  {...register(`lineItems.${index}.unitPrice`, {
                                    valueAsNumber: true,
                                  })}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Line total */}
                          {watchLineItems[index]?.unitPrice > 0 && (
                            <div className="text-right text-sm">
                              <span className="text-muted-foreground">Line total: </span>
                              <span className="font-medium">
                                {formatCurrency(
                                  (watchLineItems[index]?.quantity || 0) *
                                    (watchLineItems[index]?.unitPrice || 0) *
                                    100,
                                  watchCurrency
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Remove button */}
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
                    onClick={addLineItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Line Item
                  </Button>
                </CardContent>
              </Card>

              {/* Tax & Notes */}
              <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20">
                  <CardTitle className="text-base">Tax & Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Tax Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <div className="relative max-w-[200px]">
                      <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="taxRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                        className="pl-9"
                        {...register("taxRate", { valueAsNumber: true })}
                      />
                    </div>
                    {settings?.invoiceDefaults?.taxRate ? (
                      <p className="text-xs text-muted-foreground">
                        Auto-set from your default: {settings.invoiceDefaults.taxRate}%
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Leave at 0 for no tax
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes / Payment Instructions</Label>
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="Payment instructions, thank you message, etc."
                      className="flex w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      {...register("notes")}
                    />
                    {settings?.invoiceDefaults?.notes && (
                      <p className="text-xs text-muted-foreground">
                        Pre-filled from your default notes
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20">
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal, watchCurrency)}</span>
                    </div>
                    {watchTaxRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax ({watchTaxRate}%)</span>
                        <span>{formatCurrency(taxAmount, watchCurrency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                      <span>Total</span>
                      <AnimatedCurrency value={total} currency={watchCurrency} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Partial Payments Notice */}
              {settings?.invoiceDefaults?.allowPartialPayments && (
                <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm">
                  <DollarSign className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Partial payments enabled:</span>{" "}
                    Clients can pay a minimum of{" "}
                    {settings.invoiceDefaults.minimumPaymentPercent || 25}% of the invoice total.
                  </p>
                </div>
              )}

              {/* Tip */}
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Tip:</span> After creating the
                  invoice, you can send it directly to your client via email with a payment link.
                </p>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/invoices">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gradient-primary border-0 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Create Invoice
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}