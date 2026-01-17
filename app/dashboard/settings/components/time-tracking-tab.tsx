"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ChevronDown, Shield } from "lucide-react";
import { Toggle, SettingRow, InfoTooltip } from "./shared";
import { roundingOptions, retroactiveOptions, dailyHourOptions, currencies } from "./constants";

interface TimeTrackingTabProps {
  settings: {
    currency: string;
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
  };
  onRefetch: () => void;
}

export function TimeTrackingTab({ settings, onRefetch }: TimeTrackingTabProps) {
  const [hourlyRate, setHourlyRate] = useState("");
  const [roundToMinutes, setRoundToMinutes] = useState(0);
  const [minimumEntryMinutes, setMinimumEntryMinutes] = useState(1);
  const [maxRetroactiveDays, setMaxRetroactiveDays] = useState(7);
  const [dailyHourWarning, setDailyHourWarning] = useState(12);
  const [idleTimeoutMinutes, setIdleTimeoutMinutes] = useState(30);
  const [allowOverlapping, setAllowOverlapping] = useState(false);
  const [requireDescription, setRequireDescription] = useState(false);
  const [autoStopAtMidnight, setAutoStopAtMidnight] = useState(true);
  const [clientVisibleLogs, setClientVisibleLogs] = useState(true);

  useEffect(() => {
    const t = settings.timeTracking;
    setHourlyRate(t.defaultHourlyRate ? (t.defaultHourlyRate / 100).toString() : "");
    setRoundToMinutes(t.roundToMinutes);
    setMinimumEntryMinutes(t.minimumEntryMinutes);
    setMaxRetroactiveDays(t.maxRetroactiveDays);
    setDailyHourWarning(t.dailyHourWarning / 60); // minutes to hours
    setIdleTimeoutMinutes(t.idleTimeoutMinutes);
    setAllowOverlapping(t.allowOverlapping);
    setRequireDescription(t.requireDescription);
    setAutoStopAtMidnight(t.autoStopAtMidnight);
    setClientVisibleLogs(t.clientVisibleLogs);
  }, [settings]);

  const updateTimeTracking = trpc.settings.updateTimeTracking.useMutation({
    onSuccess: () => {
      toast.success("Time tracking settings saved");
      onRefetch();
    },
    onError: (error) => toast.error(error.message || "Failed to save"),
  });

  const handleSave = () => {
    updateTimeTracking.mutate({
      defaultHourlyRate: hourlyRate ? Math.round(parseFloat(hourlyRate) * 100) : null,
      roundToMinutes,
      minimumEntryMinutes,
      maxRetroactiveDays,
      dailyHourWarning: dailyHourWarning * 60, // hours to minutes
      idleTimeoutMinutes,
      allowOverlapping,
      requireDescription,
      autoStopAtMidnight,
      clientVisibleLogs,
    });
  };

  const currencySymbol = currencies.find(c => c.code === settings.currency)?.symbol || "$";

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Time Tracking</CardTitle>
          <CardDescription>
            Configure how time is recorded and calculated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Default Hourly Rate ({currencySymbol})</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 150"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
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
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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

      {/* Anti-Abuse Settings */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Anti-Abuse Settings
          </CardTitle>
          <CardDescription>
            These settings help maintain accurate, trustworthy time records for you and your clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                {retroactiveOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
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
                {dailyHourOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
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

          {/* Toggle Settings */}
          <div className="pt-4 border-t border-border/50 space-y-1">
            <SettingRow
              label="Allow overlapping entries"
              description="Permit time entries that overlap with each other"
            >
              <Toggle checked={allowOverlapping} onChange={setAllowOverlapping} />
            </SettingRow>

            <SettingRow
              label="Require descriptions"
              description="All time entries must have a description"
            >
              <Toggle checked={requireDescription} onChange={setRequireDescription} />
            </SettingRow>

            <SettingRow
              label="Auto-stop at midnight"
              description="Prevent runaway overnight timers"
            >
              <Toggle checked={autoStopAtMidnight} onChange={setAutoStopAtMidnight} />
            </SettingRow>

            <SettingRow
              label="Show time logs to clients"
              description="Clients can see tracked time in their portal"
            >
              <Toggle checked={clientVisibleLogs} onChange={setClientVisibleLogs} />
            </SettingRow>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateTimeTracking.isPending}
              className="gradient-primary border-0"
            >
              {updateTimeTracking.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}