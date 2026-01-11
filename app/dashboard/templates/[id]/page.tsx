"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { formatDate, cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Trash2, FileText, Receipt, Lock, Copy, Eye } from "lucide-react";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function TemplateDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: template, isLoading, refetch } = trpc.template.get.useQuery({ id: params.id });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  });

  // Reset form when template loads
  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        description: template.description || "",
        content: template.content,
      });
    }
  }, [template, reset]);

  const updateTemplate = trpc.template.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsSubmitting(false);
    },
    onError: () => setIsSubmitting(false),
  });

  const deleteTemplate = trpc.template.delete.useMutation({
    onSuccess: () => {
      router.push("/dashboard/templates");
    },
    onError: () => setIsDeleting(false),
  });

  const duplicateTemplate = trpc.template.duplicate.useMutation({
    onSuccess: (newTemplate) => {
      router.push(`/dashboard/templates/${newTemplate.id}`);
    },
    onError: () => setIsDuplicating(false),
  });

  const onSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    updateTemplate.mutate({ id: params.id, ...data });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      setIsDeleting(true);
      deleteTemplate.mutate({ id: params.id });
    }
  };

  const handleDuplicate = () => {
    setIsDuplicating(true);
    duplicateTemplate.mutate({ id: params.id });
  };

  const content = watch("content");

  if (isLoading) {
    return (
      <>
        <Header title="Template" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!template) {
    return (
      <>
        <Header title="Template Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">This template doesn't exist or was deleted.</p>
          <Button asChild>
            <Link href="/dashboard/templates">Back to Templates</Link>
          </Button>
        </div>
      </>
    );
  }

  const isSystemTemplate = template.isSystem;
  const TypeIcon = template.type === "contract" ? FileText : Receipt;

  return (
    <>
      <Header
        title={template.name}
        description={template.type === "contract" ? "Contract Template" : "Invoice Template"}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/templates">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleDuplicate}
              disabled={isDuplicating}
            >
              {isDuplicating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Duplicate
            </Button>
            {!isSystemTemplate && (
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          {isSystemTemplate && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-4">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">System Template</p>
                <p className="text-sm text-muted-foreground">
                  This is a read-only system template. Duplicate it to create your own editable version.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Template Info */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                    <TypeIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Template Details</CardTitle>
                    <CardDescription>
                      {template.type === "contract" ? "Contract" : "Invoice"} template
                      {template.isDefault && " • Default"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Template Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    disabled={isSystemTemplate}
                    className={cn(
                      errors.name && "border-destructive",
                      isSystemTemplate && "opacity-60"
                    )}
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
                    {...register("description")}
                    disabled={isSystemTemplate}
                    className={isSystemTemplate ? "opacity-60" : ""}
                  />
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                  <span>Created {formatDate(template.createdAt)}</span>
                  <span>•</span>
                  <span>Updated {formatDate(template.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Template Content */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Template Content</CardTitle>
                    <CardDescription>
                      Markdown format with variable placeholders
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? "Edit" : "Preview"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <div className="prose prose-invert prose-sm max-w-none rounded-lg border border-border/50 bg-secondary/30 p-4">
                    <pre className="whitespace-pre-wrap text-sm">{content}</pre>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      {...register("content")}
                      rows={20}
                      disabled={isSystemTemplate}
                      className={cn(
                        "flex w-full rounded-lg border bg-secondary/50 px-3 py-2 text-sm font-mono transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20",
                        errors.content ? "border-destructive" : "border-border/50",
                        isSystemTemplate && "opacity-60"
                      )}
                    />
                    {errors.content && (
                      <p className="text-sm text-destructive">{errors.content.message}</p>
                    )}
                  </div>
                )}

                {/* Variable Reference */}
                <div className="mt-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
                  <p className="text-sm font-medium mb-2">Available Variables</p>
                  <div className="flex flex-wrap gap-2">
                    {template.type === "contract" ? (
                      <>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{project_name}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{client_name}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{developer_name}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{date}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{start_date}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{end_date}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{total_amount}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{milestones}}"}</code>
                      </>
                    ) : (
                      <>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{invoice_number}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{client_name}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{due_date}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{line_items}}"}</code>
                        <code className="text-xs bg-secondary px-2 py-1 rounded">{"{{total}}"}</code>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            {!isSystemTemplate && (
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => reset()}
                  disabled={!isDirty}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="gradient-primary border-0"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}