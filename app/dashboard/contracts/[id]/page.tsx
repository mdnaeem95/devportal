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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send, Copy, Check, ExternalLink, Trash2, Eye, Edit3, FileText, CheckCircle2,
  Clock, XCircle, Download, User, Shield, FolderOpen, Calendar, Mail, 
  PenTool} from "lucide-react";

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, color: "bg-gray-500", textColor: "text-muted-foreground" },
  sent: { label: "Sent", variant: "default" as const, color: "bg-blue-500", textColor: "text-blue-400" },
  viewed: { label: "Viewed", variant: "default" as const, color: "bg-purple-500", textColor: "text-purple-400" },
  signed: { label: "Signed", variant: "success" as const, color: "bg-green-500", textColor: "text-green-400" },
  declined: { label: "Declined", variant: "destructive" as const, color: "bg-red-500", textColor: "text-red-400" },
  expired: { label: "Expired", variant: "secondary" as const, color: "bg-orange-500", textColor: "text-orange-400" },
};

const contractSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: contract, isLoading, refetch } = trpc.contract.get.useQuery({ id: contractId });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
  });

  useEffect(() => {
    if (contract) {
      reset({
        name: contract.name,
        content: contract.content,
      });
    }
  }, [contract, reset]);

  const utils = trpc.useUtils();

  const updateContract = trpc.contract.update.useMutation({
    onSuccess: () => {
      toast.success("Contract saved successfully!");
      utils.contract.get.invalidate({ id: contractId });
      setIsSaving(false);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save contract");
      setIsSaving(false);
    },
  });

  const sendContract = trpc.contract.send.useMutation({
    onSuccess: () => {
      toast.success("Contract sent to client!");
      utils.contract.get.invalidate({ id: contractId });
      setIsSending(false);
      setShowSendDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send contract");
      setIsSending(false);
    },
  });

  const deleteContract = trpc.contract.delete.useMutation({
    onSuccess: () => {
      toast.success("Contract deleted");
      router.push("/dashboard/contracts");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete contract");
      setIsDeleting(false);
    },
  });

  const onSubmit = async (data: ContractFormData) => {
    setIsSaving(true);
    updateContract.mutate({ id: contractId, ...data });
  };

  const handleSend = () => {
    setIsSending(true);
    sendContract.mutate({ id: contractId });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteContract.mutate({ id: contractId });
  };

  const copySignLink = () => {
    if (contract?.signToken) {
      const url = `${window.location.origin}/sign/${contract.signToken}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Signing link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const content = watch("content");

  if (isLoading) {
    return (
      <>
        <Header title="Contract" />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <Skeleton className="h-24 rounded-xl" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (!contract) {
    return (
      <>
        <Header title="Contract Not Found" />
        <div className="flex-1 overflow-auto p-6">
          <Card className="mx-auto max-w-md bg-card/50">
            <CardContent className="flex flex-col items-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Contract not found</h3>
              <p className="mt-2 text-muted-foreground">
                This contract doesn't exist or was deleted.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/dashboard/contracts">Back to Contracts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const status = statusConfig[contract.status as keyof typeof statusConfig];
  const isDraft = contract.status === "draft";
  const isSigned = contract.status === "signed";
  const isPending = ["sent", "viewed"].includes(contract.status);
  const isDeclined = contract.status === "declined";

  return (
    <>
      <Header
        title={contract.name}
        description={`Contract for ${contract.client?.name}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/contracts">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>

            {isDraft && !isEditing && (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={() => setShowSendDialog(true)} className="gradient-primary border-0">
                  <Send className="h-4 w-4" />
                  Send for Signature
                </Button>
              </>
            )}

            {isPending && (
              <>
                <Button variant="outline" onClick={copySignLink}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Button variant="outline" asChild>
                  <a href={`/sign/${contract.signToken}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </a>
                </Button>
              </>
            )}

            {isSigned && (
              <Button variant="outline" asChild>
                <a href={`/api/contracts/${contract.id}/pdf`} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Status Banners */}
          {isSigned && (
            <div className="flex items-center gap-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 animate-in slide-in-from-top duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-400">Contract Signed</p>
                <p className="text-sm text-green-400/80">
                  Signed {contract.signedAt ? formatDate(contract.signedAt) : ""}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="border-green-500/30 text-green-400 hover:bg-green-500/20">
                <a href={`/api/contracts/${contract.id}/pdf`} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  PDF
                </a>
              </Button>
            </div>
          )}

          {isDeclined && (
            <div className="flex items-center gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 animate-in slide-in-from-top duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-400">Contract Declined</p>
                <p className="text-sm text-red-400/80">
                  The client declined this contract
                </p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 animate-in slide-in-from-top duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 animate-pulse">
                <PenTool className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-purple-400">Awaiting Signature</p>
                <p className="text-sm text-purple-400/80">
                  Sent to {contract.client?.email}
                  {contract.sentAt ? ` on ${formatDate(contract.sentAt)}` : ""}
                  {contract.viewedAt ? ` • Viewed ${formatDate(contract.viewedAt)}` : ""}
                </p>
              </div>
              {contract.expiresAt && (
                <Badge variant="secondary" className="shrink-0">
                  <Clock className="h-3 w-3 mr-1" />
                  Expires {formatDate(contract.expiresAt)}
                </Badge>
              )}
            </div>
          )}

          {/* Contract Info Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-medium truncate">{contract.client?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Project</p>
                    <p className="font-medium truncate">{contract.project?.name || "No project"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", status.color + "/20")}>
                    <Shield className={cn("h-5 w-5", status.textColor)} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contract Content */}
          <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-secondary/20">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contract Content
                </CardTitle>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? "Edit Mode" : "Preview"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Contract Name</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  {showPreview ? (
                    <div className="rounded-lg border border-border/50 bg-secondary/30 p-6 max-h-125 overflow-auto">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{content}</pre>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="content">Content (Markdown)</Label>
                      <textarea
                        id="content"
                        {...register("content")}
                        rows={20}
                        className={cn(
                          "flex w-full rounded-lg border bg-secondary/50 px-3 py-2 text-sm font-mono transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none",
                          errors.content ? "border-destructive" : "border-border/50"
                        )}
                      />
                      {errors.content && (
                        <p className="text-sm text-destructive">{errors.content.message}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      {isDirty ? <span className="text-primary">Unsaved changes</span> : "No changes"}
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          reset();
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSaving || !isDirty}
                        className="gradient-primary border-0"
                      >
                        {isSaving ? (
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
              ) : (
                <div className="p-6 max-h-150 overflow-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{contract.content}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signature Details (for signed contracts) */}
          {isSigned && contract.clientSignature && (
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-green-500/10">
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Signature Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Signed At</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {contract.signedAt ? formatDate(contract.signedAt) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">IP Address</p>
                    <p className="font-medium">{contract.clientIp || "Unknown"}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-3">Client Signature</p>
                  <div className="inline-block rounded-lg border border-border/50 bg-white p-4">
                    <img
                      src={contract.clientSignature}
                      alt="Client Signature"
                      className="max-h-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-muted-foreground">{formatDate(contract.createdAt)}</p>
                  </div>
                </div>
                {contract.sentAt && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                      <Send className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Sent</p>
                      <p className="text-muted-foreground">{formatDate(contract.sentAt)}</p>
                    </div>
                  </div>
                )}
                {contract.viewedAt && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                      <Eye className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">Viewed</p>
                      <p className="text-muted-foreground">{formatDate(contract.viewedAt)}</p>
                    </div>
                  </div>
                )}
                {contract.signedAt && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Signed</p>
                      <p className="text-muted-foreground">{formatDate(contract.signedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {!isSigned && (
            <Card className="bg-card/50 backdrop-blur-sm border-destructive/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Contract</p>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Send Confirmation Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Contract for Signature</DialogTitle>
            <DialogDescription>
              This will email the contract to {contract.client?.email} for their signature.
              You won't be able to edit the contract after sending.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{contract.client?.name}</p>
                <p className="text-sm text-muted-foreground">{contract.client?.email}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending} className="gradient-primary border-0">
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Contract
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{contract.name}"? This action cannot be undone.
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
                  Delete Contract
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}