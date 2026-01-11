"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CreditCard, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Unlink, Banknote, ArrowRight } from "lucide-react";

export function StripeSettings() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const { data: status, isLoading, refetch } = trpc.stripe.getStatus.useQuery();
  const { data: balance } = trpc.stripe.getBalance.useQuery(undefined, {
    enabled: status?.connected ?? false,
  });

  const getOnboardingLink = trpc.stripe.getOnboardingLink.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      setIsConnecting(false);
    },
  });

  const getDashboardLink = trpc.stripe.getDashboardLink.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
  });

  const disconnect = trpc.stripe.disconnect.useMutation({
    onSuccess: () => {
      refetch();
      setIsDisconnecting(false);
    },
    onError: () => {
      setIsDisconnecting(false);
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);
    getOnboardingLink.mutate();
  };

  const handleDisconnect = () => {
    if (confirm("Are you sure you want to disconnect Stripe? You won't be able to receive payments until you reconnect.")) {
      setIsDisconnecting(true);
      disconnect.mutate();
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not connected state
  if (!status?.connected) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF]/20">
              <CreditCard className="h-5 w-5 text-[#635BFF]" />
            </div>
            <div>
              <CardTitle>Stripe Connect</CardTitle>
              <CardDescription>Accept credit card payments from clients</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {status?.detailsSubmitted && !status.chargesEnabled && (
            <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4">
              <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning">Setup Incomplete</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Stripe account requires additional information before you can accept payments.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Accept card payments</p>
                <p className="text-sm text-muted-foreground">
                  Clients can pay invoices instantly with credit or debit cards
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Automatic payouts</p>
                <p className="text-sm text-muted-foreground">
                  Funds are deposited directly to your bank account
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Secure & compliant</p>
                <p className="text-sm text-muted-foreground">
                  PCI-compliant payment processing handled by Stripe
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-[#635BFF] hover:bg-[#5851ea] text-white"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect with Stripe
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You'll be redirected to Stripe to complete setup. Takes about 5 minutes.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Connected state
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle>Stripe Connected</CardTitle>
              <CardDescription>Your account is ready to accept payments</CardDescription>
            </div>
          </div>
          <Badge variant="success" className="text-sm">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance */}
        {balance && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Banknote className="h-4 w-4" />
                Available Balance
              </div>
              <p className="mt-1 text-2xl font-bold text-success">
                {balance.available.length > 0
                  ? formatCurrency(balance.available[0].amount, balance.available[0].currency.toUpperCase())
                  : "$0.00"}
              </p>
            </div>
            <div className="rounded-lg border border-border/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                Pending Balance
              </div>
              <p className="mt-1 text-2xl font-bold">
                {balance.pending.length > 0
                  ? formatCurrency(balance.pending[0].amount, balance.pending[0].currency.toUpperCase())
                  : "$0.00"}
              </p>
            </div>
          </div>
        )}

        {/* Status indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Charges enabled</span>
            <Badge variant={status.chargesEnabled ? "success" : "secondary"}>
              {status.chargesEnabled ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Payouts enabled</span>
            <Badge variant={status.payoutsEnabled ? "success" : "secondary"}>
              {status.payoutsEnabled ? "Yes" : "No"}
            </Badge>
          </div>
        </div>

        {/* Requirements warning */}
        {status.requirements?.currently_due && status.requirements.currently_due.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4">
            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning">Action Required</p>
              <p className="text-sm text-muted-foreground mt-1">
                Stripe requires additional information. Please update your account to continue receiving payments.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Update Information
                    <ExternalLink className="h-3 w-3" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => getDashboardLink.mutate()}
            disabled={getDashboardLink.isPending}
          >
            {getDashboardLink.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Stripe Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Status
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unlink className="h-4 w-4" />
            )}
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}