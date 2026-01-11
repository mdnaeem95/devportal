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
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";
import { ArrowLeft, Loader2, Plus, Trash2, FileText, ChevronDown, Calculator } from "lucide-react";

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  projectId: z.string().optional(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  lineItems: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      unitPrice: z.number().min(0, "Price must be positive"),
      amount: z.number(),
    })
  ).min(1, "Add at least one line item"),
  taxRate: z.number().min(0).max(100).optional(),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  currency: z.string().default("USD"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("client");
  const preselectedProjectId = searchParams.get("project");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clients } = trpc.client.list.useQuery();
  const { data: projects } = trpc.project.list.useQuery();
  const { data: nextNumber } = trpc.invoice.getNextNumber.useQuery();

  // Default due date: 14 days from now
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: preselectedClientId || "",
      projectId: preselectedProjectId || "",
      invoiceNumber: "",
      lineItems: [
        { id: nanoid(), description: "", quantity: 1, unitPrice: 0, amount: 0 },
      ],
      taxRate: 0,
      dueDate: defaultDueDate.toISOString().split("T")[0],
      currency: "USD",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // Set invoice number when loaded
  useEffect(() => {
    if (nextNumber) {
      setValue("invoiceNumber", nextNumber);
    }
  }, [nextNumber, setValue]);

  // Watch values for calculations
  const lineItems = watch("lineItems");
  const taxRate = watch("taxRate") || 0;
  const selectedClientId = watch("clientId");

  // Filter projects by selected client
  const clientProjects = projects?.filter(p => p.clientId === selectedClientId) || [];

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  // Update line item amount when quantity or price changes
  const updateLineItemAmount = (index: number) => {
    const item = lineItems[index];
    if (item) {
      const amount = Math.round(item.quantity * item.unitPrice * 100) / 100;
      setValue(`lineItems.${index}.amount`, amount);
    }
  };

  const createInvoice = trpc.invoice.create.useMutation({
    onSuccess: (invoice) => {
      router.push(`/dashboard/invoices/${invoice.id}`);
    },
    onError: (error) => {
      console.error("Failed to create invoice:", error);
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    
    // Convert prices to cents
    const lineItemsInCents = data.lineItems.map(item => ({
      ...item,
      unitPrice: Math.round(item.unitPrice * 100),
      amount: Math.round(item.amount * 100),
    }));

    createInvoice.mutate({
      ...data,
      lineItems: lineItemsInCents,
      dueDate: new Date(data.dueDate),
      projectId: data.projectId || undefined,
    });
  };

  const addLineItem = () => {
    append({ id: nanoid(), description: "", quantity: 1, unitPrice: 0, amount: 0 });
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
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Invoice Details */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Client */}
                  <div className="space-y-2">
                    <Label>Client <span className="text-destructive">*</span></Label>
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

                  {/* Invoice Number */}
                  <div className="space-y-2">
                    <Label>Invoice Number <span className="text-destructive">*</span></Label>
                    <Input
                      {...register("invoiceNumber")}
                      className={cn("font-mono", errors.invoiceNumber && "border-destructive")}
                    />
                    {errors.invoiceNumber && (
                      <p className="text-sm text-destructive">{errors.invoiceNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Project (optional) */}
                  <div className="space-y-2">
                    <Label>Project (optional)</Label>
                    <div className="relative">
                      <select
                        {...register("projectId")}
                        disabled={!selectedClientId}
                        className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                      >
                        <option value="">No project</option>
                        {clientProjects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label>Due Date <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      {...register("dueDate")}
                      className={errors.dueDate ? "border-destructive" : ""}
                    />
                    {errors.dueDate && (
                      <p className="text-sm text-destructive">{errors.dueDate.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Line Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-border/50 bg-secondary/30 p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-12">
                      {/* Description */}
                      <div className="sm:col-span-5 space-y-1">
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <Input
                          placeholder="Service description..."
                          {...register(`lineItems.${index}.description`)}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          {...register(`lineItems.${index}.quantity`, {
                            valueAsNumber: true,
                            onChange: () => updateLineItemAmount(index),
                          })}
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Price ($)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register(`lineItems.${index}.unitPrice`, {
                            valueAsNumber: true,
                            onChange: () => updateLineItemAmount(index),
                          })}
                        />
                      </div>

                      {/* Amount */}
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Amount</Label>
                        <div className="flex h-10 items-center px-3 rounded-lg bg-secondary text-sm font-medium">
                          ${(lineItems[index]?.amount || 0).toFixed(2)}
                        </div>
                      </div>

                      {/* Delete */}
                      <div className="sm:col-span-1 flex items-end justify-end">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={addLineItem}
                >
                  <Plus className="h-4 w-4" />
                  Add Line Item
                </Button>

                {/* Totals */}
                <div className="mt-6 rounded-lg border border-border/50 bg-secondary/30 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Tax</span>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          className="h-7 w-16 text-center text-xs"
                          {...register("taxRate", { valueAsNumber: true })}
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <span>${(taxAmount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/50 pt-2 text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-success">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Notes (optional)</CardTitle>
                <CardDescription>Add any additional notes or payment instructions.</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  placeholder="Payment terms, bank details, thank you message..."
                  {...register("notes")}
                  rows={3}
                  className="flex w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" asChild>
                <Link href="/dashboard/invoices">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gradient-primary border-0"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}