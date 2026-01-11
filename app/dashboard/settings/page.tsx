"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, User, Building, CreditCard, Bell, Upload, ChevronDown } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Notification preferences
  const [emailInvoicePaid, setEmailInvoicePaid] = useState(true);
  const [emailContractSigned, setEmailContractSigned] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // TODO: Save to database via tRPC
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleSaveBusiness = async () => {
    setIsSaving(true);
    // TODO: Save to database via tRPC
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  if (!isLoaded) {
    return (
      <>
        <Header title="Settings" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

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
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30">
                          <Building className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4" />
                          Upload Logo
                        </Button>
                      </div>
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
                        placeholder="123 Main St&#10;City, State 12345&#10;Country"
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
                        disabled={isSaving}
                        className="gradient-primary border-0"
                      >
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSaving ? "Saving..." : "Save Changes"}
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
                      Connect your payment provider to accept payments.
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
                            <p className="text-sm text-muted-foreground">
                              Accept card payments from clients
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">
                          Connect Stripe
                        </Button>
                      </div>
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
                      <Button className="gradient-primary border-0">
                        Save Preferences
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