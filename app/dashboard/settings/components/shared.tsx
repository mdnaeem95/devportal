"use client";

import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

// ========== Constants ==========

export const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
] as const;

export const paymentTermsOptions = [
  { value: 7, label: "Net 7 (Due in 7 days)" },
  { value: 14, label: "Net 14 (Due in 14 days)" },
  { value: 15, label: "Net 15 (Due in 15 days)" },
  { value: 30, label: "Net 30 (Due in 30 days)" },
  { value: 45, label: "Net 45 (Due in 45 days)" },
  { value: 60, label: "Net 60 (Due in 60 days)" },
] as const;

export const roundingOptions = [
  { value: 0, label: "No rounding" },
  { value: 1, label: "Round to nearest minute" },
  { value: 5, label: "Round to nearest 5 minutes" },
  { value: 6, label: "Round to nearest 6 minutes (0.1 hour)" },
  { value: 15, label: "Round to nearest 15 minutes" },
  { value: 30, label: "Round to nearest 30 minutes" },
] as const;

export const contractExpiryOptions = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
  { value: 45, label: "45 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
] as const;

export const retroactiveOptions = [
  { value: 0, label: "Same day only" },
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
] as const;

export const dailyHourOptions = [
  { value: 8, label: "8 hours" },
  { value: 10, label: "10 hours" },
  { value: 12, label: "12 hours" },
  { value: 14, label: "14 hours" },
  { value: 16, label: "16 hours" },
] as const;

// ========== Shared Components ==========

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide pt-4 pb-2 first:pt-0">
      {children}
    </h4>
  );
}

export function Toggle({ 
  checked, 
  onChange, 
  disabled 
}: { 
  checked: boolean; 
  onChange: (v: boolean) => void; 
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-secondary",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  );
}

export function SettingRow({ 
  label, 
  description, 
  children,
  className 
}: { 
  label: string; 
  description?: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between py-3", className)}>
      <div className="flex-1 pr-4">
        <p className="font-medium">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex ml-1.5 cursor-help">
      <HelpCircle className="h-4 w-4 text-muted-foreground" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        {text}
      </span>
    </span>
  );
}

export function SelectField({
  id,
  value,
  onChange,
  options,
  className,
}: {
  id: string;
  value: string | number;
  onChange: (value: string) => void;
  options: readonly { value: string | number; label: string }[];
  className?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20",
          className
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export function TextareaField({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="flex w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
    />
  );
}

// ========== Types ==========

export type SettingsData = {
  businessName: string | null;
  businessAddress: string | null;
  taxId: string | null;
  currency: string;
  logoUrl: string | null;
  stripeConnected: boolean;
  invoiceDefaults: {
    paymentTerms: number;
    taxRate: number | null;
    prefix: string;
    notes: string | null;
    allowPartialPayments: boolean;
    minimumPaymentPercent: number | null;
  };
  contractDefaults: {
    expiryDays: number;
    autoRemind: boolean;
    sequentialSigning: boolean;
  };
  timeTracking: {
    defaultHourlyRate: number | null;
    maxRetroactiveDays: number;
    dailyHourWarning: number;
    idleTimeoutMinutes: number;
    roundToMinutes: number;
    minimumEntryMinutes: number;
    allowOverlapping: boolean;
    clientVisibleLogs: boolean;
    requireDescription: boolean;
    autoStopAtMidnight: boolean;
  };
  clientPortal: {
    defaultPasswordProtected: boolean;
    defaultShowTimeLogs: boolean;
  };
  notifications: {
    emailInvoicePaid: boolean;
    emailContractSigned: boolean;
    emailWeeklyDigest: boolean;
    emailPaymentReminders: boolean;
    emailContractReminders: boolean;
    emailMilestonesDue: boolean;
  };
};

export type StripeStatus = {
  connected: boolean;
  accountId?: string;
  detailsSubmitted?: boolean;
  requirements?: {
    currently_due?: string[];
  };
};