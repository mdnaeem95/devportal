"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Import tab components
import {
  ProfileTab,
  BusinessTab,
  InvoicingTab,
  ContractsTab,
  TimeTrackingTab,
  ClientPortalTab,
  BillingTab,
  NotificationsTab,
  DataSecurityTab,
  tabs,
  type TabId,
} from "./components";

export default function SettingsPage() {
  const { isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Handle URL params for tab selection and Stripe redirects
  useEffect(() => {
    const tab = searchParams.get("tab") as TabId | null;
    const stripeStatus = searchParams.get("stripe");

    if (tab && tabs.some((t: any) => t.id === tab)) {
      setActiveTab(tab);
    }

    if (stripeStatus === "success") {
      toast.success("Stripe account connected successfully!");
      window.history.replaceState({}, "", "/dashboard/settings?tab=billing");
    } else if (stripeStatus === "refresh") {
      toast.info("Please complete your Stripe onboarding");
    }
  }, [searchParams]);

  // Fetch settings
  const {
    data: settings,
    isLoading: settingsLoading,
    refetch: refetchSettings,
  } = trpc.settings.get.useQuery();

  // Fetch Stripe status
  const {
    data: stripeStatus,
    isLoading: stripeLoading,
    refetch: refetchStripe,
  } = trpc.stripe.getStatus.useQuery();

  // Loading state
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

  // Fallback settings if query failed
  const safeSettings = settings ?? {
    businessName: null,
    businessAddress: null,
    taxId: null,
    currency: "USD",
    logoUrl: null,
    stripeConnected: false,
    invoiceDefaults: {
      paymentTerms: 14,
      taxRate: null,
      prefix: "INV",
      notes: null,
      allowPartialPayments: false,
      minimumPaymentPercent: null,
    },
    contractDefaults: {
      expiryDays: 30,
      autoRemind: true,
      sequentialSigning: true,
    },
    timeTracking: {
      defaultHourlyRate: null,
      maxRetroactiveDays: 7,
      dailyHourWarning: 720,
      idleTimeoutMinutes: 30,
      roundToMinutes: 0,
      minimumEntryMinutes: 1,
      allowOverlapping: false,
      clientVisibleLogs: true,
      requireDescription: false,
      autoStopAtMidnight: true,
    },
    clientPortal: {
      defaultPasswordProtected: false,
      defaultShowTimeLogs: true,
    },
    notifications: {
      emailInvoicePaid: true,
      emailContractSigned: true,
      emailWeeklyDigest: false,
      emailPaymentReminders: true,
      emailContractReminders: true,
      emailMilestonesDue: true,
    },
  };

  return (
    <>
      <Header title="Settings" description="Manage your account and preferences" />

      <div className="flex-1 overflow-auto">
        {/* Tab Navigation */}
        <div className="border-b border-border/50 bg-card/30 px-6 overflow-x-auto">
          <nav className="flex gap-1 min-w-max">
            {tabs.map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "cursor-pointer px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="mx-auto max-w-2xl">
            {activeTab === "profile" && <ProfileTab />}

            {activeTab === "business" && (
              <BusinessTab settings={safeSettings} onRefetch={refetchSettings} />
            )}

            {activeTab === "invoicing" && (
              <InvoicingTab settings={safeSettings} onRefetch={refetchSettings} />
            )}

            {activeTab === "contracts" && (
              <ContractsTab settings={safeSettings} onRefetch={refetchSettings} />
            )}

            {activeTab === "time" && (
              <TimeTrackingTab settings={safeSettings} onRefetch={refetchSettings} />
            )}

            {activeTab === "portal" && (
              <ClientPortalTab settings={safeSettings} onRefetch={refetchSettings} />
            )}

            {activeTab === "billing" && (
              <BillingTab
                stripeStatus={stripeStatus}
                stripeLoading={stripeLoading}
                onStripeRefetch={refetchStripe}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationsTab settings={safeSettings} onRefetch={refetchSettings} />
            )}

            {activeTab === "data" && <DataSecurityTab />}
          </div>
        </div>
      </div>
    </>
  );
}