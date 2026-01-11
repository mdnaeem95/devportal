"use client";

import { useState } from "react";
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
import { ArrowLeft, Loader2, FileText, Receipt } from "lucide-react";

const templateSchema = z.object({
  type: z.enum(["contract", "invoice"]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

type TemplateFormData = z.infer<typeof templateSchema>;

const defaultContractContent = `# {{project_name}} - Service Agreement

**Date:** {{date}}
**Client:** {{client_name}}
**Developer:** {{developer_name}}

## 1. Scope of Work

{{scope_description}}

## 2. Timeline

- **Start Date:** {{start_date}}
- **Estimated Completion:** {{end_date}}

## 3. Payment Terms

Total project cost: **{{total_amount}}**

Payment schedule:
{{milestones}}

## 4. Intellectual Property

Upon receipt of full payment, all intellectual property rights for the deliverables will be transferred to the Client, except for:
- Pre-existing code and libraries owned by the Developer
- Open-source components (subject to their respective licenses)

## 5. Confidentiality

Both parties agree to maintain confidentiality of proprietary information shared during this project.

## 6. Revisions & Changes

- Minor revisions are included in the project scope
- Major changes or additions will be quoted separately
- All change requests must be submitted in writing

## 7. Warranty

The Developer warrants that the deliverables will function as specified for **30 days** after project completion. Bug fixes during this period are included at no additional cost.

## 8. Termination

Either party may terminate this agreement with **14 days** written notice. Upon termination:
- Client pays for all work completed to date
- Developer delivers all completed work

---

**Client Signature:** _________________________ **Date:** _________

**Developer Signature:** _________________________ **Date:** _________
`;

const defaultInvoiceContent = `# Invoice {{invoice_number}}

**From:**
{{developer_name}}
{{developer_address}}
{{developer_email}}

**To:**
{{client_name}}
{{client_company}}
{{client_email}}

**Invoice Date:** {{invoice_date}}
**Due Date:** {{due_date}}

---

## Items

| Description | Quantity | Rate | Amount |
|-------------|----------|------|--------|
{{line_items}}

---

**Subtotal:** {{subtotal}}
**Tax ({{tax_rate}}%):** {{tax_amount}}
**Total Due:** {{total}}

---

## Payment Instructions

{{payment_instructions}}

Thank you for your business!
`;

export default function NewTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as "contract" | "invoice" | null;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      type: typeParam || "contract",
      name: "",
      description: "",
      content: typeParam === "invoice" ? defaultInvoiceContent : defaultContractContent,
    },
  });

  const selectedType = watch("type");

  // Update default content when type changes
  const handleTypeChange = (type: "contract" | "invoice") => {
    setValue("type", type);
    setValue("content", type === "invoice" ? defaultInvoiceContent : defaultContractContent);
  };

  const createTemplate = trpc.template.create.useMutation({
    onSuccess: (template) => {
      router.push(`/dashboard/templates/${template.id}`);
    },
    onError: (error) => {
      console.error("Failed to create template:", error);
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    createTemplate.mutate(data);
  };

  return (
    <>
      <Header
        title="New Template"
        action={
          <Button variant="ghost" asChild>
            <Link href="/dashboard/templates">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Template Info */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
                <CardDescription>
                  Create a reusable template for contracts or invoices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Selection */}
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTypeChange("contract")}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 transition-all text-left",
                        selectedType === "contract"
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-border hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        selectedType === "contract" ? "gradient-primary" : "bg-secondary"
                      )}>
                        <FileText className={cn(
                          "h-5 w-5",
                          selectedType === "contract" ? "text-white" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">Contract</p>
                        <p className="text-xs text-muted-foreground">Legal agreements</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange("invoice")}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 transition-all text-left",
                        selectedType === "invoice"
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-border hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        selectedType === "invoice" ? "gradient-primary" : "bg-secondary"
                      )}>
                        <Receipt className={cn(
                          "h-5 w-5",
                          selectedType === "invoice" ? "text-white" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">Invoice</p>
                        <p className="text-xs text-muted-foreground">Billing documents</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Template Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Web Development Agreement"
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
                  <Input
                    id="description"
                    placeholder="Brief description of when to use this template"
                    {...register("description")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Template Content */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Template Content</CardTitle>
                <CardDescription>
                  Use Markdown formatting. Variables like {"{{client_name}}"} will be replaced when used.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="content">
                    Content <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    id="content"
                    {...register("content")}
                    rows={20}
                    className={cn(
                      "flex w-full rounded-lg border bg-secondary/50 px-3 py-2 text-sm font-mono transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20",
                      errors.content ? "border-destructive" : "border-border/50"
                    )}
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive">{errors.content.message}</p>
                  )}
                </div>

                {/* Variable Reference */}
                <div className="mt-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
                  <p className="text-sm font-medium mb-2">Available Variables</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedType === "contract" ? (
                      <>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{project_name}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{client_name}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{developer_name}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{date}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{start_date}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{end_date}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{total_amount}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{milestones}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{scope_description}}"}</code>
                      </>
                    ) : (
                      <>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{invoice_number}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{client_name}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{client_company}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{invoice_date}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{due_date}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{line_items}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{subtotal}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{tax_rate}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{total}}"}</code>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" asChild>
                <Link href="/dashboard/templates">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gradient-primary border-0"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}