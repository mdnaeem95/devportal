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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatDate, cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Send, Copy, Check, ExternalLink, Trash2, Eye, Edit3, FileText, CheckCircle2, Clock, XCircle, Download, User, Shield } from "lucide-react";

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, color: "bg-gray-500" },
  sent: { label: "Sent", variant: "default" as const, color: "bg-blue-500" },
  viewed: { label: "Viewed", variant: "default" as const, color: "bg-purple-500" },
  signed: { label: "Signed", variant: "success" as const, color: "bg-green-500" },
  declined: { label: "Declined", variant: "destructive" as const, color: "bg-red-500" },
  expired: { label: "Expired", variant: "secondary" as const, color: "bg-yellow-500" },
};

const contractSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const { data: contract, isLoading, refetch } = trpc.contract.get.useQuery({ id: params.id });

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

  const updateContract = trpc.contract.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsSaving(false);
      setIsEditing(false);
    },
    onError: () => setIsSaving(false),
  });

  const sendContract = trpc.contract.send.useMutation({
    onSuccess: () => {
      refetch();
      setIsSending(false);
    },
    onError: () => setIsSending(false),
  });

  const deleteContract = trpc.contract.delete.useMutation({
    onSuccess: () => {
      router.push("/dashboard/contracts");
    },
    onError: () => setIsDeleting(false),
  });

  const onSubmit = async (data: ContractFormData) => {
    setIsSaving(true);
    updateContract.mutate({ id: params.id, ...data });
  };

  const handleSend = () => {
    if (confirm("Send this contract to the client for signature? You won't be able to edit it after sending.")) {
      setIsSending(true);
      sendContract.mutate({ id: params.id });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this contract? This action cannot be undone.")) {
      setIsDeleting(true);
      deleteContract.mutate({ id: params.id });
    }
  };

  const copySignLink = () => {
    if (contract?.signToken) {
      const url = `${window.location.origin}/sign/${contract.signToken}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const content = watch("content");

  if (isLoading) {
    return (
      <>
        <Header title="Contract" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!contract) {
    return (
      <>
        <Header title="Contract Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">This contract doesn't exist or was deleted.</p>
          <Button asChild>
            <Link href="/dashboard/contracts">Back to Contracts</Link>
          </Button>
        </div>
      </>
    );
  }

  const status = statusConfig[contract.status];
  const isDraft = contract.status === "draft";
  const isSigned = contract.status === "signed";
  const isPending = ["sent", "viewed"].includes(contract.status);

  // Extract relation data - use type assertion since relations are included in query
  const contractWithRelations = contract as typeof contract & {
    client?: { name: string; email: string; company: string | null } | null;
    project?: { name: string } | null;
  };
  
  const clientName = contractWithRelations.client?.name ?? "Unknown Client";
  const clientEmail = contractWithRelations.client?.email ?? "";
  const projectName = contractWithRelations.project?.name ?? null;

  return (
    <>
      <Header
        title={contract.name}
        description={`Contract for ${clientName}`}
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
                <Button onClick={handleSend} disabled={isSending} className="gradient-primary border-0">
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send for Signature
                </Button>
              </>
            )}

            {isPending && (
              <>
                <Button variant="outline" onClick={copySignLink}>
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Sign Link"}
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/public/sign/${contract.signToken}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Link>
                </Button>
              </>
            )}

            {isSigned && contract.pdfUrl && (
              <Button variant="outline" asChild>
                <a href={contract.pdfUrl} download>
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
          {/* Status Banner */}
          {isSigned && (
            <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <div className="flex-1">
                <p className="font-medium text-green-400">Contract Signed</p>
                <p className="text-sm text-muted-foreground">
                  Signed by {contract.clientSignedName}
                  {contract.signedAt ? ` on ${formatDate(contract.signedAt)}` : ""}
                </p>
              </div>
            </div>
          )}

          {contract.status === "declined" && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <XCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-medium text-red-400">Contract Declined</p>
                <p className="text-sm text-muted-foreground">
                  The client declined this contract
                  {contract.declinedAt ? ` on ${formatDate(contract.declinedAt)}` : ""}
                </p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <Clock className="h-5 w-5 text-blue-400" />
              <div className="flex-1">
                <p className="font-medium text-blue-400">Awaiting Signature</p>
                <p className="text-sm text-muted-foreground">
                  Sent to {clientEmail}
                  {contract.sentAt ? ` on ${formatDate(contract.sentAt)}` : ""}
                  {contract.viewedAt ? ` • Viewed ${formatDate(contract.viewedAt)}` : ""}
                </p>
              </div>
              {contract.expiresAt && (
                <Badge variant="secondary">
                  Expires {formatDate(contract.expiresAt)}
                </Badge>
              )}
            </div>
          )}

          {/* Contract Info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{clientName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Project</p>
                    <p className="font-medium">{projectName || "None"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", status.color + "/20")}>
                    <Shield className={cn("h-5 w-5", status.color.replace("bg-", "text-").replace("-500", "-400"))} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contract Content */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contract Content</CardTitle>
                {isEditing && (
                  <div className="flex items-center gap-2">
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
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="prose prose-invert prose-sm max-w-none rounded-lg border border-border/50 bg-secondary/30 p-6">
                      <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="content">Content (Markdown)</Label>
                      <textarea
                        id="content"
                        {...register("content")}
                        rows={25}
                        className={cn(
                          "flex w-full rounded-lg border bg-secondary/50 px-3 py-2 text-sm font-mono transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20",
                          errors.content ? "border-destructive" : "border-border/50"
                        )}
                      />
                      {errors.content && (
                        <p className="text-sm text-destructive">{errors.content.message}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4">
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
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none rounded-lg border border-border/50 bg-secondary/30 p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{contract.content}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signature Info (for signed contracts) */}
          {isSigned && (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Signature Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Signed By</p>
                    <p className="font-medium">{contract.clientSignedName}</p>
                    <p className="text-sm text-muted-foreground">{contract.clientSignedEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Signed At</p>
                    <p className="font-medium">
                      {contract.signedAt ? formatDate(contract.signedAt) : "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">IP: {contract.clientIp || "Unknown"}</p>
                  </div>
                </div>
                {contract.clientSignature && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Client Signature</p>
                    <div className="inline-block rounded-lg border border-border/50 bg-white p-4">
                      <img
                        src={contract.clientSignature}
                        alt="Client Signature"
                        className="max-h-20"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {!isSigned && (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Created {formatDate(contract.createdAt)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}