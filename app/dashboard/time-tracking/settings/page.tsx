"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, DollarSign, AlertTriangle, Eye, Timer, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Link from "next/link";

export default function TimeTrackingSettingsPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: settings, isLoading } = trpc.timeTracking.getSettings.useQuery();

  const [formData, setFormData] = useState({
    defaultHourlyRate: "",
    maxRetroactiveDays: "7",
    dailyHourWarning: "720",
    idleTimeoutMinutes: "30",
    roundToMinutes: "0",
    minimumEntryMinutes: "1",
    allowOverlapping: false,
    clientVisibleLogs: true,
    requireDescription: false,
    autoStopAtMidnight: true,
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        defaultHourlyRate: settings.defaultHourlyRate ? (settings.defaultHourlyRate / 100).toString() : "",
        maxRetroactiveDays: settings.maxRetroactiveDays?.toString() || "7",
        dailyHourWarning: settings.dailyHourWarning?.toString() || "720",
        idleTimeoutMinutes: settings.idleTimeoutMinutes?.toString() || "30",
        roundToMinutes: settings.roundToMinutes?.toString() || "0",
        minimumEntryMinutes: settings.minimumEntryMinutes?.toString() || "1",
        allowOverlapping: settings.allowOverlapping || false,
        clientVisibleLogs: settings.clientVisibleLogs ?? true,
        requireDescription: settings.requireDescription || false,
        autoStopAtMidnight: settings.autoStopAtMidnight ?? true,
      });
    }
  }, [settings]);

  const updateSettings = trpc.timeTracking.updateSettings.useMutation({
    onSuccess: () => {
      utils.timeTracking.getSettings.invalidate();
      toast.success("Settings saved");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    updateSettings.mutate({
      defaultHourlyRate: formData.defaultHourlyRate ? Math.round(parseFloat(formData.defaultHourlyRate) * 100) : undefined,
      maxRetroactiveDays: parseInt(formData.maxRetroactiveDays) || 7,
      dailyHourWarning: parseInt(formData.dailyHourWarning) || 720,
      idleTimeoutMinutes: parseInt(formData.idleTimeoutMinutes) || 30,
      roundToMinutes: parseInt(formData.roundToMinutes) || 0,
      minimumEntryMinutes: parseInt(formData.minimumEntryMinutes) || 1,
      allowOverlapping: formData.allowOverlapping,
      clientVisibleLogs: formData.clientVisibleLogs,
      requireDescription: formData.requireDescription,
      autoStopAtMidnight: formData.autoStopAtMidnight,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/time-tracking">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Time Tracking Settings
          </h1>
          <p className="text-muted-foreground">
            Configure time tracking rules and integrity settings
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Billing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Billing Defaults
            </CardTitle>
            <CardDescription>
              Default rates and billing configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Default Hourly Rate</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="100.00"
                  className="pl-9"
                  value={formData.defaultHourlyRate}
                  onChange={(e) => setFormData({ ...formData, defaultHourlyRate: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Applied to new time entries when no project rate is set
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roundTo">Round Time To</Label>
              <Select
                value={formData.roundToMinutes}
                onValueChange={(v) => setFormData({ ...formData, roundToMinutes: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No rounding</SelectItem>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="6">6 minutes (0.1 hour)</SelectItem>
                  <SelectItem value="15">15 minutes (quarter hour)</SelectItem>
                  <SelectItem value="30">30 minutes (half hour)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Round tracked time to the nearest increment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minEntry">Minimum Entry Duration</Label>
              <Select
                value={formData.minimumEntryMinutes}
                onValueChange={(v) => setFormData({ ...formData, minimumEntryMinutes: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Entries shorter than this will be rounded up
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Integrity Settings */}
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Shield className="h-5 w-5" />
              Integrity & Anti-Abuse
            </CardTitle>
            <CardDescription>
              Settings to ensure accurate and trustworthy time data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retroactive">Manual Entry Limit</Label>
              <Select
                value={formData.maxRetroactiveDays}
                onValueChange={(v) => setFormData({ ...formData, maxRetroactiveDays: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Same day only</SelectItem>
                  <SelectItem value="1">1 day back</SelectItem>
                  <SelectItem value="3">3 days back</SelectItem>
                  <SelectItem value="7">7 days back</SelectItem>
                  <SelectItem value="14">14 days back</SelectItem>
                  <SelectItem value="30">30 days back</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How far back manual time entries can be added
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyWarning">Daily Hour Warning</Label>
              <Select
                value={formData.dailyHourWarning}
                onValueChange={(v) => setFormData({ ...formData, dailyHourWarning: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480">8 hours</SelectItem>
                  <SelectItem value="600">10 hours</SelectItem>
                  <SelectItem value="720">12 hours</SelectItem>
                  <SelectItem value="960">16 hours</SelectItem>
                  <SelectItem value="1440">24 hours (no warning)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Warn when daily logged time exceeds this limit
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="overlap">Allow Overlapping Entries</Label>
                <p className="text-xs text-muted-foreground">
                  Can entries overlap in time?
                </p>
              </div>
              <Switch
                id="overlap"
                checked={formData.allowOverlapping}
                onCheckedChange={(v: any) => setFormData({ ...formData, allowOverlapping: v })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="requireDesc">Require Description</Label>
                <p className="text-xs text-muted-foreground">
                  All entries must have a description
                </p>
              </div>
              <Switch
                id="requireDesc"
                checked={formData.requireDescription}
                onCheckedChange={(v: any) => setFormData({ ...formData, requireDescription: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timer Behavior */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Timer Behavior
            </CardTitle>
            <CardDescription>
              How the timer operates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idle">Idle Timeout</Label>
              <Select
                value={formData.idleTimeoutMinutes}
                onValueChange={(v) => setFormData({ ...formData, idleTimeoutMinutes: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Disabled</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Auto-pause timer after this idle period
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="midnight">Auto-Stop at Midnight</Label>
                <p className="text-xs text-muted-foreground">
                  Stop running timers at 11:59 PM
                </p>
              </div>
              <Switch
                id="midnight"
                checked={formData.autoStopAtMidnight}
                onCheckedChange={(v: any) => setFormData({ ...formData, autoStopAtMidnight: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Client Transparency
            </CardTitle>
            <CardDescription>
              What clients can see in their portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="clientLogs">Show Time Logs to Clients</Label>
                <p className="text-xs text-muted-foreground">
                  Clients can see billable time entries in their project portal
                </p>
              </div>
              <Switch
                id="clientLogs"
                checked={formData.clientVisibleLogs}
                onCheckedChange={(v: any) => setFormData({ ...formData, clientVisibleLogs: v })}
              />
            </div>

            {formData.clientVisibleLogs && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                <div className="font-medium flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Transparency Mode Enabled
                </div>
                <p className="mt-1 text-xs">
                  Clients will see a breakdown of billable time with entry types 
                  (tracked vs manual) clearly labeled. This builds trust and justifies invoices.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">How Anti-Abuse Features Work</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-blue-700">
                <li><strong>Entry Type Labels:</strong> All entries are marked as "Tracked" (real-time timer) or "Manual" (added after the fact)</li>
                <li><strong>Audit Trail:</strong> All edits to time entries are logged with timestamps</li>
                <li><strong>Locked Entries:</strong> Once an entry is invoiced, it cannot be modified</li>
                <li><strong>Retroactive Limits:</strong> Manual entries can only be added within your configured timeframe</li>
                <li><strong>No Future Entries:</strong> Time cannot be logged for future dates</li>
                <li><strong>Overlap Prevention:</strong> Prevents logging multiple entries for the same time period</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="gradient-primary border-0"
        >
          <Save className="mr-2 h-4 w-4" />
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}