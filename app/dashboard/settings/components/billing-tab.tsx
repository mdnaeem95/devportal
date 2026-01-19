"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Check, AlertCircle, ExternalLink } from "lucide-react";

interface BillingTabProps {
  stripeStatus: {
    connected: boolean;
    accountId?: string | null;      // Added null
    chargesEnabled?: boolean;        // Added
    payoutsEnabled?: boolean;        // Added
    detailsSubmitted?: boolean;
    requirements?: {
      currently_due?: string[] | null;
    };
    error?: string;                  // Added
  } | undefined;
  stripeLoading: boolean;
  onStripeRefetch: () => void;
}

export function BillingTab({ stripeStatus, stripeLoading, onStripeRefetch }: BillingTabProps) {
  const getOnboardingLink = trpc.stripe.getOnboardingLink.useMutation({
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_blank");
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
      onStripeRefetch();
    },
    onError: (error) => toast.error(error.message || "Failed to disconnect Stripe"),
  });

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect Stripe? You won't be able to accept payments until you reconnect.")) {
      disconnectStripe.mutate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Settings */}
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
                      onClick={handleDisconnect}
                      disabled={disconnectStripe.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      Disconnect
                    </Button>
                  </>
                ) : stripeStatus?.accountId ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => getOnboardingLink.mutate()}
                      disabled={getOnboardingLink.isPending}
                    >
                      {getOnboardingLink.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Continue Setup"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={disconnectStripe.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      Start Over
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
                    ) : (
                      "Connect Stripe"
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Pending requirements */}
            {stripeStatus?.accountId && !stripeStatus?.connected && stripeStatus?.requirements?.currently_due && stripeStatus.requirements.currently_due.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-2">
                  Complete these items to start accepting payments:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {stripeStatus.requirements.currently_due.slice(0, 3).map((req: string) => (
                    <li key={req} className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                      {req.replace(/_/g, " ").replace(/\./g, " â†’ ")}
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
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Manage your Zovo subscription.
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
  );
}