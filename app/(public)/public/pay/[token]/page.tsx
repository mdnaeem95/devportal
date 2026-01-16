"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { InvoicePDFButton } from "@/components/pdf/pdf-download-button";
import { Loader2, Building, CheckCircle2, FileText, CreditCard, AlertCircle, ExternalLink, Download, DollarSign, SplitSquareHorizontal, Receipt } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string | null; 
  paidAt: Date;     
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

export default function PaymentPage() {
  const { token } = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");

  const success = searchParams.get("success") === "true";
  const cancelled = searchParams.get("cancelled") === "true";

  const { data: invoice, isLoading, refetch } = trpc.invoice.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  // Refetch if we just completed payment
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => refetch(), 1000);
      return () => clearTimeout(timer);
    }
  }, [success, refetch]);

  const handlePayment = async () => {
    if (!invoice) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Calculate amount to pay
      const amountToPay = paymentMode === "partial" && partialAmount
        ? Math.round(parseFloat(partialAmount) * 100)
        : invoice.remainingBalance;

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          payToken: token,
          amount: amountToPay,
        }),
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
  const isPartiallyPaid = invoice.status === "partially_paid";
  const isOverdue = !isPaid && !isPartiallyPaid && invoice.dueDate && new Date(invoice.dueDate) < new Date();
  const lineItems = invoice.lineItems as LineItem[];
  const payments = (invoice.payments ?? []) as Payment[];
  
  // Calculate amounts
  const paidAmount = invoice.totalPaid;  
  const remainingBalance = invoice.remainingBalance;
  const paidPercentage = paidAmount > 0 ? Math.round((paidAmount / invoice.total) * 100) : 0;

  // Validate partial amount
  const partialAmountCents = partialAmount ? Math.round(parseFloat(partialAmount) * 100) : 0;
  const minPayment = invoice.minimumPaymentAmount || 0;
  const isValidPartialAmount = partialAmountCents > 0 && 
    partialAmountCents <= remainingBalance &&
    (partialAmountCents >= minPayment || partialAmountCents === remainingBalance);

  // Can show partial payment option?
  const canPayPartial = invoice.allowPartialPayments && remainingBalance > (minPayment || 100);

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
            variant={isPaid ? "default" : isPartiallyPaid ? "secondary" : isOverdue ? "destructive" : "secondary"}
            className={cn(
              isPaid && "bg-green-500",
              isPartiallyPaid && "bg-yellow-500 text-yellow-950"
            )}
          >
            {isPaid ? "Paid" : isPartiallyPaid ? "Partially Paid" : isOverdue ? "Overdue" : invoice.status}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Success Message */}
        {(success || isPaid) && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {isPaid ? "Payment Complete!" : "Payment Successful!"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isPaid 
                      ? "This invoice has been fully paid. A receipt has been sent to your email."
                      : "Thank you for your payment. A receipt has been sent to your email."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Partially Paid Banner */}
        {isPartiallyPaid && !success && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30">
            <CardContent className="py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                  <SplitSquareHorizontal className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Partially Paid</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(paidAmount, invoice.currency ?? "USD")} of {formatCurrency(invoice.total, invoice.currency ?? "USD")} paid
                  </p>
                </div>
              </div>
              <Progress value={paidPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2 text-right">{paidPercentage}% paid</p>
            </CardContent>
          </Card>
        )}

        {/* Cancelled Message */}
        {cancelled && !isPaid && (
          <Card className="mb-8 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-400">Payment Cancelled</h2>
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
          <Card className="mb-8 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Payment Error</h2>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
            {invoice.allowPartialPayments && !isPaid && (
              <Badge variant="outline" className="border-primary/30 text-primary">
                <SplitSquareHorizontal className="h-3 w-3 mr-1" />
                Partial payments
              </Badge>
            )}
          </div>
          <p className="mt-2 text-muted-foreground">
            {isPaid
              ? `Paid on ${formatDate(invoice.paidAt!)}`
              : `Due ${formatDate(invoice.dueDate)}`}
          </p>
        </div>

        {/* Amount Card */}
        <Card className="mb-8 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-8">
            <div className="text-center">
              {isPartiallyPaid ? (
                <>
                  <p className="text-sm text-muted-foreground">Remaining Balance</p>
                  <p className="mt-2 text-5xl font-bold">
                    {formatCurrency(remainingBalance, invoice.currency ?? "USD")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    of {formatCurrency(invoice.total, invoice.currency ?? "USD")} total
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className={cn(
                    "mt-2 text-5xl font-bold",
                    isPaid && "text-green-600"
                  )}>
                    {formatCurrency(invoice.total, invoice.currency ?? "USD")}
                  </p>
                </>
              )}
            </div>

            {!isPaid && (
              <div className="mt-8 space-y-4">
                {/* Payment Mode Toggle */}
                {canPayPartial && (
                  <div className="flex gap-2 p-1 rounded-lg bg-secondary/50 border border-border/50">
                    <button
                      type="button"
                      onClick={() => setPaymentMode("full")}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all cursor-pointer",
                        paymentMode === "full"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Pay Full Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode("partial")}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all cursor-pointer",
                        paymentMode === "partial"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Pay Partial Amount
                    </button>
                  </div>
                )}

                {/* Partial Amount Input */}
                {paymentMode === "partial" && canPayPartial && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="partialAmount">Amount to pay</Label>
                    <div className="relative max-w-xs mx-auto">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="partialAmount"
                        type="number"
                        min={(minPayment || 100) / 100}
                        max={remainingBalance / 100}
                        step="0.01"
                        placeholder={`${((minPayment || 100) / 100).toFixed(2)} - ${(remainingBalance / 100).toFixed(2)}`}
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        className="pl-9 text-center"
                      />
                    </div>
                    {minPayment > 0 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Minimum payment: {formatCurrency(minPayment, invoice.currency ?? "USD")}
                      </p>
                    )}
                  </div>
                )}

                {/* Pay Button */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="text-lg px-8 cursor-pointer"
                    onClick={handlePayment}
                    disabled={isProcessing || (paymentMode === "partial" && !isValidPartialAmount)}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay {paymentMode === "partial" && partialAmount
                          ? formatCurrency(partialAmountCents, invoice.currency ?? "USD")
                          : formatCurrency(remainingBalance, invoice.currency ?? "USD")}
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Secure payment powered by Stripe
                </p>
              </div>
            )}

            {isPaid && (
              <div className="mt-6 flex justify-center">
                <InvoicePDFButton
                  invoiceId={invoice.id}
                  payToken={token}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </InvoicePDFButton>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        {payments.length > 0 && (
          <Card className="mb-8 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {formatCurrency(payment.amount, invoice.currency ?? "USD")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.paidAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {payment.paymentMethod}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  <span>{formatCurrency(invoice.total, invoice.currency ?? "USD")}</span>
                </div>
                {paidAmount > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Paid</span>
                      <span>-{formatCurrency(paidAmount, invoice.currency ?? "USD")}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border/50 text-primary">
                      <span>Remaining</span>
                      <span>{formatCurrency(remainingBalance, invoice.currency ?? "USD")}</span>
                    </div>
                  </>
                )}
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
              <span className="font-medium text-foreground">Zovo</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}