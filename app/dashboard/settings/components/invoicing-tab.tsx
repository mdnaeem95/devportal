"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ChevronDown } from "lucide-react";
import { Toggle, InfoTooltip } from "./shared";
import { paymentTermsOptions } from "./constants";

interface InvoicingTabProps {
  settings: {
    invoiceDefaults: {
      paymentTerms: number;
      taxRate: number | null;
      prefix: string;
      notes: string | null;
      allowPartialPayments: boolean;
      minimumPaymentPercent: number | null;
    };
  };
  onRefetch: () => void;
}

export function InvoicingTab({ settings, onRefetch }: InvoicingTabProps) {
  const [paymentTerms, setPaymentTerms] = useState(14);
  const [taxRate, setTaxRate] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [allowPartialPayments, setAllowPartialPayments] = useState(false);
  const [minimumPaymentPercent, setMinimumPaymentPercent] = useState("25");

  useEffect(() => {
    const d = settings.invoiceDefaults;
    setPaymentTerms(d.paymentTerms);
    setTaxRate(d.taxRate?.toString() || "");
    setInvoicePrefix(d.prefix || "INV");
    setInvoiceNotes(d.notes || "");
    setAllowPartialPayments(d.allowPartialPayments);
    setMinimumPaymentPercent(d.minimumPaymentPercent?.toString() || "25");
  }, [settings]);

  const updateInvoiceDefaults = trpc.settings.updateInvoiceDefaults.useMutation({
    onSuccess: () => {
      toast.success("Invoice settings saved");
      onRefetch();
    },
    onError: (error) => toast.error(error.message || "Failed to save"),
  });

  const handleSave = () => {
    updateInvoiceDefaults.mutate({
      defaultPaymentTerms: paymentTerms,
      defaultTaxRate: taxRate ? parseFloat(taxRate) : null,
      invoicePrefix,
      invoiceNotes: invoiceNotes || null,
      defaultAllowPartialPayments: allowPartialPayments,
      defaultMinimumPaymentPercent: minimumPaymentPercent ? parseInt(minimumPaymentPercent) : null,
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Invoice Defaults</CardTitle>
        <CardDescription>
          These settings are applied when creating new invoices. You can override them on individual invoices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Terms */}
        <div className="space-y-2">
          <Label htmlFor="paymentTerms">Default Payment Terms</Label>
          <div className="relative">
            <select
              id="paymentTerms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(parseInt(e.target.value))}
              className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {paymentTermsOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Tax Rate */}
        <div className="space-y-2">
          <Label htmlFor="taxRate">
            Default Tax Rate (%)
            <InfoTooltip text="Leave empty for no tax" />
          </Label>
          <Input
            id="taxRate"
            type="number"
            step="0.01"
            min="0"
            max="50"
            placeholder="e.g., 8.25"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
          />
        </div>

        {/* Invoice Prefix */}
        <div className="space-y-2">
          <Label htmlFor="invoicePrefix">
            Invoice Number Prefix
            <InfoTooltip text="e.g., INV-2601-001" />
          </Label>
          <Input
            id="invoicePrefix"
            placeholder="INV"
            maxLength={10}
            value={invoicePrefix}
            onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
          />
        </div>

        {/* Invoice Notes */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNotes">
            Default Notes / Payment Instructions
            <InfoTooltip text="Appears at the bottom of invoices" />
          </Label>
          <textarea
            id="invoiceNotes"
            placeholder={"Payment is due within the stated terms.\nLate payments may incur a 1.5% monthly fee."}
            value={invoiceNotes}
            onChange={(e) => setInvoiceNotes(e.target.value)}
            rows={3}
            className="flex w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Partial Payments */}
        <div className="pt-4 border-t border-border/50 space-y-4">
          <h4 className="font-medium">Partial Payments</h4>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Allow partial payments by default</p>
              <p className="text-sm text-muted-foreground">Clients can pay in installments</p>
            </div>
            <Toggle checked={allowPartialPayments} onChange={setAllowPartialPayments} />
          </div>

          {allowPartialPayments && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label htmlFor="minPayment">Minimum Payment (%)</Label>
              <Input
                id="minPayment"
                type="number"
                min="10"
                max="90"
                placeholder="e.g., 25"
                value={minimumPaymentPercent}
                onChange={(e) => setMinimumPaymentPercent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum percentage clients must pay per installment
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateInvoiceDefaults.isPending}
            className="gradient-primary border-0"
          >
            {updateInvoiceDefaults.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}