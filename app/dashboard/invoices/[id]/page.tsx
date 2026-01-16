"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send, Copy, Check, ExternalLink, CheckCircle2, Clock, Trash2, Download,
  Mail, Building, Calendar, FileText, Edit, AlertTriangle, CopyPlus, Bell, MessageSquare, 
  DollarSign, CreditCard, SplitSquareHorizontal, Banknote } from "lucide-react";

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, color: "bg-gray-500" },
  sent: { label: "Sent", variant: "default" as const, color: "bg-blue-500" },
  viewed: { label: "Viewed", variant: "default" as const, color: "bg-purple-500" },
  partially_paid: { label: "Partially Paid", variant: "warning" as const, color: "bg-yellow-500" },
  paid: { label: "Paid", variant: "success" as const, color: "bg-green-500" },
  overdue: { label: "Overdue", variant: "destructive" as const, color: "bg-red-500" },
  cancelled: { label: "Cancelled", variant: "secondary" as const, color: "bg-gray-500" },
};

const reminderTypeLabels: Record<string, string> = {
  manual: "Manual reminder",
  auto_3day: "Auto reminder (3 days)",
  auto_7day: "Auto reminder (7 days)",
  auto_overdue: "Overdue reminder",
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  
  // Partial payment states
  const [partialPaymentDialogOpen, setPartialPaymentDialogOpen] = useState(false);
  const [isRecordingPartialPayment, setIsRecordingPartialPayment] = useState(false);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState("");
  const [partialPaymentMethod, setPartialPaymentMethod] = useState("bank_transfer");
  const [partialPaymentNotes, setPartialPaymentNotes] = useState("");
  
  // Partial payment settings dialog
  const [partialSettingsDialogOpen, setPartialSettingsDialogOpen] = useState(false);
  const [isTogglingPartial, setIsTogglingPartial] = useState(false);
  const [minimumPaymentAmount, setMinimumPaymentAmount] = useState("");

  const { data: invoice, isLoading, refetch } = trpc.invoice.get.useQuery({ id: invoiceId });
  const utils = trpc.useUtils();

  const sendInvoice = trpc.invoice.send.useMutation({
    onSuccess: () => {
      toast.success("Invoice sent successfully!", {
        description: `Email sent to ${invoice?.client.email}`,
      });
      refetch();
      setIsSending(false);
    },
    onError: (error) => {
      toast.error("Failed to send invoice", { description: error.message });
      setIsSending(false);
    },
  });

  const duplicateInvoice = trpc.invoice.duplicate.useMutation({
    onSuccess: (newInvoice) => {
      toast.success("Invoice duplicated!", {
        description: `Created ${newInvoice.invoiceNumber}`,
      });
      router.push(`/dashboard/invoices/${newInvoice.id}`);
    },
    onError: (error) => {
      toast.error("Failed to duplicate invoice", { description: error.message });
      setIsDuplicating(false);
    },
  });

  const sendReminder = trpc.invoice.sendReminder.useMutation({
    onSuccess: () => {
      toast.success("Reminder sent!", {
        description: `Email sent to ${invoice?.client.email}`,
      });
      refetch();
      setIsSendingReminder(false);
      setReminderDialogOpen(false);
      setCustomMessage("");
    },
    onError: (error) => {
      toast.error("Failed to send reminder", { description: error.message });
      setIsSendingReminder(false);
    },
  });

  const toggleAutoRemind = trpc.invoice.toggleAutoRemind.useMutation({
    onSuccess: (updated) => {
      toast.success(updated.autoRemind ? "Auto-reminders enabled" : "Auto-reminders disabled");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update setting", { description: error.message });
    },
  });

  const togglePartialPayments = trpc.invoice.togglePartialPayments.useMutation({
    onSuccess: (updated) => {
      toast.success(updated.allowPartialPayments ? "Partial payments enabled" : "Partial payments disabled");
      refetch();
      setPartialSettingsDialogOpen(false);
      setIsTogglingPartial(false);
    },
    onError: (error) => {
      toast.error("Failed to update setting", { description: error.message });
      setIsTogglingPartial(false);
    },
  });

  const recordPartialPayment = trpc.invoice.recordPartialPayment.useMutation({
    onSuccess: (updated) => {
      const wasFullyPaid = updated.status === "paid";
      toast.success(wasFullyPaid ? "Invoice fully paid!" : "Payment recorded!", {
        description: wasFullyPaid ? "Invoice has been marked as paid" : `Payment of ${formatCurrency(parseFloat(partialPaymentAmount) * 100, invoice?.currency ?? "USD")} recorded`,
      });
      refetch();
      setIsRecordingPartialPayment(false);
      setPartialPaymentDialogOpen(false);
      setPartialPaymentAmount("");
      setPartialPaymentNotes("");
    },
    onError: (error) => {
      toast.error("Failed to record payment", { description: error.message });
      setIsRecordingPartialPayment(false);
    },
  });

  const markPaid = trpc.invoice.markPaid.useMutation({
    onSuccess: () => {
      toast.success("Invoice marked as paid!");
      refetch();
      setIsMarkingPaid(false);
      setMarkPaidDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to mark as paid", { description: error.message });
      setIsMarkingPaid(false);
    },
  });

  const deleteInvoice = trpc.invoice.delete.useMutation({
    onSuccess: () => {
      toast.success("Invoice deleted");
      router.push("/dashboard/invoices");
    },
    onError: (error) => {
      toast.error("Failed to delete invoice", { description: error.message });
      setIsDeleting(false);
    },
  });

  const handleSend = () => {
    setIsSending(true);
    sendInvoice.mutate({ id: invoiceId });
  };

  const handleDuplicate = () => {
    setIsDuplicating(true);
    duplicateInvoice.mutate({ id: invoiceId });
  };

  const handleSendReminder = () => {
    setIsSendingReminder(true);
    sendReminder.mutate({ 
      id: invoiceId,
      customMessage: customMessage.trim() || undefined,
    });
  };

  const handleMarkPaid = () => {
    setIsMarkingPaid(true);
    markPaid.mutate({ id: invoiceId });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteInvoice.mutate({ id: invoiceId });
  };

  const handleTogglePartialPayments = () => {
    setIsTogglingPartial(true);
    const minAmount = minimumPaymentAmount ? Math.round(parseFloat(minimumPaymentAmount) * 100) : undefined;
    togglePartialPayments.mutate({ 
      id: invoiceId,
      minimumPaymentAmount: !invoice?.allowPartialPayments ? minAmount : undefined,
    });
  };

  const handleRecordPartialPayment = () => {
    const amountCents = Math.round(parseFloat(partialPaymentAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsRecordingPartialPayment(true);
    recordPartialPayment.mutate({
      id: invoiceId,
      amount: amountCents,
      paymentMethod: partialPaymentMethod,
      notes: partialPaymentNotes.trim() || undefined,
    });
  };

  const copyPayLink = () => {
    if (invoice?.payToken) {
      const url = `${window.location.origin}/pay/${invoice.payToken}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Payment link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate cooldown
  const getCooldownInfo = () => {
    if (!invoice?.lastReminderAt) return null;
    const hoursSince = (Date.now() - new Date(invoice.lastReminderAt).getTime()) / (1000 * 60 * 60);
    if (hoursSince >= 24) return null;
    const hoursRemaining = Math.ceil(24 - hoursSince);
    return { hoursRemaining, canSend: false };
  };

  const cooldownInfo = invoice ? getCooldownInfo() : null;

  if (isLoading) {
    return (
      <>
        <Header title="Invoice" />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
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

  const status = statusConfig[invoice.status as keyof typeof statusConfig];
  const lineItems = invoice.lineItems as Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;

  const isOverdue =
    invoice.status !== "paid" &&
    invoice.status !== "cancelled" &&
    invoice.status !== "partially_paid" &&
    new Date(invoice.dueDate) < new Date();

  const isPending = ["sent", "viewed", "overdue", "partially_paid"].includes(invoice.status) || isOverdue;
  const isPartiallyPaid = invoice.status === "partially_paid";
  const paymentProgress = invoice.total > 0 ? (invoice.totalPaid / invoice.total) * 100 : 0;

  return (
    <>
      <Header
        title={invoice.invoiceNumber}
        description={`Invoice for ${invoice.client.name}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/invoices">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href={`/api/invoices/${invoiceId}/pdf`} target="_blank">
                <Download className="h-4 w-4" />
                PDF
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              disabled={isDuplicating}
            >
              {isDuplicating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CopyPlus className="h-4 w-4" />
              )}
              Duplicate
            </Button>

            {invoice.status === "draft" && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/invoices/${invoiceId}/edit`}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isSending}
                  className="gradient-primary border-0"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Invoice
                </Button>
              </>
            )}

            {isPending && (
              <>
                <Button variant="outline" size="sm" onClick={copyPayLink}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setMarkPaidDialogOpen(true)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Paid
                </Button>
              </>
            )}

            {invoice.payToken && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/public/pay/${invoice.payToken}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {/* Mark as Paid Dialog */}
      <Dialog open={markPaidDialogOpen} onOpenChange={setMarkPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
            <DialogDescription>
              This will mark {invoice.invoiceNumber} as fully paid for{" "}
              {formatCurrency(invoice.remainingBalance, invoice.currency ?? "USD")}
              {isPartiallyPaid && ` (remaining balance)`}. The client will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMarkPaidDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkPaid} disabled={isMarkingPaid} className="gradient-primary border-0">
              {isMarkingPaid ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Paid
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Partial Payment Dialog */}
      <Dialog open={partialPaymentDialogOpen} onOpenChange={setPartialPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {invoice.invoiceNumber}.
              Remaining balance: {formatCurrency(invoice.remainingBalance, invoice.currency ?? "USD")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(invoice.remainingBalance / 100).toFixed(2)}
                  value={partialPaymentAmount}
                  onChange={(e) => setPartialPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                />
              </div>
              {invoice.minimumPaymentAmount && invoice.remainingBalance > invoice.minimumPaymentAmount && (
                <p className="text-xs text-muted-foreground">
                  Minimum payment: {formatCurrency(invoice.minimumPaymentAmount, invoice.currency ?? "USD")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                value={partialPaymentMethod}
                onChange={(e) => setPartialPaymentMethod(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="card">Card (Manual)</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentNotes">Notes (optional)</Label>
              <Input
                id="paymentNotes"
                value={partialPaymentNotes}
                onChange={(e) => setPartialPaymentNotes(e.target.value)}
                placeholder="Payment reference or notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPartialPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRecordPartialPayment} 
              disabled={isRecordingPartialPayment || !partialPaymentAmount}
              className="gradient-primary border-0"
            >
              {isRecordingPartialPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4" />
                  Record Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partial Payment Settings Dialog */}
      <Dialog open={partialSettingsDialogOpen} onOpenChange={setPartialSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {invoice.allowPartialPayments ? "Disable" : "Enable"} Partial Payments
            </DialogTitle>
            <DialogDescription>
              {invoice.allowPartialPayments
                ? "Clients will need to pay the full amount in one payment."
                : "Allow clients to make multiple payments toward this invoice."}
            </DialogDescription>
          </DialogHeader>
          {!invoice.allowPartialPayments && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="minimumPayment">Minimum Payment Amount (optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="minimumPayment"
                    type="number"
                    step="0.01"
                    min="0"
                    value={minimumPaymentAmount}
                    onChange={(e) => setMinimumPaymentAmount(e.target.value)}
                    placeholder="No minimum"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to allow any amount
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPartialSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTogglePartialPayments} disabled={isTogglingPartial}>
              {isTogglingPartial ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : invoice.allowPartialPayments ? (
                "Disable Partial Payments"
              ) : (
                "Enable Partial Payments"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a friendly reminder to {invoice.client.name} about 
              {isPartiallyPaid ? " the remaining balance on " : " "}this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customMessage">Personal message (optional)</Label>
              <textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal note to the reminder email..."
                maxLength={500}
                rows={3}
                className="flex w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{customMessage.length}/500</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReminderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminder} disabled={isSendingReminder} className="gradient-primary border-0">
              {isSendingReminder ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Reminder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Invoice
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {invoice.invoiceNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Invoice"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Status Banner */}
          {invoice.status === "paid" && (
            <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-400">Payment Complete</p>
                <p className="text-sm text-muted-foreground">
                  Paid on {formatDate(invoice.paidAt)} via {invoice.paymentMethod || "manual"}
                </p>
              </div>
            </div>
          )}

          {isPartiallyPaid && (
            <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                <SplitSquareHorizontal className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-yellow-500">Partially Paid</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(invoice.totalPaid, invoice.currency ?? "USD")} of{" "}
                  {formatCurrency(invoice.total, invoice.currency ?? "USD")} paid
                </p>
                <Progress value={paymentProgress} className="mt-2 h-2" />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-yellow-500/30 hover:bg-yellow-500/10"
                onClick={() => setPartialPaymentDialogOpen(true)}
              >
                <Banknote className="h-4 w-4" />
                Record Payment
              </Button>
            </div>
          )}

          {isOverdue && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                <Clock className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-400">Payment Overdue</p>
                <p className="text-sm text-muted-foreground">
                  This invoice was due on {formatDate(invoice.dueDate)}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-500/30 hover:bg-red-500/10"
                onClick={() => setReminderDialogOpen(true)}
                disabled={!!cooldownInfo}
              >
                <Mail className="h-4 w-4" />
                Send Reminder
              </Button>
            </div>
          )}

          {/* Payment History (if has payments) */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-secondary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                      <CreditCard className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Payment History</CardTitle>
                      <CardDescription>
                        {invoice.payments.length} payment{invoice.payments.length === 1 ? "" : "s"} recorded
                      </CardDescription>
                    </div>
                  </div>
                  {isPending && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPartialPaymentDialogOpen(true)}
                    >
                      <Banknote className="h-4 w-4" />
                      Record Payment
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-green-500">
                            {formatCurrency(payment.amount, invoice.currency ?? "USD")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.paymentMethod || "Manual"} • {formatDate(payment.paidAt)}
                          </p>
                        </div>
                      </div>
                      {payment.notes && (
                        <p className="text-xs text-muted-foreground max-w-50 truncate">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Summary */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-medium text-green-500">
                      {formatCurrency(invoice.totalPaid, invoice.currency ?? "USD")}
                    </span>
                  </div>
                  {invoice.remainingBalance > 0 && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Remaining Balance</span>
                      <span className="font-medium text-orange-500">
                        {formatCurrency(invoice.remainingBalance, invoice.currency ?? "USD")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Partial Payment Settings (for draft/sent invoices) */}
          {["draft", "sent", "viewed"].includes(invoice.status) && (
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-secondary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                      <SplitSquareHorizontal className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Partial Payments</CardTitle>
                      <CardDescription>
                        {invoice.allowPartialPayments 
                          ? "Clients can make multiple payments" 
                          : "Clients must pay the full amount"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPartialSettingsDialogOpen(true)}
                  >
                    {invoice.allowPartialPayments ? "Disable" : "Enable"}
                  </Button>
                </div>
              </CardHeader>
              {invoice.allowPartialPayments && (
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Partial payments enabled</span>
                    {invoice.minimumPaymentAmount && (
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                        Min: {formatCurrency(invoice.minimumPaymentAmount, invoice.currency ?? "USD")}
                      </span>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Reminders Card (for pending invoices) */}
          {isPending && (
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-secondary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20">
                      <Bell className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Reminders</CardTitle>
                      <CardDescription>
                        {invoice.reminderCount === 0 
                          ? "No reminders sent yet" 
                          : `${invoice.reminderCount} reminder${invoice.reminderCount === 1 ? '' : 's'} sent`}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="auto-remind"
                        checked={invoice.autoRemind}
                        onCheckedChange={() => toggleAutoRemind.mutate({ id: invoiceId })}
                      />
                      <Label htmlFor="auto-remind" className="text-sm text-muted-foreground cursor-pointer">
                        Auto-remind
                      </Label>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Recent Reminders */}
                {invoice.reminders && invoice.reminders.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Recent Reminders</p>
                    <div className="space-y-2">
                      {invoice.reminders.slice(0, 3).map((reminder) => (
                        <div
                          key={reminder.id}
                          className="flex items-start gap-3 rounded-lg bg-secondary/30 p-3"
                        >
                          <Bell className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium">
                                {reminderTypeLabels[reminder.reminderType] || reminder.reminderType}
                              </p>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatDate(reminder.sentAt)}
                              </span>
                            </div>
                            {reminder.customMessage && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                "{reminder.customMessage}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Send Reminder Button */}
                <div className="pt-2">
                  {cooldownInfo ? (
                    <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Next reminder available in {cooldownInfo.hoursRemaining} hour{cooldownInfo.hoursRemaining === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setReminderDialogOpen(true)}
                    >
                      <Send className="h-4 w-4" />
                      Send Reminder Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Preview */}
          <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-secondary/80 to-secondary/40 p-6 border-b border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
                  <p className="text-muted-foreground mt-1">
                    {invoice.project ? `Project: ${invoice.project.name}` : "General Invoice"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {invoice.allowPartialPayments && invoice.status !== "paid" && (
                    <Badge variant="secondary" className="text-xs">
                      <SplitSquareHorizontal className="h-3 w-3 mr-1" />
                      Partial OK
                    </Badge>
                  )}
                  <Badge variant={isOverdue ? "destructive" : isPartiallyPaid ? "warning" : status?.variant} className="text-sm px-3 py-1">
                    {isOverdue ? "Overdue" : status?.label}
                  </Badge>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Client & Dates */}
              <div className="grid gap-6 sm:grid-cols-2 mb-8">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Bill To</p>
                  <p className="font-semibold text-lg">{invoice.client.name}</p>
                  {invoice.client.company && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Building className="h-3.5 w-3.5" />
                      <span>{invoice.client.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{invoice.client.email}</span>
                  </div>
                </div>
                <div className="sm:text-right space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Issue Date</p>
                    <div className="flex items-center gap-1.5 sm:justify-end">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{formatDate(invoice.createdAt)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Due Date</p>
                    <div className={cn("flex items-center gap-1.5 sm:justify-end", isOverdue && "text-destructive")}>
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-border/50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide w-20">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide w-28">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide w-28">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-4">{item.description}</td>
                        <td className="px-4 py-4 text-right text-muted-foreground">{item.quantity}</td>
                        <td className="px-4 py-4 text-right text-muted-foreground">
                          {formatCurrency(item.unitPrice, invoice.currency ?? "USD")}
                        </td>
                        <td className="px-4 py-4 text-right font-medium">
                          {formatCurrency(item.amount, invoice.currency ?? "USD")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-72 space-y-2 rounded-xl bg-secondary/30 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal, invoice.currency ?? "USD")}</span>
                  </div>
                  {(invoice.tax ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tax {invoice.taxRate && `(${invoice.taxRate}%)`}
                      </span>
                      <span>{formatCurrency(invoice.tax!, invoice.currency ?? "USD")}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border/50 pt-3 text-xl font-bold">
                    <span>Total</span>
                    <span className={invoice.status === "paid" ? "text-green-500" : ""}>
                      {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                    </span>
                  </div>
                  {invoice.totalPaid > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-500">
                        <span>Paid</span>
                        <span>-{formatCurrency(invoice.totalPaid, invoice.currency ?? "USD")}</span>
                      </div>
                      {invoice.remainingBalance > 0 && (
                        <div className="flex justify-between text-sm font-medium text-orange-500 pt-2 border-t border-border/50">
                          <span>Balance Due</span>
                          <span>{formatCurrency(invoice.remainingBalance, invoice.currency ?? "USD")}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span>Created {formatDate(invoice.createdAt)}</span>
                  {invoice.sentAt && <span> • Sent {formatDate(invoice.sentAt)}</span>}
                  {invoice.viewedAt && <span> • Viewed {formatDate(invoice.viewedAt)}</span>}
                </div>
                {invoice.status !== "paid" && invoice.status !== "partially_paid" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}