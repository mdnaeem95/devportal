"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Loader2, User, Building, CreditCard, Bell, Upload, ChevronDown, Check, AlertCircle, ExternalLink,
  X, ImageIcon, Receipt, FileText, Clock, Globe, Shield, Download, Trash2, Info, HelpCircle
} from "lucide-react";

type TabId = "profile" | "business" | "invoicing" | "contracts" | "time" | "portal" | "billing" | "notifications" | "data";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "business", label: "Business", icon: Building },
  { id: "invoicing", label: "Invoicing", icon: Receipt },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "time", label: "Time Tracking", icon: Clock },
  { id: "portal", label: "Client Portal", icon: Globe },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Data & Security", icon: Shield },
];

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
];

const paymentTermsOptions = [
  { value: 7, label: "Net 7 (Due in 7 days)" },
  { value: 14, label: "Net 14 (Due in 14 days)" },
  { value: 15, label: "Net 15 (Due in 15 days)" },
  { value: 30, label: "Net 30 (Due in 30 days)" },
  { value: 45, label: "Net 45 (Due in 45 days)" },
  { value: 60, label: "Net 60 (Due in 60 days)" },
];

const roundingOptions = [
  { value: 0, label: "No rounding" },
  { value: 1, label: "Round to nearest minute" },
  { value: 5, label: "Round to nearest 5 minutes" },
  { value: 6, label: "Round to nearest 6 minutes (0.1 hour)" },
  { value: 15, label: "Round to nearest 15 minutes" },
  { value: 30, label: "Round to nearest 30 minutes" },
];

// Toggle Switch Component
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
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

// Setting Row Component
function SettingRow({ 
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
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// Info Tooltip Component
function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex ml-1.5 cursor-help">
      <HelpCircle className="h-4 w-4 text-muted-foreground" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {text}
      </span>
    </span>
  );
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  
  // Check for URL params (tab selection, Stripe redirect)
  useEffect(() => {
    const tab = searchParams.get("tab");
    const stripeStatus = searchParams.get("stripe");
    
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab as TabId);
    }
    
    if (stripeStatus === "success") {
      toast.success("Stripe account connected successfully!");
      window.history.replaceState({}, "", "/dashboard/settings?tab=billing");
    } else if (stripeStatus === "refresh") {
      toast.info("Please complete your Stripe onboarding");
    }
  }, [searchParams]);

  // Fetch settings
  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings } = trpc.settings.get.useQuery();
  
  // Fetch Stripe status
  const { data: stripeStatus, isLoading: stripeLoading, refetch: refetchStripe } = trpc.stripe.getStatus.useQuery();

  // ========== Form States ==========
  
  // Business
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Invoice Defaults
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(14);
  const [defaultTaxRate, setDefaultTaxRate] = useState<string>("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [defaultAllowPartialPayments, setDefaultAllowPartialPayments] = useState(false);
  const [defaultMinimumPaymentPercent, setDefaultMinimumPaymentPercent] = useState<string>("");

  // Contract Defaults
  const [defaultContractExpiryDays, setDefaultContractExpiryDays] = useState(30);
  const [contractAutoRemind, setContractAutoRemind] = useState(true);
  const [contractSequentialSigning, setContractSequentialSigning] = useState(true);

  // Time Tracking
  const [defaultHourlyRate, setDefaultHourlyRate] = useState<string>("");
  const [maxRetroactiveDays, setMaxRetroactiveDays] = useState(7);
  const [dailyHourWarning, setDailyHourWarning] = useState(12); // Hours
  const [idleTimeoutMinutes, setIdleTimeoutMinutes] = useState(30);
  const [roundToMinutes, setRoundToMinutes] = useState(0);
  const [minimumEntryMinutes, setMinimumEntryMinutes] = useState(1);
  const [allowOverlapping, setAllowOverlapping] = useState(false);
  const [clientVisibleLogs, setClientVisibleLogs] = useState(true);
  const [requireDescription, setRequireDescription] = useState(false);
  const [autoStopAtMidnight, setAutoStopAtMidnight] = useState(true);

  // Client Portal
  const [defaultPortalPasswordProtected, setDefaultPortalPasswordProtected] = useState(false);
  const [defaultShowTimeLogs, setDefaultShowTimeLogs] = useState(true);

  // Notifications
  const [emailInvoicePaid, setEmailInvoicePaid] = useState(true);
  const [emailContractSigned, setEmailContractSigned] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(false);
  const [emailPaymentReminders, setEmailPaymentReminders] = useState(true);
  const [emailContractReminders, setEmailContractReminders] = useState(true);
  const [emailMilestonesDue, setEmailMilestonesDue] = useState(true);

  // Data & Security
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      // Business
      setBusinessName(settings.businessName || "");
      setBusinessAddress(settings.businessAddress || "");
      setTaxId(settings.taxId || "");
      setCurrency(settings.currency || "USD");
      setLogoUrl(settings.logoUrl || null);
      
      // Invoice Defaults
      setDefaultPaymentTerms(settings.invoiceDefaults.paymentTerms);
      setDefaultTaxRate(settings.invoiceDefaults.taxRate?.toString() || "");
      setInvoicePrefix(settings.invoiceDefaults.prefix || "INV");
      setInvoiceNotes(settings.invoiceDefaults.notes || "");
      setDefaultAllowPartialPayments(settings.invoiceDefaults.allowPartialPayments);
      setDefaultMinimumPaymentPercent(settings.invoiceDefaults.minimumPaymentPercent?.toString() || "");
      
      // Contract Defaults
      setDefaultContractExpiryDays(settings.contractDefaults.expiryDays);
      setContractAutoRemind(settings.contractDefaults.autoRemind);
      setContractSequentialSigning(settings.contractDefaults.sequentialSigning);
      
      // Time Tracking
      setDefaultHourlyRate(settings.timeTracking.defaultHourlyRate ? (settings.timeTracking.defaultHourlyRate / 100).toString() : "");
      setMaxRetroactiveDays(settings.timeTracking.maxRetroactiveDays);
      setDailyHourWarning(settings.timeTracking.dailyHourWarning / 60); // Convert minutes to hours
      setIdleTimeoutMinutes(settings.timeTracking.idleTimeoutMinutes);
      setRoundToMinutes(settings.timeTracking.roundToMinutes);
      setMinimumEntryMinutes(settings.timeTracking.minimumEntryMinutes);
      setAllowOverlapping(settings.timeTracking.allowOverlapping);
      setClientVisibleLogs(settings.timeTracking.clientVisibleLogs);
      setRequireDescription(settings.timeTracking.requireDescription);
      setAutoStopAtMidnight(settings.timeTracking.autoStopAtMidnight);
      
      // Client Portal
      setDefaultPortalPasswordProtected(settings.clientPortal.defaultPasswordProtected);
      setDefaultShowTimeLogs(settings.clientPortal.defaultShowTimeLogs);
      
      // Notifications
      setEmailInvoicePaid(settings.notifications.emailInvoicePaid);
      setEmailContractSigned(settings.notifications.emailContractSigned);
      setEmailWeeklyDigest(settings.notifications.emailWeeklyDigest);
      setEmailPaymentReminders(settings.notifications.emailPaymentReminders);
      setEmailContractReminders(settings.notifications.emailContractReminders);
      setEmailMilestonesDue(settings.notifications.emailMilestonesDue);
    }
  }, [settings]);

  // ========== Mutations ==========
  
  const updateBusiness = trpc.settings.updateBusiness.useMutation({
    onSuccess: () => {
      toast.success("Business settings saved");
      refetchSettings();
    },
    onError: (error) => toast.error(error.message || "Failed to save settings"),
  });

  const updateInvoiceDefaults = trpc.settings.updateInvoiceDefaults.useMutation({
    onSuccess: () => {
      toast.success("Invoice defaults saved");
      refetchSettings();
    },
    onError: (error) => toast.error(error.message || "Failed to save settings"),
  });

  const updateContractDefaults = trpc.settings.updateContractDefaults.useMutation({
    onSuccess: () => {
      toast.success("Contract defaults saved");
      refetchSettings();
    },
    onError: (error) => toast.error(error.message || "Failed to save settings"),
  });

  const updateTimeTracking = trpc.settings.updateTimeTracking.useMutation({
    onSuccess: () => {
      toast.success("Time tracking settings saved");
      refetchSettings();
    },
    onError: (error) => toast.error(error.message || "Failed to save settings"),
  });

  const updateClientPortal = trpc.settings.updateClientPortal.useMutation({
    onSuccess: () => {
      toast.success("Client portal settings saved");
      refetchSettings();
    },
    onError: (error) => toast.error(error.message || "Failed to save settings"),
  });

  const updateNotifications = trpc.settings.updateNotifications.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences saved");
      refetchSettings();
    },
    onError: (error) => toast.error(error.message || "Failed to save preferences"),
  });

  const updateLogo = trpc.settings.updateLogo.useMutation({
    onSuccess: () => {
      toast.success("Logo updated");
      refetchSettings();
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error) => toast.error(error.message || "Failed to update logo"),
  });

  const getLogoUploadUrl = trpc.settings.getLogoUploadUrl.useMutation();

  const exportData = trpc.settings.exportData.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zovo-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to export data");
      setIsExporting(false);
    },
  });

  const deleteAccount = trpc.settings.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted");
      router.push("/");
    },
    onError: (error) => toast.error(error.message || "Failed to delete account"),
  });

  const getOnboardingLink = trpc.stripe.getOnboardingLink.useMutation({
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (error) => toast.error(error.message || "Failed to start Stripe onboarding"),
  });

  const getDashboardLink = trpc.stripe.getDashboardLink.useMutation({
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_blank");
    },
    onError: (error) => toast.error(error.message || "Failed to open Stripe dashboard"),
  });

  const disconnectStripe = trpc.stripe.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Stripe disconnected");
      refetchStripe();
    },
    onError: (error) => toast.error(error.message || "Failed to disconnect Stripe"),
  });

  // ========== Handlers ==========

  const handleSaveBusiness = () => {
    updateBusiness.mutate({
      businessName: businessName || null,
      businessAddress: businessAddress || null,
      taxId: taxId || null,
      currency: currency as "USD" | "EUR" | "GBP" | "SGD" | "AUD" | "CAD",
    });
  };

  const handleSaveInvoiceDefaults = () => {
    updateInvoiceDefaults.mutate({
      defaultPaymentTerms,
      defaultTaxRate: defaultTaxRate ? parseFloat(defaultTaxRate) : null,
      invoicePrefix,
      invoiceNotes: invoiceNotes || null,
      defaultAllowPartialPayments,
      defaultMinimumPaymentPercent: defaultMinimumPaymentPercent ? parseInt(defaultMinimumPaymentPercent) : null,
    });
  };

  const handleSaveContractDefaults = () => {
    updateContractDefaults.mutate({
      defaultContractExpiryDays,
      contractAutoRemind,
      contractSequentialSigning,
    });
  };

  const handleSaveTimeTracking = () => {
    updateTimeTracking.mutate({
      defaultHourlyRate: defaultHourlyRate ? Math.round(parseFloat(defaultHourlyRate) * 100) : null,
      maxRetroactiveDays,
      dailyHourWarning: dailyHourWarning * 60, // Convert hours to minutes
      idleTimeoutMinutes,
      roundToMinutes,
      minimumEntryMinutes,
      allowOverlapping,
      clientVisibleLogs,
      requireDescription,
      autoStopAtMidnight,
    });
  };

  const handleSaveClientPortal = () => {
    updateClientPortal.mutate({
      defaultPortalPasswordProtected,
      defaultShowTimeLogs,
    });
  };

  const handleSaveNotifications = () => {
    updateNotifications.mutate({
      emailInvoicePaid,
      emailContractSigned,
      emailWeeklyDigest,
      emailPaymentReminders,
      emailContractReminders,
      emailMilestonesDue,
    });
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setIsUploadingLogo(true);

    try {
      const { uploadUrl, fileUrl } = await getLogoUploadUrl.mutateAsync({
        fileName: logoFile.name,
        contentType: logoFile.type,
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: logoFile,
        headers: { "Content-Type": logoFile.type },
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file");
      await updateLogo.mutateAsync({ logoUrl: fileUrl });
    } catch (error) {
      console.error("[Settings] Logo upload error:", error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (logoUrl) {
      try {
        await updateLogo.mutateAsync({ logoUrl: null });
      } catch (error) {
        toast.error("Failed to remove logo");
      }
    }
  };

  const handleExportData = () => {
    setIsExporting(true);
    exportData.mutate();
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== "DELETE MY ACCOUNT") {
      toast.error("Please type 'DELETE MY ACCOUNT' to confirm");
      return;
    }
    deleteAccount.mutate({ confirmation: "DELETE MY ACCOUNT" });
  };

  // ========== Loading State ==========

  if (!isLoaded || settingsLoading) {
    return (
      <>
        <Header title="Settings" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  const displayLogo = logoPreview || logoUrl;
  const currencySymbol = currencies.find(c => c.code === currency)?.symbol || "$";

  return (
    <>
      <Header
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="flex-1 overflow-auto">
        {/* Tabs - Scrollable on mobile */}
        <div className="border-b border-border/50 bg-card/30">
          <nav className="flex overflow-x-auto px-4 md:px-6 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 md:p-6">
          <div className="mx-auto max-w-2xl space-y-6">
            
            {/* ========== Profile Tab ========== */}
            {activeTab === "profile" && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Your personal information from your Clerk account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.fullName || "Profile"}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-xl gradient-primary text-2xl font-bold text-white">
                          {user?.firstName?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{user?.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <a href="https://accounts.clerk.com" target="_blank" rel="noopener">
                          <ExternalLink className="h-4 w-4" />
                          Manage Account
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Profile information is managed through your Clerk account.
                      Click "Manage Account" to update your name, email, or profile picture.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ========== Business Tab ========== */}
            {activeTab === "business" && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    This information appears on your invoices, contracts, and client-facing pages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo */}
                  <div className="space-y-2">
                    <Label>Business Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {displayLogo ? (
                          <div className="relative">
                            <img
                              src={displayLogo}
                              alt="Business logo"
                              className="h-16 w-16 rounded-lg object-cover border border-border/50"
                            />
                            <button
                              onClick={handleRemoveLogo}
                              className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoSelect}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          {displayLogo ? "Change" : "Upload"}
                        </Button>
                        {logoFile && (
                          <Button
                            size="sm"
                            onClick={handleLogoUpload}
                            disabled={isUploadingLogo}
                            className="gradient-primary border-0"
                          >
                            {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            {isUploadingLogo ? "Uploading..." : "Save Logo"}
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Square image, at least 200×200px, max 2MB
                    </p>
                  </div>

                  {/* Business Name */}
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g., Alex Dev Studio"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <textarea
                      id="businessAddress"
                      placeholder={"123 Main St\nCity, State 12345\nCountry"}
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      rows={3}
                      className="flex w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Tax ID */}
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                    <Input
                      id="taxId"
                      placeholder="e.g., EIN, VAT, GST number"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <div className="relative">
                      <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {currencies.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} - {c.name} ({c.symbol})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={handleSaveBusiness}
                      disabled={updateBusiness.isPending}
                      className="gradient-primary border-0"
                    >
                      {updateBusiness.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ========== Invoicing Tab ========== */}
            {activeTab === "invoicing" && (
              <>
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
                          value={defaultPaymentTerms}
                          onChange={(e) => setDefaultPaymentTerms(parseInt(e.target.value))}
                          className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {paymentTermsOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
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
                        value={defaultTaxRate}
                        onChange={(e) => setDefaultTaxRate(e.target.value)}
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

                    <div className="pt-4 border-t border-border/50 space-y-4">
                      <h4 className="font-medium">Partial Payments</h4>
                      
                      <SettingRow
                        label="Allow partial payments by default"
                        description="Clients can pay in installments"
                      >
                        <Toggle
                          checked={defaultAllowPartialPayments}
                          onChange={setDefaultAllowPartialPayments}
                        />
                      </SettingRow>

                      {defaultAllowPartialPayments && (
                        <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                          <Label htmlFor="minPaymentPercent">Minimum Payment (%)</Label>
                          <Input
                            id="minPaymentPercent"
                            type="number"
                            min="10"
                            max="90"
                            placeholder="e.g., 25"
                            value={defaultMinimumPaymentPercent}
                            onChange={(e) => setDefaultMinimumPaymentPercent(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Minimum percentage clients must pay per installment
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        onClick={handleSaveInvoiceDefaults}
                        disabled={updateInvoiceDefaults.isPending}
                        className="gradient-primary border-0"
                      >
                        {updateInvoiceDefaults.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ========== Contracts Tab ========== */}
            {activeTab === "contracts" && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Contract Defaults</CardTitle>
                  <CardDescription>
                    Configure default behavior for contract creation and signing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Expiry Days */}
                  <div className="space-y-2">
                    <Label htmlFor="contractExpiry">
                      Contract Expiry Period
                      <InfoTooltip text="Days before an unsigned contract expires" />
                    </Label>
                    <div className="relative">
                      <select
                        id="contractExpiry"
                        value={defaultContractExpiryDays}
                        onChange={(e) => setDefaultContractExpiryDays(parseInt(e.target.value))}
                        className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value={7}>7 days</option>
                        <option value={14}>14 days</option>
                        <option value={30}>30 days</option>
                        <option value={45}>45 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50 space-y-4">
                    <SettingRow
                      label="Sign before sending"
                      description="Sign contracts first to show commitment before sending to clients"
                    >
                      <Toggle
                        checked={contractSequentialSigning}
                        onChange={setContractSequentialSigning}
                      />
                    </SettingRow>

                    <SettingRow
                      label="Auto-send reminders"
                      description="Automatically remind clients about unsigned contracts"
                    >
                      <Toggle
                        checked={contractAutoRemind}
                        onChange={setContractAutoRemind}
                      />
                    </SettingRow>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={handleSaveContractDefaults}
                      disabled={updateContractDefaults.isPending}
                      className="gradient-primary border-0"
                    >
                      {updateContractDefaults.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ========== Time Tracking Tab ========== */}
            {activeTab === "time" && (
              <>
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Time Tracking Settings</CardTitle>
                    <CardDescription>
                      Configure how time tracking works for you and your clients.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Default Hourly Rate */}
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Default Hourly Rate ({currencySymbol})</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 150"
                        value={defaultHourlyRate}
                        onChange={(e) => setDefaultHourlyRate(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Applied to new time entries when no project rate is set
                      </p>
                    </div>

                    {/* Rounding */}
                    <div className="space-y-2">
                      <Label htmlFor="rounding">Time Rounding</Label>
                      <div className="relative">
                        <select
                          id="rounding"
                          value={roundToMinutes}
                          onChange={(e) => setRoundToMinutes(parseInt(e.target.value))}
                          className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {roundingOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* Minimum Entry */}
                    <div className="space-y-2">
                      <Label htmlFor="minEntry">Minimum Entry Duration (minutes)</Label>
                      <Input
                        id="minEntry"
                        type="number"
                        min="1"
                        max="60"
                        value={minimumEntryMinutes}
                        onChange={(e) => setMinimumEntryMinutes(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Anti-Abuse Settings</CardTitle>
                    <CardDescription>
                      These settings help maintain accurate, trustworthy time records.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Max Retroactive Days */}
                    <div className="space-y-2">
                      <Label htmlFor="retroactive">
                        Max Days for Manual Entries
                        <InfoTooltip text="How far back manual time entries can be added" />
                      </Label>
                      <div className="relative">
                        <select
                          id="retroactive"
                          value={maxRetroactiveDays}
                          onChange={(e) => setMaxRetroactiveDays(parseInt(e.target.value))}
                          className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value={0}>Same day only</option>
                          <option value={1}>1 day</option>
                          <option value={3}>3 days</option>
                          <option value={7}>7 days</option>
                          <option value={14}>14 days</option>
                          <option value={30}>30 days</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* Daily Hour Warning */}
                    <div className="space-y-2">
                      <Label htmlFor="dailyWarning">
                        Daily Hour Warning
                        <InfoTooltip text="Show warning when logging more than this per day" />
                      </Label>
                      <div className="relative">
                        <select
                          id="dailyWarning"
                          value={dailyHourWarning}
                          onChange={(e) => setDailyHourWarning(parseInt(e.target.value))}
                          className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value={8}>8 hours</option>
                          <option value={10}>10 hours</option>
                          <option value={12}>12 hours</option>
                          <option value={14}>14 hours</option>
                          <option value={16}>16 hours</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* Idle Timeout */}
                    <div className="space-y-2">
                      <Label htmlFor="idleTimeout">
                        Idle Timeout (minutes)
                        <InfoTooltip text="Auto-stop timer after this much inactivity" />
                      </Label>
                      <Input
                        id="idleTimeout"
                        type="number"
                        min="5"
                        max="120"
                        value={idleTimeoutMinutes}
                        onChange={(e) => setIdleTimeoutMinutes(parseInt(e.target.value) || 30)}
                      />
                    </div>

                    <div className="pt-4 border-t border-border/50 space-y-1">
                      <SettingRow
                        label="Allow overlapping entries"
                        description="Permit time entries that overlap with each other"
                      >
                        <Toggle
                          checked={allowOverlapping}
                          onChange={setAllowOverlapping}
                        />
                      </SettingRow>

                      <SettingRow
                        label="Require descriptions"
                        description="All time entries must have a description"
                      >
                        <Toggle
                          checked={requireDescription}
                          onChange={setRequireDescription}
                        />
                      </SettingRow>

                      <SettingRow
                        label="Auto-stop at midnight"
                        description="Prevent runaway overnight timers"
                      >
                        <Toggle
                          checked={autoStopAtMidnight}
                          onChange={setAutoStopAtMidnight}
                        />
                      </SettingRow>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        onClick={handleSaveTimeTracking}
                        disabled={updateTimeTracking.isPending}
                        className="gradient-primary border-0"
                      >
                        {updateTimeTracking.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ========== Client Portal Tab ========== */}
            {activeTab === "portal" && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Client Portal Defaults</CardTitle>
                  <CardDescription>
                    Configure default settings for project client portals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SettingRow
                    label="Password protect by default"
                    description="Require a password to view new project portals"
                  >
                    <Toggle
                      checked={defaultPortalPasswordProtected}
                      onChange={setDefaultPortalPasswordProtected}
                    />
                  </SettingRow>

                  <SettingRow
                    label="Show time logs to clients"
                    description="Clients can see tracked time in their portal"
                  >
                    <Toggle
                      checked={defaultShowTimeLogs}
                      onChange={setDefaultShowTimeLogs}
                    />
                  </SettingRow>

                  {defaultShowTimeLogs && (
                    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                      <div className="flex gap-2">
                        <Info className="h-4 w-4 text-green-500 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-green-500">Building Trust</p>
                          <p className="text-muted-foreground">
                            When clients can see time logs, they'll see which entries were tracked in real-time vs. added manually.
                            This transparency builds trust for hourly billing.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={handleSaveClientPortal}
                      disabled={updateClientPortal.isPending}
                      className="gradient-primary border-0"
                    >
                      {updateClientPortal.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ========== Billing Tab ========== */}
            {activeTab === "billing" && (
              <>
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                    <CardDescription>
                      Connect your payment provider to accept payments from clients.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stripe Connect */}
                    <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#635BFF]">
                            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Stripe</p>
                            {stripeLoading ? (
                              <p className="text-sm text-muted-foreground">Checking status...</p>
                            ) : stripeStatus?.connected ? (
                              <p className="text-sm text-green-600 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Connected and ready to accept payments
                              </p>
                            ) : stripeStatus?.accountId && !stripeStatus?.detailsSubmitted ? (
                              <p className="text-sm text-amber-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Onboarding incomplete
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Accept card payments from clients
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {stripeStatus?.connected ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => getDashboardLink.mutate()}
                                disabled={getDashboardLink.isPending}
                              >
                                {getDashboardLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                                Dashboard
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Are you sure you want to disconnect Stripe? You won't be able to accept payments until you reconnect.")) {
                                    disconnectStripe.mutate();
                                  }
                                }}
                                disabled={disconnectStripe.isPending}
                                className="text-destructive hover:text-destructive"
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => getOnboardingLink.mutate()}
                              disabled={getOnboardingLink.isPending}
                            >
                              {getOnboardingLink.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : stripeStatus?.accountId ? (
                                "Continue Setup"
                              ) : (
                                "Connect Stripe"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {stripeStatus?.accountId && !stripeStatus?.connected && stripeStatus?.requirements?.currently_due && stripeStatus.requirements.currently_due.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-sm text-muted-foreground mb-2">
                            Complete these items to start accepting payments:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {stripeStatus.requirements.currently_due.slice(0, 3).map((req: string) => (
                              <li key={req} className="flex items-center gap-2">
                                <AlertCircle className="h-3 w-3 text-amber-500" />
                                {req.replace(/_/g, " ").replace(/\./g, " → ")}
                              </li>
                            ))}
                            {stripeStatus.requirements.currently_due.length > 3 && (
                              <li className="text-muted-foreground">
                                +{stripeStatus.requirements.currently_due.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* PayPal (coming soon) */}
                    <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 opacity-60">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#003087]">
                            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">PayPal</p>
                            <p className="text-sm text-muted-foreground">Coming soon</p>
                          </div>
                        </div>
                        <Button variant="outline" disabled>Coming Soon</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Manage your Zovo subscription.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-primary/50 bg-primary/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Free Trial</p>
                          <p className="text-sm text-muted-foreground">12 days remaining</p>
                        </div>
                        <Button className="gradient-primary border-0">Upgrade to Pro</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ========== Notifications Tab ========== */}
            {activeTab === "notifications" && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Choose what emails you want to receive.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide pt-2 pb-2">Payments</h4>
                  
                  <SettingRow
                    label="Invoice paid"
                    description="Get notified when a client pays an invoice"
                  >
                    <Toggle checked={emailInvoicePaid} onChange={setEmailInvoicePaid} />
                  </SettingRow>

                  <SettingRow
                    label="Payment reminders sent"
                    description="Get notified when automatic payment reminders are sent"
                  >
                    <Toggle checked={emailPaymentReminders} onChange={setEmailPaymentReminders} />
                  </SettingRow>

                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide pt-4 pb-2">Contracts</h4>

                  <SettingRow
                    label="Contract signed"
                    description="Get notified when a client signs a contract"
                  >
                    <Toggle checked={emailContractSigned} onChange={setEmailContractSigned} />
                  </SettingRow>

                  <SettingRow
                    label="Contract reminders sent"
                    description="Get notified when automatic contract reminders are sent"
                  >
                    <Toggle checked={emailContractReminders} onChange={setEmailContractReminders} />
                  </SettingRow>

                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide pt-4 pb-2">Projects</h4>

                  <SettingRow
                    label="Milestone due dates"
                    description="Get reminded when milestones are approaching"
                  >
                    <Toggle checked={emailMilestonesDue} onChange={setEmailMilestonesDue} />
                  </SettingRow>

                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide pt-4 pb-2">Summary</h4>

                  <SettingRow
                    label="Weekly digest"
                    description="Receive a weekly summary of your activity"
                  >
                    <Toggle checked={emailWeeklyDigest} onChange={setEmailWeeklyDigest} />
                  </SettingRow>

                  <div className="pt-6 flex justify-end">
                    <Button
                      onClick={handleSaveNotifications}
                      disabled={updateNotifications.isPending}
                      className="gradient-primary border-0"
                    >
                      {updateNotifications.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ========== Data & Security Tab ========== */}
            {activeTab === "data" && (
              <>
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Export Data</CardTitle>
                    <CardDescription>
                      Download all your data including clients, projects, invoices, contracts, and time entries.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      disabled={isExporting}
                    >
                      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      {isExporting ? "Exporting..." : "Export All Data (JSON)"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Deleting your account will permanently remove:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>All clients and their data</li>
                        <li>All projects and milestones</li>
                        <li>All invoices and payment history</li>
                        <li>All contracts and signatures</li>
                        <li>All time tracking entries</li>
                        <li>All uploaded files</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirm">
                        Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm
                      </Label>
                      <Input
                        id="deleteConfirm"
                        placeholder="DELETE MY ACCOUNT"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                      />
                    </div>

                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== "DELETE MY ACCOUNT" || deleteAccount.isPending}
                    >
                      {deleteAccount.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}