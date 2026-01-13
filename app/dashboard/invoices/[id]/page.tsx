"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send, Copy, Check, ExternalLink, CheckCircle2, Clock, Trash2, Download,
  Mail, Building, Calendar, FileText, Edit, MoreHorizontal, AlertTriangle } from "lucide-react";

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, color: "bg-gray-500" },
  sent: { label: "Sent", variant: "default" as const, color: "bg-blue-500" },
  viewed: { label: "Viewed", variant: "default" as const, color: "bg-purple-500" },
  paid: { label: "Paid", variant: "success" as const, color: "bg-green-500" },
  overdue: { label: "Overdue", variant: "destructive" as const, color: "bg-red-500" },
  cancelled: { label: "Cancelled", variant: "secondary" as const, color: "bg-gray-500" },
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: invoice, isLoading, refetch } = trpc.invoice.get.useQuery({ id: invoiceId });

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

  const handleMarkPaid = () => {
    setIsMarkingPaid(true);
    markPaid.mutate({ id: invoiceId });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteInvoice.mutate({ id: invoiceId });
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
    new Date(invoice.dueDate) < new Date();

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

            {["sent", "viewed"].includes(invoice.status) && !isOverdue && (
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

            {isOverdue && (
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

            <Button variant="outline" size="sm" asChild>
              <Link href={`/api/invoices/${invoiceId}/pdf`} target="_blank">
                <Download className="h-4 w-4" />
                PDF
              </Link>
            </Button>
          </div>
        }
      />

      {/* Mark as Paid Dialog */}
      <Dialog open={markPaidDialogOpen} onOpenChange={setMarkPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
            <DialogDescription>
              This will mark {invoice.invoiceNumber} as paid for{" "}
              {formatCurrency(invoice.total, invoice.currency ?? "USD")}. The client will be
              notified.
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
                <p className="font-medium text-green-400">Payment Received</p>
                <p className="text-sm text-muted-foreground">
                  Paid on {formatDate(invoice.paidAt)} via {invoice.paymentMethod || "manual"}
                </p>
              </div>
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
              <Button variant="outline" size="sm" className="border-red-500/30 hover:bg-red-500/10">
                <Mail className="h-4 w-4" />
                Send Reminder
              </Button>
            </div>
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
                <Badge variant={isOverdue ? "destructive" : status?.variant} className="text-sm px-3 py-1">
                  {isOverdue ? "Overdue" : status?.label}
                </Badge>
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
                    {lineItems.map((item, index) => (
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
                  {invoice.tax && invoice.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tax {invoice.taxRate && `(${invoice.taxRate}%)`}
                      </span>
                      <span>{formatCurrency(invoice.tax, invoice.currency ?? "USD")}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border/50 pt-3 text-xl font-bold">
                    <span>Total</span>
                    <span className={invoice.status === "paid" ? "text-green-500" : ""}>
                      {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                    </span>
                  </div>
                  {invoice.status === "paid" && invoice.paidAmount && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Amount Paid</span>
                      <span>{formatCurrency(invoice.paidAmount, invoice.currency ?? "USD")}</span>
                    </div>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}