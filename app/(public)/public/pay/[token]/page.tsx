"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Loader2, CheckCircle2, Clock, AlertCircle, CreditCard, Building, Calendar } from "lucide-react";

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-500" },
  sent: { label: "Pending Payment", color: "bg-blue-500" },
  viewed: { label: "Pending Payment", color: "bg-blue-500" },
  paid: { label: "Paid", color: "bg-green-500" },
  overdue: { label: "Overdue", color: "bg-red-500" },
  cancelled: { label: "Cancelled", color: "bg-gray-500" },
};

export default function PublicPaymentPage({ params }: { params: { token: string } }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: invoice, isLoading, error } = trpc.invoice.getByToken.useQuery({
    token: params.token,
  });

  // Simulated payment handler (would integrate with Stripe in production)
  const handlePayment = async () => {
    setIsProcessing(true);
    // In production: Create Stripe checkout session and redirect
    // For now, simulate a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert("Payment integration coming soon! This would redirect to Stripe Checkout.");
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error?.data?.code === "NOT_FOUND" || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <AlertCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-xl font-semibold">Invoice Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This invoice doesn't exist or the link may have expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const isPaid = invoice.status === "paid";
  const canPay = ["sent", "viewed", "overdue"].includes(invoice.status);

  return (
    <>
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {invoice.business?.logoUrl ? (
              <img
                src={invoice.business.logoUrl}
                alt={invoice.business.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <Building className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <p className="font-semibold">{invoice.business?.name || "Invoice"}</p>
              <p className="text-xs text-muted-foreground">Invoice {invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "h-2 w-2 rounded-full",
              isPaid ? "bg-green-500" : isOverdue ? "bg-red-500" : "bg-blue-500"
            )} />
            <span className="text-sm text-muted-foreground">
              {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-8">
        {/* Status Banner */}
        {isPaid && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            <div>
              <p className="font-semibold text-green-400">Payment Complete</p>
              <p className="text-sm text-muted-foreground">
                Thank you! This invoice has been paid.
              </p>
            </div>
          </div>
        )}

        {isOverdue && !isPaid && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <Clock className="h-6 w-6 text-red-400" />
            <div>
              <p className="font-semibold text-red-400">Payment Overdue</p>
              <p className="text-sm text-muted-foreground">
                This invoice was due on {formatDate(invoice.dueDate)}. Please pay as soon as possible.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Invoice Details */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              {/* Header */}
              <div className="bg-secondary/50 p-6 border-b border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice</p>
                    <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
                    {invoice.project && (
                      <p className="text-muted-foreground mt-1">
                        Project: {invoice.project.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount Due</p>
                    <p className={cn(
                      "text-3xl font-bold",
                      isPaid ? "text-success" : ""
                    )}>
                      {formatCurrency(invoice.total, invoice.currency ?? "SGD")}
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Bill To / From */}
                <div className="grid gap-6 sm:grid-cols-2 mb-8">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">From</p>
                    <p className="font-semibold">{invoice.business?.name}</p>
                    <p className="text-muted-foreground text-sm">{invoice.business?.email}</p>
                    {invoice.business?.address && (
                      <p className="text-muted-foreground text-sm mt-1">{invoice.business.address}</p>
                    )}
                    {invoice.business?.taxId && (
                      <p className="text-muted-foreground text-sm">Tax ID: {invoice.business.taxId}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Bill To</p>
                    <p className="font-semibold">{invoice.client.name}</p>
                    {invoice.client.company && (
                      <p className="text-muted-foreground text-sm">{invoice.client.company}</p>
                    )}
                    <p className="text-muted-foreground text-sm">{invoice.client.email}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex gap-6 mb-8 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Issued:</span>
                    <span>{formatDate(invoice.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Due:</span>
                    <span className={isOverdue && !isPaid ? "text-destructive font-medium" : ""}>
                      {formatDate(invoice.dueDate)}
                    </span>
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
                            {formatCurrency(invoice.total, invoice.currency ?? "SGD")}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(invoice.total, invoice.currency ?? "SGD")}
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
                      <span>{formatCurrency(invoice.total, invoice.currency ?? "SGD")}</span>
                    </div>
                    {invoice.tax && invoice.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tax {invoice.taxRate && `(${invoice.taxRate}%)`}
                        </span>
                        <span>{formatCurrency(invoice.total, invoice.currency ?? "SGD")}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border/50 pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span className={isPaid ? "text-success" : ""}>
                        {formatCurrency(invoice.total, invoice.currency ?? "SGD")}
                      </span>
                    </div>
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
          </div>

          {/* Payment Sidebar */}
          <div className="space-y-4">
            {canPay && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Pay This Invoice</h3>
                  
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Amount Due</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(invoice.total, invoice.currency ?? "SGD")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due Date</span>
                        <span className={isOverdue ? "text-destructive" : ""}>
                          {formatDate(invoice.dueDate)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full gradient-primary border-0 h-12 text-base"
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                      {isProcessing ? "Processing..." : "Pay Now"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment powered by Stripe
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {isPaid && (
              <Card className="bg-card/50 backdrop-blur-sm border-green-500/30">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-400">Payment Complete</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Thank you for your payment!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Questions?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Contact {invoice.business?.name} directly:
                </p>
                <a
                  href={`mailto:${invoice.business?.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {invoice.business?.email}
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/30 mt-12">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Invoice {invoice.invoiceNumber} • {invoice.business?.name}</p>
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <Link href="/" className="font-medium text-foreground hover:text-primary transition-colors">
                DevPortal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}