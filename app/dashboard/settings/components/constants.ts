// Currencies supported
export const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
] as const;

export type CurrencyCode = typeof currencies[number]["code"];

// Payment terms options
export const paymentTermsOptions = [
  { value: 7, label: "Net 7 (Due in 7 days)" },
  { value: 14, label: "Net 14 (Due in 14 days)" },
  { value: 15, label: "Net 15 (Due in 15 days)" },
  { value: 30, label: "Net 30 (Due in 30 days)" },
  { value: 45, label: "Net 45 (Due in 45 days)" },
  { value: 60, label: "Net 60 (Due in 60 days)" },
] as const;

// Contract expiry options
export const contractExpiryOptions = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
  { value: 45, label: "45 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
] as const;

// Time rounding options
export const roundingOptions = [
  { value: 0, label: "No rounding" },
  { value: 1, label: "Round to nearest minute" },
  { value: 5, label: "Round to nearest 5 minutes" },
  { value: 6, label: "Round to nearest 6 minutes (0.1 hour)" },
  { value: 15, label: "Round to nearest 15 minutes" },
  { value: 30, label: "Round to nearest 30 minutes" },
] as const;

// Retroactive entry limit options
export const retroactiveOptions = [
  { value: 0, label: "Same day only" },
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
] as const;

// Daily hour warning options
export const dailyHourOptions = [
  { value: 8, label: "8 hours" },
  { value: 10, label: "10 hours" },
  { value: 12, label: "12 hours" },
  { value: 14, label: "14 hours" },
  { value: 16, label: "16 hours" },
] as const;

// Tab definitions
export type TabId = "profile" | "business" | "invoicing" | "contracts" | "time" | "portal" | "billing" | "notifications" | "data";

export const tabs: { id: TabId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "business", label: "Business" },
  { id: "invoicing", label: "Invoicing" },
  { id: "contracts", label: "Contracts" },
  { id: "time", label: "Time Tracking" },
  { id: "portal", label: "Client Portal" },
  { id: "billing", label: "Billing" },
  { id: "notifications", label: "Notifications" },
  { id: "data", label: "Data & Security" },
];