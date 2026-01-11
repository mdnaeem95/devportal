"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Send, Copy, Check, ExternalLink, CheckCircle2, Clock, Trash2 } from "lucide-react";

const statusConfig = {
  draft: { label: "Draft", variant: "secondary" as const, color: "bg-gray-500" },
  sent: { label: "Sent", variant: "default" as const, color: "bg-blue-500" },
  viewed: { label: "Viewed", variant: "default" as const, color: "bg-purple-500" },
  paid: { label: "Paid", variant: "success" as const, color: "bg-green-500" },
  overdue: { label: "Overdue", variant: "destructive" as const, color: "bg-red-500" },
  cancelled: { label: "Cancelled", variant: "secondary" as const, color: "bg-gray-500" },
};

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: invoice, isLoading, refetch } = trpc.invoice.get.useQuery({ id: params.id });

  const sendInvoice = trpc.invoice.send.useMutation({
    onSuccess: () => {
      refetch();
      setIsSending(false);
    },
    onError: () => setIsSending(false),
  });

  const markPaid = trpc.invoice.markPaid.useMutation({
    onSuccess: () => {
      refetch();
      setIsMarkingPaid(false);
    },
    onError: () => setIsMarkingPaid(false),
  });

  const deleteInvoice = trpc.invoice.delete.useMutation({
    onSuccess: () => {
      router.push("/dashboard/invoices");
    },
    onError: () => setIsDeleting(false),
  });

  const handleSend = () => {
    setIsSending(true);
    sendInvoice.mutate({ id: params.id });
  };

  const handleMarkPaid = () => {
    if (confirm("Mark this invoice as paid?")) {
      setIsMarkingPaid(true);
      markPaid.mutate({ id: params.id });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      setIsDeleting(true);
      deleteInvoice.mutate({ id: params.id });
    }
  };

  const copyPayLink = () => {
    if (invoice?.payToken) {
      const url = `${window.location.origin}/pay/${invoice.payToken}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Invoice" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <Header title="Invoice Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">This invoice doesn't exist or was deleted.</p>
          <Button asChild>
            <Link href="/dashboard/invoices">Back to Invoices</Link>
          </Button>
        </div>
      </>
    );
  }

  const status = statusConfig[invoice.status];
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
              <Button 
                onClick={handleSend} 
                disabled={isSending}
                className="gradient-primary border-0"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Invoice
              </Button>
            )}

            {["sent", "viewed", "overdue"].includes(invoice.status) && (
              <>
                <Button variant="outline" onClick={copyPayLink}>
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied!" : "Copy Pay Link"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleMarkPaid}
                  disabled={isMarkingPaid}
                >
                  {isMarkingPaid ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Mark as Paid
                </Button>
              </>
            )}

            {invoice.payToken && (
              <Button variant="outline" asChild>
                <Link href={`/public/pay/${invoice.payToken}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Status Banner */}
          {invoice.status === "paid" && (
            <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <div>
                <p className="font-medium text-green-400">Payment Received</p>
                <p className="text-sm text-muted-foreground">
                  Paid on {formatDate(invoice.paidAt)} via {invoice.paymentMethod || "manual"}
                </p>
              </div>
            </div>
          )}

          {isOverdue && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <Clock className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-medium text-red-400">Payment Overdue</p>
                <p className="text-sm text-muted-foreground">
                  This invoice was due on {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>
          )}

          {/* Invoice Preview */}
          <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="bg-secondary/50 p-6 border-b border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
                  <p className="text-muted-foreground mt-1">
                    {invoice.project ? `Project: ${invoice.project.name}` : "General Invoice"}
                  </p>
                </div>
                <Badge 
                  variant={isOverdue ? "destructive" : status.variant}
                  className="text-sm"
                >
                  {isOverdue ? "Overdue" : status.label}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Client & Dates */}
              <div className="grid gap-6 sm:grid-cols-2 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bill To</p>
                  <p className="font-semibold">{invoice.client.name}</p>
                  {invoice.client.company && (
                    <p className="text-muted-foreground">{invoice.client.company}</p>
                  )}
                  <p className="text-muted-foreground">{invoice.client.email}</p>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                    <p className="font-medium">{formatDate(invoice.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className={cn("font-medium", isOverdue && "text-destructive")}>
                      {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-20">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-28">Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {formatCurrency(item.unitPrice, invoice.currency ?? "USD")}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(item.amount, invoice.currency ?? "USD")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-4 flex justify-end">
                <div className="w-64 space-y-2">
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
                  <div className="flex justify-between border-t border-border/50 pt-2 text-lg font-bold">
                    <span>Total</span>
                    <span className={invoice.status === "paid" ? "text-success" : ""}>
                      {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                    </span>
                  </div>
                  {invoice.status === "paid" && invoice.paidAmount && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Amount Paid</span>
                      <span>{formatCurrency(invoice.paidAmount, invoice.currency ?? "USD")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Created {formatDate(invoice.createdAt)}
                  {invoice.sentAt && ` • Sent ${formatDate(invoice.sentAt)}`}
                  {invoice.viewedAt && ` • Viewed ${formatDate(invoice.viewedAt)}`}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}