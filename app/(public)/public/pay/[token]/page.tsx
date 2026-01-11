"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { InvoicePDFButton } from "@/components/pdf/pdf-download-button";
import { Loader2, Building, CheckCircle2, FileText, CreditCard, AlertCircle, ExternalLink, Download } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Helper to format currency
function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

// Helper to format date
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PaymentPage({ params }: { params: { token: string } }) {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const success = searchParams.get("success") === "true";
  const cancelled = searchParams.get("cancelled") === "true";

  const { data: invoice, isLoading, refetch } = trpc.invoice.getByToken.useQuery({
    token: params.token,
  });

  // Refetch if we just completed payment
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => refetch(), 1000);
      return () => clearTimeout(timer);
    }
  }, [success, refetch]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payToken: params.token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-xl font-semibold">Invoice Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This invoice doesn't exist or the link has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = invoice.status === "paid";
  const isOverdue = !isPaid && invoice.dueDate && new Date(invoice.dueDate) < new Date();
  const lineItems = invoice.lineItems as LineItem[];

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {invoice.business?.logoUrl ? (
              <img
                src={invoice.business.logoUrl}
                alt={invoice.business.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <div>
              <p className="font-semibold">{invoice.business?.name || "Developer"}</p>
              <p className="text-xs text-muted-foreground">Invoice</p>
            </div>
          </div>
          <Badge
            variant={isPaid ? "default" : isOverdue ? "destructive" : "secondary"}
            className={isPaid ? "bg-green-500" : ""}
          >
            {isPaid ? "Paid" : isOverdue ? "Overdue" : invoice.status}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Success Message */}
        {(success || isPaid) && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-green-700">Payment Successful!</h2>
                  <p className="text-sm text-muted-foreground">
                    Thank you for your payment. A receipt has been sent to your email.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancelled Message */}
        {cancelled && !isPaid && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-amber-700">Payment Cancelled</h2>
                  <p className="text-sm text-muted-foreground">
                    Your payment was cancelled. You can try again when you're ready.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-red-700">Payment Error</h2>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
          <p className="mt-2 text-muted-foreground">
            {isPaid
              ? `Paid on ${formatDate(invoice.paidAt!)}`
              : `Due ${formatDate(invoice.dueDate)}`}
          </p>
        </div>

        {/* Amount Card */}
        <Card className="mb-8 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Amount Due</p>
            <p className={cn(
              "mt-2 text-5xl font-bold",
              isPaid && "text-green-600"
            )}>
              {formatCurrency(invoice.total, invoice.currency ?? "USD")}
            </p>
            {!isPaid && (
              <Button
                size="lg"
                className="mt-6 text-lg px-8"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay Now
                  </>
                )}
              </Button>
            )}
            {isPaid && (
              <div className="mt-6">
                <InvoicePDFButton
                  invoiceId={invoice.id}
                  payToken={params.token}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </InvoicePDFButton>
              </div>
            )}
            {!isPaid && (
              <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Secure payment powered by Stripe
              </p>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Bill To */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Bill To</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{invoice.client.name}</p>
              {invoice.client.company && (
                <p className="text-sm text-muted-foreground">{invoice.client.company}</p>
              )}
              <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
            </CardContent>
          </Card>

          {/* From */}
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">From</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{invoice.business?.name}</p>
              <p className="text-sm text-muted-foreground">{invoice.business?.email}</p>
              {invoice.business?.address && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {invoice.business.address}
                </p>
              )}
              {invoice.business?.taxId && (
                <p className="text-sm text-muted-foreground">
                  Tax ID: {invoice.business.taxId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card className="mt-6 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.unitPrice, invoice.currency ?? "USD")}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(item.amount, invoice.currency ?? "USD")}
                  </p>
                </div>
              ))}

              <div className="border-t border-border/50 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal, invoice.currency ?? "USD")}</span>
                </div>
                {(invoice.tax ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tax {invoice.taxRate && `(${invoice.taxRate}%)`}
                    </span>
                    <span>{formatCurrency(invoice.tax ?? 0, invoice.currency ?? "USD")}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border/50">
                  <span>Total</span>
                  <span className={isPaid ? "text-green-600" : ""}>
                    {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card className="mt-6 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Project Info */}
        {invoice.project && (
          <Card className="mt-6 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                Project: <span className="text-foreground">{invoice.project.name}</span>
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Invoice {invoice.invoiceNumber} for {invoice.client.name}</p>
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <span className="font-medium text-foreground">DevPortal</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}