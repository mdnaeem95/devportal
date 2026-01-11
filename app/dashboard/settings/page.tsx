"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, User, Building, CreditCard, Bell, Upload, ChevronDown, Check, AlertCircle, ExternalLink,
  X, ImageIcon } from "lucide-react";

type TabId = "profile" | "business" | "billing" | "notifications";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "business", label: "Business", icon: Building },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
];

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  
  // Check for Stripe redirect params
  useEffect(() => {
    const tab = searchParams.get("tab");
    const stripeStatus = searchParams.get("stripe");
    
    if (tab === "payments") {
      setActiveTab("billing");
    }
    
    if (stripeStatus === "success") {
      toast.success("Stripe account connected successfully!");
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard/settings?tab=payments");
    } else if (stripeStatus === "refresh") {
      toast.info("Please complete your Stripe onboarding");
    }
  }, [searchParams]);

  // Fetch settings
  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings } = trpc.settings.get.useQuery();
  
  // Fetch Stripe status
  const { data: stripeStatus, isLoading: stripeLoading, refetch: refetchStripe } = trpc.stripe.getStatus.useQuery();

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification preferences
  const [emailInvoicePaid, setEmailInvoicePaid] = useState(true);
  const [emailContractSigned, setEmailContractSigned] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(false);

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setBusinessName(settings.businessName || "");
      setBusinessAddress(settings.businessAddress || "");
      setTaxId(settings.taxId || "");
      setCurrency(settings.currency || "USD");
      setLogoUrl(settings.logoUrl || null);
      setEmailInvoicePaid(settings.notifications.emailInvoicePaid);
      setEmailContractSigned(settings.notifications.emailContractSigned);
      setEmailWeeklyDigest(settings.notifications.emailWeeklyDigest);
    }
  }, [settings]);

  // Mutations
  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Business settings saved");
      refetchSettings();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  const updateLogo = trpc.settings.updateLogo.useMutation({
    onSuccess: () => {
      toast.success("Logo updated");
      refetchSettings();
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update logo");
    },
  });

  const getLogoUploadUrl = trpc.settings.getLogoUploadUrl.useMutation();

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const updateNotifications = trpc.settings.updateNotifications.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences saved");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save preferences");
    },
  });

  const getOnboardingLink = trpc.stripe.getOnboardingLink.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start Stripe onboarding");
    },
  });

  const getDashboardLink = trpc.stripe.getDashboardLink.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to open Stripe dashboard");
    },
  });

  const disconnectStripe = trpc.stripe.disconnect.useMutation({
    onSuccess: () => {
      toast.success("Stripe disconnected");
      refetchStripe();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect Stripe");
    },
  });

  const handleSaveBusiness = async () => {
    updateSettings.mutate({
      businessName: businessName || null,
      businessAddress: businessAddress || null,
      taxId: taxId || null,
      currency: currency as "USD" | "EUR" | "GBP" | "SGD" | "AUD" | "CAD",
    });
  };

  const handleSaveNotifications = async () => {
    updateNotifications.mutate({
      emailInvoicePaid,
      emailContractSigned,
      emailWeeklyDigest,
    });
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setIsUploadingLogo(true);

    try {
      // 1. Get presigned URL from server
      const { uploadUrl, fileUrl } = await getLogoUploadUrl.mutateAsync({
        fileName: logoFile.name,
        contentType: logoFile.type,
      });

      // 2. Upload directly to R2/S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: logoFile,
        headers: {
          "Content-Type": logoFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // 3. Update logo URL in database
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Only call the mutation if there's an existing logo in the database
    if (logoUrl) {
      try {
        await updateLogo.mutateAsync({ logoUrl: null });
      } catch (error) {
        toast.error("Failed to remove logo");
      }
    }
  };

  const handleConnectStripe = () => {
    getOnboardingLink.mutate();
  };

  const handleOpenStripeDashboard = () => {
    getDashboardLink.mutate();
  };

  const handleDisconnectStripe = () => {
    if (confirm("Are you sure you want to disconnect Stripe? You won't be able to accept payments until you reconnect.")) {
      disconnectStripe.mutate();
    }
  };

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

  return (
    <>
      <Header
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="flex-1 overflow-auto">
        {/* Tabs */}
        <div className="border-b border-border/50 bg-card/30 px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="mx-auto max-w-2xl">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Your personal information from your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Avatar */}
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
                        <p className="font-medium">{user?.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <a href="https://accounts.clerk.com" target="_blank" rel="noopener">
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
              </div>
            )}

            {/* Business Tab */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>
                      This information appears on your invoices and contracts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                            {displayLogo ? "Change Logo" : "Upload Logo"}
                          </Button>
                          {logoFile && (
                            <Button
                              size="sm"
                              onClick={handleLogoUpload}
                              disabled={isUploadingLogo}
                              className="gradient-primary border-0"
                            >
                              {isUploadingLogo ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              {isUploadingLogo ? "Uploading..." : "Save Logo"}
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recommended: Square image, at least 200x200px, max 2MB
                      </p>
                    </div>

                    {/* Business Name */}
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        placeholder="Your Business Name"
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
                        disabled={updateSettings.isPending}
                        className="gradient-primary border-0"
                      >
                        {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {updateSettings.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-6">
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
                              <p className="text-sm text-muted-foreground">
                                Checking status...
                              </p>
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
                                onClick={handleOpenStripeDashboard}
                                disabled={getDashboardLink.isPending}
                              >
                                {getDashboardLink.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ExternalLink className="h-4 w-4" />
                                )}
                                Dashboard
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDisconnectStripe}
                                disabled={disconnectStripe.isPending}
                                className="text-destructive hover:text-destructive"
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={handleConnectStripe}
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
                      
                      {/* Show requirements if incomplete */}
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
                            <p className="text-sm text-muted-foreground">
                              Coming soon
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" disabled>
                          Coming Soon
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>
                      Manage your DevPortal subscription.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-primary/50 bg-primary/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Free Trial</p>
                          <p className="text-sm text-muted-foreground">
                            12 days remaining
                          </p>
                        </div>
                        <Button className="gradient-primary border-0">
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                      Choose what emails you want to receive.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        id: "invoicePaid",
                        label: "Invoice paid",
                        description: "Get notified when a client pays an invoice",
                        checked: emailInvoicePaid,
                        onChange: setEmailInvoicePaid,
                      },
                      {
                        id: "contractSigned",
                        label: "Contract signed",
                        description: "Get notified when a client signs a contract",
                        checked: emailContractSigned,
                        onChange: setEmailContractSigned,
                      },
                      {
                        id: "weeklyDigest",
                        label: "Weekly digest",
                        description: "Receive a weekly summary of your activity",
                        checked: emailWeeklyDigest,
                        onChange: setEmailWeeklyDigest,
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <button
                          onClick={() => item.onChange(!item.checked)}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            item.checked ? "bg-primary" : "bg-secondary"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
                              item.checked ? "left-6" : "left-1"
                            )}
                          />
                        </button>
                      </div>
                    ))}

                    <div className="pt-4 flex justify-end">
                      <Button
                        onClick={handleSaveNotifications}
                        disabled={updateNotifications.isPending}
                        className="gradient-primary border-0"
                      >
                        {updateNotifications.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {updateNotifications.isPending ? "Saving..." : "Save Preferences"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}