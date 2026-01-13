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
import { toast } from "sonner";
import { ArrowLeft, Loader2, FileText, Receipt, Check, ChevronRight, Eye, PenLine, Sparkles, FileSignature } from "lucide-react";

const templateSchema = z.object({
  type: z.enum(["contract", "invoice"]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

type TemplateFormData = z.infer<typeof templateSchema>;

const defaultContractContent = `# Service Agreement

This Service Agreement ("Agreement") is entered into as of {{date}} between:

**Developer:** {{businessName}}
**Client:** {{clientName}}

## 1. Services

The Developer agrees to provide the following services:

{{projectDescription}}

## 2. Payment Terms

The total project cost is {{totalAmount}}, payable according to the following milestones:

{{milestones}}

## 3. Intellectual Property

Upon receipt of full payment, Developer assigns to Client all rights, title, and interest in the deliverables created specifically for this project.

Pre-existing code, libraries, and open-source components remain the property of their respective owners and are licensed to Client for use in the project.

## 4. Timeline

Work will commence upon signing of this agreement and receipt of any required deposit.

## 5. Revisions

This agreement includes up to two rounds of revisions. Additional revisions will be billed at the Developer's standard hourly rate.

## 6. Termination

Either party may terminate this agreement with 14 days written notice. Client will be responsible for payment of all work completed up to the termination date.

## 7. Confidentiality

Both parties agree to maintain confidentiality of proprietary information shared during the course of this project.

## 8. Warranty

The Developer warrants that the deliverables will function as specified for 30 days after project completion. Bug fixes during this period are included at no additional cost.

---

**Accepted and Agreed:**

Client Signature: _________________________

Date: _________________________
`;

const defaultInvoiceContent = `# Invoice {{invoiceNumber}}

**From:**
{{businessName}}
{{businessAddress}}

**To:**
{{clientName}}
{{clientCompany}}

**Invoice Date:** {{invoiceDate}}
**Due Date:** {{dueDate}}

---

## Items

| Description | Quantity | Rate | Amount |
|-------------|----------|------|--------|
{{lineItems}}

---

**Subtotal:** {{subtotal}}
**Tax ({{taxRate}}%):** {{taxAmount}}
**Total Due:** {{total}}

---

## Payment Methods

Please pay via the link provided in the email, or contact us for alternative payment arrangements.

Thank you for your business!
`;

export default function NewTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as "contract" | "invoice" | null;

  const [step, setStep] = useState<"type" | "details" | "content">(typeParam ? "details" : "type");
  const [showPreview, setShowPreview] = useState(false);
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
  const watchName = watch("name");
  const watchContent = watch("content");

  const handleTypeChange = (type: "contract" | "invoice") => {
    setValue("type", type);
    setValue("content", type === "invoice" ? defaultInvoiceContent : defaultContractContent);
  };

  const createTemplate = trpc.template.create.useMutation({
    onSuccess: (template) => {
      toast.success("Template created!");
      router.push(`/dashboard/templates/${template.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create template");
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    createTemplate.mutate(data);
  };

  const canProceedToDetails = selectedType;
  const canProceedToContent = watchName;

  const TypeIcon = selectedType === "contract" ? FileText : Receipt;

  return (
    <>
      <Header
        title="New Template"
        description="Create a reusable template for contracts or invoices"
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
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setStep("type")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                step === "type"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 text-xs">
                1
              </span>
              Type
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button
              type="button"
              onClick={() => canProceedToDetails && setStep("details")}
              disabled={!canProceedToDetails}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                step === "details"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : !canProceedToDetails
                  ? "bg-secondary/50 text-muted-foreground/50 cursor-not-allowed"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 text-xs">
                2
              </span>
              Details
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button
              type="button"
              onClick={() => canProceedToContent && setStep("content")}
              disabled={!canProceedToContent}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                step === "content"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : !canProceedToContent
                  ? "bg-secondary/50 text-muted-foreground/50 cursor-not-allowed"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 text-xs">
                3
              </span>
              Content
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === "type" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-secondary/20">
                    <CardTitle>Template Type</CardTitle>
                    <CardDescription>
                      Choose what kind of template you want to create
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handleTypeChange("contract")}
                        className={cn(
                          "flex flex-col items-center gap-4 rounded-xl border p-6 transition-all text-center",
                          selectedType === "contract"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                            : "border-border/50 bg-secondary/20 hover:border-border hover:bg-secondary/40"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-2xl transition-all",
                            selectedType === "contract"
                              ? "gradient-primary shadow-lg"
                              : "bg-secondary"
                          )}
                        >
                          <FileText
                            className={cn(
                              "h-8 w-8",
                              selectedType === "contract" ? "text-white" : "text-muted-foreground"
                            )}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Contract Template</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Legal agreements, service contracts, NDAs
                          </p>
                        </div>
                        {selectedType === "contract" && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTypeChange("invoice")}
                        className={cn(
                          "flex flex-col items-center gap-4 rounded-xl border p-6 transition-all text-center",
                          selectedType === "invoice"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                            : "border-border/50 bg-secondary/20 hover:border-border hover:bg-secondary/40"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-16 w-16 items-center justify-center rounded-2xl transition-all",
                            selectedType === "invoice"
                              ? "gradient-primary shadow-lg"
                              : "bg-secondary"
                          )}
                        >
                          <Receipt
                            className={cn(
                              "h-8 w-8",
                              selectedType === "invoice" ? "text-white" : "text-muted-foreground"
                            )}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Invoice Template</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Billing documents, payment requests
                          </p>
                        </div>
                        {selectedType === "invoice" && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep("details")}
                    className="gradient-primary border-0 min-w-35"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === "details" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-secondary/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                        <TypeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>Template Details</CardTitle>
                        <CardDescription>
                          {selectedType === "contract" ? "Contract" : "Invoice"} template
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Template Name <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <FileSignature className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder={
                            selectedType === "contract"
                              ? "e.g., Web Development Agreement"
                              : "e.g., Standard Invoice"
                          }
                          className={cn("pl-9", errors.name && "border-destructive")}
                          {...register("name")}
                        />
                      </div>
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
                      <p className="text-xs text-muted-foreground">
                        Optional. Helps you remember what this template is for.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <Button type="button" variant="ghost" onClick={() => setStep("type")}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep("content")}
                    disabled={!canProceedToContent}
                    className="gradient-primary border-0 min-w-35"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === "content" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Summary */}
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                        <TypeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{watchName || "Untitled Template"}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {selectedType} Template
                        </p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setStep("details")}>
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Editor */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Editor */}
                  <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-secondary/20 py-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <PenLine className="h-4 w-4" />
                        Edit Template
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <textarea
                        {...register("content")}
                        rows={20}
                        className="w-full min-h-112.5 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none focus:ring-0"
                        placeholder="Enter template content..."
                      />
                    </CardContent>
                  </Card>

                  {/* Preview */}
                  <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-secondary/20 py-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Eye className="h-4 w-4" />
                        Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-112.5 overflow-auto">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {watchContent}
                      </pre>
                    </CardContent>
                  </Card>
                </div>

                {/* Variable Reference */}
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Available Variables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {selectedType === "contract" ? (
                        <>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{clientName}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{clientEmail}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{clientCompany}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{businessName}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{projectName}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{projectDescription}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{totalAmount}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{milestones}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{date}}"}</code>
                        </>
                      ) : (
                        <>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{invoiceNumber}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{clientName}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{clientCompany}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{businessName}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{invoiceDate}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{dueDate}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{lineItems}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{subtotal}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{taxRate}}"}</code>
                          <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{"{{total}}"}</code>
                        </>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      These variables will be replaced with actual values when the template is used.
                    </p>
                  </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Your template will be saved and available for use immediately.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="ghost" onClick={() => setStep("details")}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="gradient-primary border-0 min-w-40"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Create Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}