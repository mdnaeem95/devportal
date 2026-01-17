"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { z } from "zod";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  ArrowLeft, Loader2, Send, Copy, Check, ExternalLink, Trash2, Eye, Edit3, FileText, CheckCircle2,
  Clock, XCircle, Download, User, Shield, FolderOpen, Calendar, Mail, PenTool, Bell, BellOff,
  History, AlertTriangle, Pen, X, RotateCcw
} from "lucide-react";

// ============================================
// Status Configuration
// ============================================

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, color: "bg-gray-500", textColor: "text-muted-foreground" },
  sent: { label: "Sent", variant: "default" as const, color: "bg-blue-500", textColor: "text-blue-400" },
  viewed: { label: "Viewed", variant: "default" as const, color: "bg-purple-500", textColor: "text-purple-400" },
  signed: { label: "Signed", variant: "success" as const, color: "bg-green-500", textColor: "text-green-400" },
  declined: { label: "Declined", variant: "destructive" as const, color: "bg-red-500", textColor: "text-red-400" },
  expired: { label: "Expired", variant: "secondary" as const, color: "bg-orange-500", textColor: "text-orange-400" },
};

// ============================================
// Form Schema
// ============================================

const contractSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
});

type ContractFormData = z.infer<typeof contractSchema>;

// ============================================
// Signature Pad Component
// ============================================

function SignaturePad({ 
  onSign, 
  onCancel, 
  isLoading,
  title = "Sign Contract",
  description = "Draw your signature below or type your name",
}: { 
  onSign: (signature: string, type: "drawn" | "typed") => void;
  onCancel: () => void;
  isLoading: boolean;
  title?: string;
  description?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = () => {
    if (signatureType === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const signature = canvas.toDataURL("image/png");
      onSign(signature, "drawn");
    } else {
      if (!typedName.trim()) return;
      // Create a typed signature as base64 image
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "italic 32px 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(typedName, 200, 50);
      
      onSign(canvas.toDataURL("image/png"), "typed");
    }
  };

  const canSign = signatureType === "draw" ? hasDrawn : typedName.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Toggle between draw and type */}
      <div className="flex items-center justify-center gap-2 p-1 bg-secondary rounded-lg">
        <button
          type="button"
          onClick={() => setSignatureType("draw")}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            signatureType === "draw"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Pen className="h-4 w-4 inline mr-2" />
          Draw
        </button>
        <button
          type="button"
          onClick={() => setSignatureType("type")}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            signatureType === "type"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Type
        </button>
      </div>

      {signatureType === "draw" ? (
        <div className="space-y-2">
          <div className="relative rounded-lg border-2 border-dashed border-border bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-sm">Draw your signature here</p>
              </div>
            )}
          </div>
          {hasDrawn && (
            <Button type="button" variant="ghost" size="sm" onClick={clearCanvas}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Type your full name"
            className="text-center text-lg"
          />
          {typedName && (
            <div className="rounded-lg border bg-white p-4 text-center">
              <p className="text-2xl italic text-gray-800 font-serif">{typedName}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1 gradient-primary border-0"
          disabled={!canSign || isLoading}
          onClick={handleSign}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Sign Contract
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function ContractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  // UI State
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // NEW: Signing state
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  
  // NEW: Reminder state
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Data fetching
  const { data: contract, isLoading, refetch } = trpc.contract.get.useQuery({ id: contractId });
  const { data: settings } = trpc.settings.get.useQuery();

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

  // ============================================
  // Mutations
  // ============================================

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

  // NEW: Developer sign mutation
  const developerSign = trpc.contract.developerSign.useMutation({
    onSuccess: () => {
      toast.success("You've signed the contract!");
      utils.contract.get.invalidate({ id: contractId });
      setIsSigning(false);
      setShowSignDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign contract");
      setIsSigning(false);
    },
  });

  // NEW: Remove developer signature mutation
  const removeDeveloperSignature = trpc.contract.removeDeveloperSignature.useMutation({
    onSuccess: () => {
      toast.success("Signature removed");
      utils.contract.get.invalidate({ id: contractId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove signature");
    },
  });

  // NEW: Send reminder mutation
  const sendReminder = trpc.contract.sendReminder.useMutation({
    onSuccess: () => {
      toast.success("Reminder sent to client!");
      utils.contract.get.invalidate({ id: contractId });
      setIsSendingReminder(false);
      setShowReminderDialog(false);
      setReminderMessage("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send reminder");
      setIsSendingReminder(false);
    },
  });

  // NEW: Toggle auto-remind mutation
  const toggleAutoRemind = trpc.contract.toggleAutoRemind.useMutation({
    onSuccess: (data) => {
      toast.success(data.autoRemind ? "Auto-reminders enabled" : "Auto-reminders disabled");
      utils.contract.get.invalidate({ id: contractId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update setting");
    },
  });

  // ============================================
  // Handlers
  // ============================================

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

  const handleDeveloperSign = (signature: string, type: "drawn" | "typed") => {
    setIsSigning(true);
    developerSign.mutate({ id: contractId, signature, signatureType: type });
  };

  const handleSendReminder = () => {
    setIsSendingReminder(true);
    sendReminder.mutate({ 
      id: contractId, 
      customMessage: reminderMessage.trim() || undefined 
    });
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

  // ============================================
  // Loading State
  // ============================================

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

  // ============================================
  // Not Found State
  // ============================================

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

  // ============================================
  // Derived State
  // ============================================

  const status = statusConfig[contract.status as keyof typeof statusConfig];
  const isDraft = contract.status === "draft";
  const isSigned = contract.status === "signed";
  const isPending = ["sent", "viewed"].includes(contract.status);
  const isDeclined = contract.status === "declined";
  const hasDeveloperSigned = !!contract.developerSignature;
  const showSequentialSigningCard = (settings?.contractDefaults?.sequentialSigning ?? true) || hasDeveloperSigned;

  // Calculate hours since last reminder
  const hoursSinceLastReminder = contract.lastReminderAt 
    ? Math.floor((Date.now() - new Date(contract.lastReminderAt).getTime()) / (1000 * 60 * 60))
    : null;
  const canSendReminder = hoursSinceLastReminder === null || hoursSinceLastReminder >= 24;

  // ============================================
  // Render
  // ============================================

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
                <Button variant="outline" onClick={() => setShowReminderDialog(true)}>
                  <Bell className="h-4 w-4" />
                  Send Reminder
                </Button>
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
          
          {/* ============================================ */}
          {/* Status Banners */}
          {/* ============================================ */}
          
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
              <div className="flex items-center gap-2">
                {contract.reminderCount > 0 && (
                  <Badge variant="secondary" className="shrink-0">
                    <Bell className="h-3 w-3 mr-1" />
                    {contract.reminderCount} reminder{contract.reminderCount > 1 ? "s" : ""} sent
                  </Badge>
                )}
                {contract.expiresAt && (
                  <Badge variant="secondary" className="shrink-0">
                    <Clock className="h-3 w-3 mr-1" />
                    Expires {formatDate(contract.expiresAt)}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* NEW: Developer Signature Card (Draft Only) */}
          {/* ============================================ */}
          
          {isDraft && showSequentialSigningCard && (
            <Card className={cn(
              "bg-card/50 backdrop-blur-sm overflow-hidden transition-all",
              hasDeveloperSigned 
                ? "border-green-500/30 bg-green-500/5" 
                : "border-dashed border-2 border-primary/30"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                      hasDeveloperSigned ? "bg-green-500/20" : "bg-primary/20"
                    )}>
                      {hasDeveloperSigned ? (
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                      ) : (
                        <PenTool className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className={cn(
                        "font-semibold",
                        hasDeveloperSigned ? "text-green-400" : "text-foreground"
                      )}>
                        {hasDeveloperSigned ? "You've Signed This Contract" : "Sign Before Sending"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {hasDeveloperSigned 
                          ? `Signed on ${formatDate(contract.developerSignedAt!)}` 
                          : "Pre-sign to show commitment and professionalism"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasDeveloperSigned ? (
                      <>
                        <div className="rounded-lg border border-border bg-white p-2 max-w-37.5">
                          <img 
                            src={contract.developerSignature!} 
                            alt="Your signature" 
                            className="max-h-12 w-auto"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeDeveloperSignature.mutate({ id: contractId })}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setShowSignDialog(true)}
                        className="gradient-primary border-0"
                      >
                        <PenTool className="h-4 w-4" />
                        Sign Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============================================ */}
          {/* Contract Info Cards */}
          {/* ============================================ */}
          
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

          {/* ============================================ */}
          {/* NEW: Reminder Settings & History (Pending Only) */}
          {/* ============================================ */}
          
          {isPending && (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-5 w-5" />
                    Reminders
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Auto-remind</span>
                    <Switch
                      checked={contract.autoRemind}
                      onCheckedChange={() => toggleAutoRemind.mutate({ id: contractId })}
                    />
                  </div>
                </div>
                <CardDescription>
                  {contract.autoRemind 
                    ? "Automatic reminders will be sent at 3 days, 7 days, and before expiry"
                    : "Enable auto-remind to automatically follow up with clients"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {contract.reminders && contract.reminders.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      <History className="h-4 w-4 inline mr-1" />
                      Recent Reminders
                    </p>
                    <div className="space-y-2">
                      {contract.reminders.map((reminder) => (
                        <div 
                          key={reminder.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                              <Bell className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {reminder.reminderType === "manual" ? "Manual reminder" : `Auto reminder (${reminder.reminderType.replace("auto_", "")})`}
                              </p>
                              {reminder.customMessage && (
                                <p className="text-xs text-muted-foreground truncate max-w-xs">
                                  "{reminder.customMessage}"
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(reminder.sentAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BellOff className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No reminders sent yet</p>
                  </div>
                )}

                {/* Manual reminder button */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowReminderDialog(true)}
                    disabled={!canSendReminder}
                  >
                    <Bell className="h-4 w-4" />
                    {canSendReminder 
                      ? "Send Reminder Now" 
                      : `Wait ${24 - (hoursSinceLastReminder || 0)}h before next reminder`
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============================================ */}
          {/* Contract Content */}
          {/* ============================================ */}
          
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

          {/* ============================================ */}
          {/* Signature Details (Signed Contracts) */}
          {/* ============================================ */}
          
          {isSigned && (
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-green-500/10">
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Signature Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Developer Signature (if sequential signing was used) */}
                  {contract.developerSignature && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Developer Signature</p>
                      <div className="inline-block rounded-lg border border-border/50 bg-white p-4">
                        <img
                          src={contract.developerSignature}
                          alt="Developer Signature"
                          className="max-h-16"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Signed {contract.developerSignedAt ? formatDate(contract.developerSignedAt) : ""}
                      </p>
                    </div>
                  )}
                  
                  {/* Client Signature */}
                  {contract.clientSignature && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Client Signature</p>
                      <div className="inline-block rounded-lg border border-border/50 bg-white p-4">
                        <img
                          src={contract.clientSignature}
                          alt="Client Signature"
                          className="max-h-16"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Signed {contract.signedAt ? formatDate(contract.signedAt) : ""}
                        {contract.clientIp && ` • IP: ${contract.clientIp}`}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============================================ */}
          {/* Timeline */}
          {/* ============================================ */}
          
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
                {contract.developerSignedAt && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      <PenTool className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Developer Signed</p>
                      <p className="text-muted-foreground">{formatDate(contract.developerSignedAt)}</p>
                    </div>
                  </div>
                )}
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

          {/* ============================================ */}
          {/* Danger Zone */}
          {/* ============================================ */}
          
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

      {/* ============================================ */}
      {/* Developer Sign Dialog */}
      {/* ============================================ */}
      
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <VisuallyHidden.Root>
              <DialogTitle>Sign as Developer</DialogTitle>
            </VisuallyHidden.Root>
            <VisuallyHidden.Root>
              <DialogDescription>
                Provide a signature to be placed on the contract before sending.
              </DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>

          <SignaturePad
            onSign={handleDeveloperSign}
            onCancel={() => setShowSignDialog(false)}
            isLoading={isSigning}
            title="Sign as Developer"
            description="Your signature will appear on the contract before sending to the client"
          />
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* Send Confirmation Dialog */}
      {/* ============================================ */}
      
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Contract for Signature</DialogTitle>
            <DialogDescription>
              This will email the contract to {contract.client?.email} for their signature.
              You won't be able to edit the contract after sending.
            </DialogDescription>
          </DialogHeader>
          
          {/* Show developer signature status - only when sequential signing enabled */}
          {(settings?.contractDefaults?.sequentialSigning ?? true) && (
            <div className={cn(
              "rounded-lg p-4",
              hasDeveloperSigned ? "bg-green-500/10 border border-green-500/30" : "bg-secondary/50"
            )}>
              <div className="flex items-center gap-3">
                {hasDeveloperSigned ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="font-medium text-green-400">You've signed this contract</p>
                      <p className="text-sm text-green-400/80">
                        The client will see your signature when they open the contract
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">You haven't signed yet</p>
                      <p className="text-sm text-muted-foreground">
                        Consider signing first to show commitment
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowSendDialog(false);
                        setShowSignDialog(true);
                      }}
                    >
                      Sign Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
          
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

      {/* ============================================ */}
      {/* Send Reminder Dialog */}
      {/* ============================================ */}
      
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
            <DialogDescription>
              Send a friendly reminder to {contract.client?.name} about this contract.
              {contract.reminderCount > 0 && ` (${contract.reminderCount} reminder${contract.reminderCount > 1 ? 's' : ''} already sent)`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{contract.client?.name}</p>
                  <p className="text-sm text-muted-foreground">{contract.client?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminderMessage">
                Personal Message (optional)
              </Label>
              <Textarea
                id="reminderMessage"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                placeholder="Add a personal note to your reminder..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {reminderMessage.length}/500
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowReminderDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendReminder} 
              disabled={isSendingReminder} 
              className="gradient-primary border-0"
            >
              {isSendingReminder ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Send Reminder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* Delete Confirmation Dialog */}
      {/* ============================================ */}
      
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