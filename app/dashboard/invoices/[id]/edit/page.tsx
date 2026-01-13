"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { trpc } from "@/lib/trpc";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2, FileText, DollarSign, Calendar, Check, Percent, AlertTriangle } from "lucide-react";

const invoiceSchema = z.object({
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  lineItems: z
    .array(
      z.object({
        id: z.string(),
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Price must be positive"),
      })
    )
    .min(1, "At least one line item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: invoice, isLoading } = trpc.invoice.get.useQuery({ id: invoiceId });

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      dueDate: "",
      taxRate: 0,
      notes: "",
      lineItems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // Populate form when invoice loads
  useEffect(() => {
    if (invoice) {
      const existingLineItems = invoice.lineItems as Array<{
        id: string;
        description: string;
        quantity: number;
        unitPrice: number;
        amount: number;
      }>;

      reset({
        dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
        taxRate: invoice.taxRate ? parseFloat(invoice.taxRate) : 0,
        notes: invoice.notes || "",
        lineItems: existingLineItems.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice / 100, // Convert from cents to dollars for display
        })),
      });
    }
  }, [invoice, reset]);

  const watchLineItems = watch("lineItems");
  const watchTaxRate = watch("taxRate") || 0;
  const currency = invoice?.currency ?? "USD";

  // Calculate totals
  const subtotal = watchLineItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0) * 100;
  }, 0);
  const taxAmount = Math.round(subtotal * (watchTaxRate / 100));
  const total = subtotal + taxAmount;

  const utils = trpc.useUtils();

  const updateInvoice = trpc.invoice.update.useMutation({
    onSuccess: () => {
      toast.success("Invoice updated successfully!");
      utils.invoice.get.invalidate({ id: invoiceId });
      router.push(`/dashboard/invoices/${invoiceId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update invoice");
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);

    const invoiceData = {
      id: invoiceId,
      dueDate: new Date(data.dueDate),
      taxRate: data.taxRate || undefined,
      notes: data.notes || undefined,
      lineItems: data.lineItems.map((item) => {
        const unitPriceCents = Math.round(item.unitPrice * 100);
        const amount = item.quantity * unitPriceCents;
        return {
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: unitPriceCents,
          amount,
        };
      }),
    };

    updateInvoice.mutate(invoiceData);
  };

  const addLineItem = () => {
    append({
      id: `item-${Date.now()}-${fields.length}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
    });
  };

  if (isLoading) {
    return (
      <>
        <Header title="Edit Invoice" />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <Header title="Invoice Not Found" />
        <div className="flex-1 overflow-auto p-6">
          <Card className="mx-auto max-w-md bg-card/50">
            <CardContent className="flex flex-col items-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Invoice not found</h3>
              <p className="mt-2 text-muted-foreground">
                This invoice doesn't exist or was deleted.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/dashboard/invoices">Back to Invoices</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Only allow editing draft invoices
  if (invoice.status !== "draft") {
    return (
      <>
        <Header title="Cannot Edit Invoice" />
        <div className="flex-1 overflow-auto p-6">
          <Card className="mx-auto max-w-md bg-card/50">
            <CardContent className="flex flex-col items-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/20">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Cannot edit this invoice</h3>
              <p className="mt-2 text-center text-muted-foreground max-w-xs">
                Only draft invoices can be edited. This invoice has already been sent.
              </p>
              <Button className="mt-6" asChild>
                <Link href={`/dashboard/invoices/${invoiceId}`}>View Invoice</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={`Edit ${invoice.invoiceNumber}`}
        description={`Invoice for ${invoice.client.name}`}
        action={
          <Button variant="ghost" asChild>
            <Link href={`/dashboard/invoices/${invoiceId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Invoice Info (Read-only) */}
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-secondary/20">
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  Invoice Details
                </CardTitle>
                <CardDescription>
                  Client and project cannot be changed after creation.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Client</Label>
                    <p className="font-medium">{invoice.client.name}</p>
                    <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
                  </div>
                  {invoice.project && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Project</Label>
                      <p className="font-medium">{invoice.project.name}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">
                      Due Date <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative max-w-xs">
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
                    <CardDescription>Update the items on this invoice.</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                    <p className="text-2xl font-bold text-green-500">
                      <AnimatedCurrency value={total} currency={currency} />
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
                                currency
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
                      <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
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
                      <span className="font-medium">{formatCurrency(taxAmount, currency)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/50 pt-3 text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-500">{formatCurrency(total, currency)}</span>
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

            {/* Submit */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/50 p-4">
              <div className="text-sm text-muted-foreground">
                {isDirty ? (
                  <span className="text-primary">Unsaved changes</span>
                ) : (
                  <span>No changes made</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" asChild>
                  <Link href={`/dashboard/invoices/${invoiceId}`}>Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="gradient-primary border-0 min-w-35"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}