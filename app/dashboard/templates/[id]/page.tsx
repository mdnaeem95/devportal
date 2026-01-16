"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TemplatePreview, VariableReference } from "@/components/template/template-preview";
import { trpc } from "@/lib/trpc";
import { formatDate, formatDistanceToNow, cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2, FileText, Receipt, Lock, Copy, Check, Star, Calendar, PenLine,
  TrendingUp, Clock, Maximize2, Minimize2 } from "lucide-react";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editorExpanded, setEditorExpanded] = useState(false);

  const { data: template, isLoading, refetch } = trpc.template.get.useQuery({ id: templateId });

  const utils = trpc.useUtils();

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
      toast.success("Template saved!");
      utils.template.get.invalidate({ id: templateId });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save template");
      setIsSubmitting(false);
    },
  });

  const deleteTemplate = trpc.template.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted");
      router.push("/dashboard/templates");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete template");
      setIsDeleting(false);
    },
  });

  const duplicateTemplate = trpc.template.duplicate.useMutation({
    onSuccess: (newTemplate) => {
      toast.success("Template duplicated!");
      router.push(`/dashboard/templates/${newTemplate.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to duplicate template");
      setIsDuplicating(false);
    },
  });

  const setDefaultTemplate = trpc.template.setDefault.useMutation({
    onSuccess: (t) => {
      toast.success(`"${t.name}" is now your default ${t.type} template`);
      utils.template.get.invalidate({ id: templateId });
      utils.template.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set default");
    },
  });

  const removeDefault = trpc.template.removeDefault.useMutation({
    onSuccess: () => {
      toast.success("Default removed");
      utils.template.get.invalidate({ id: templateId });
      utils.template.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove default");
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    updateTemplate.mutate({ id: templateId, ...data });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteTemplate.mutate({ id: templateId });
  };

  const handleDuplicate = () => {
    setIsDuplicating(true);
    duplicateTemplate.mutate({ id: templateId });
  };

  const handleToggleDefault = () => {
    if (!template) return;
    if (template.isDefault) {
      removeDefault.mutate({ id: templateId });
    } else {
      setDefaultTemplate.mutate({ id: templateId });
    }
  };

  const content = watch("content");

  if (isLoading) {
    return (
      <>
        <Header title="Template" />
        <div className="flex-1 overflow-auto p-6">
          <div className="w-full max-w-none space-y-6">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-96 rounded-xl" />
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!template) {
    return (
      <>
        <Header title="Template Not Found" />
        <div className="flex-1 overflow-auto p-6">
          <Card className="mx-auto max-w-md bg-card/50">
            <CardContent className="flex flex-col items-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Template not found</h3>
              <p className="mt-2 text-muted-foreground">
                This template doesn't exist or was deleted.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/dashboard/templates">Back to Templates</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const isSystemTemplate = template.isSystem;
  const TypeIcon = template.type === "contract" ? FileText : Receipt;
  const isSettingDefault = setDefaultTemplate.isPending || removeDefault.isPending;

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
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* System Template Banner */}
          {isSystemTemplate && (
            <div className="flex items-center gap-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 animate-in slide-in-from-top duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                <Lock className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-purple-400">System Template</p>
                <p className="text-sm text-purple-400/80">
                  This is a read-only system template. Duplicate it to create your own editable version.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDuplicate}
                disabled={isDuplicating}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                {isDuplicating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Duplicate
              </Button>
            </div>
          )}

          {/* Usage Stats & Default Toggle */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Times Used</p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-1 text-green-500">
                  {template.usageCount || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Last Used</p>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold mt-1">
                  {template.lastUsedAt 
                    ? formatDistanceToNow(new Date(template.lastUsedAt)) 
                    : "Never"}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold mt-1">
                  {formatDate(template.createdAt)}
                </p>
              </CardContent>
            </Card>
            <Card className={cn(
              "bg-card/50 backdrop-blur-sm transition-all",
              template.isDefault && "ring-2 ring-yellow-500/50 border-yellow-500/50"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Default Template</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Auto-selected for new {template.type}s
                    </p>
                  </div>
                  <Switch
                    checked={template.isDefault || false}
                    onCheckedChange={handleToggleDefault}
                    disabled={isSettingDefault}
                  />
                </div>
                {template.isDefault && (
                  <Badge className="mt-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Default
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Template Info */}
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-transform",
                    isSystemTemplate ? "bg-purple-500/20" : "gradient-primary"
                  )}>
                    <TypeIcon className={cn(
                      "h-6 w-6",
                      isSystemTemplate ? "text-purple-400" : "text-white"
                    )} />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Template Details
                      {template.isDefault && (
                        <Badge variant="default" className="ml-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="capitalize">{template.type}</span>
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      <span>Updated {formatDate(template.updatedAt)}</span>
                      {template.usageCount > 0 && (
                        <>
                          <span>•</span>
                          <TrendingUp className="h-3 w-3" />
                          <span>Used {template.usageCount}×</span>
                        </>
                      )}
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
                  <Input
                    id="name"
                    {...register("name")}
                    disabled={isSystemTemplate || false}
                    className={cn(
                      errors.name && "border-destructive",
                      isSystemTemplate && "opacity-60 cursor-not-allowed"
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
                    placeholder="Brief description of when to use this template"
                    {...register("description")}
                    disabled={isSystemTemplate || false}
                    className={isSystemTemplate ? "opacity-60 cursor-not-allowed" : ""}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Editor and Preview - Side by Side */}
            <div className={cn(
              "grid gap-6",
              editorExpanded ? "lg:grid-cols-1" : "lg:grid-cols-2"
            )}>
              {/* Editor */}
              <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/20 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <PenLine className="h-4 w-4" />
                      Edit Template
                    </CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditorExpanded(!editorExpanded)}
                    >
                      {editorExpanded ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <textarea
                    {...register("content")}
                    rows={editorExpanded ? 30 : 20}
                    disabled={isSystemTemplate || false}
                    className={cn(
                      "w-full p-4 bg-transparent border-0 text-sm font-mono resize-none focus:outline-none focus:ring-0",
                      errors.content && "border-l-2 border-destructive",
                      isSystemTemplate && "opacity-60 cursor-not-allowed"
                    )}
                  />
                </CardContent>
              </Card>

              {/* Live Preview */}
              {!editorExpanded && (
                <TemplatePreview
                  content={content || ""}
                  type={template.type}
                  defaultMode="preview"
                  showDataSourceSelector={true}
                />
              )}
            </div>

            {/* Variable Reference */}
            <VariableReference type={template.type} />

            {/* Submit */}
            {!isSystemTemplate && (
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-4">
                <p className="text-sm text-muted-foreground">
                  {isDirty ? (
                    <span className="text-primary font-medium">Unsaved changes</span>
                  ) : (
                    "No changes made"
                  )}
                </p>
                <div className="flex items-center gap-3">
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
            )}
          </form>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{template.name}"? 
              {template.usageCount > 0 && (
                <span className="block mt-2 text-yellow-500">
                  This template has been used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}.
                </span>
              )}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}