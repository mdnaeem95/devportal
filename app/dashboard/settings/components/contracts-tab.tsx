"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ChevronDown } from "lucide-react";
import { Toggle, SettingRow, InfoTooltip } from "./shared";
import { contractExpiryOptions } from "./constants";

interface ContractsTabProps {
  settings: {
    contractDefaults: {
      expiryDays: number;
      autoRemind: boolean;
      sequentialSigning: boolean;
    };
  };
  onRefetch: () => void;
}

export function ContractsTab({ settings, onRefetch }: ContractsTabProps) {
  const [expiryDays, setExpiryDays] = useState(30);
  const [autoRemind, setAutoRemind] = useState(true);
  const [sequentialSigning, setSequentialSigning] = useState(true);

  useEffect(() => {
    const d = settings.contractDefaults;
    setExpiryDays(d.expiryDays);
    setAutoRemind(d.autoRemind);
    setSequentialSigning(d.sequentialSigning);
  }, [settings]);

  const updateContractDefaults = trpc.settings.updateContractDefaults.useMutation({
    onSuccess: () => {
      toast.success("Contract settings saved");
      onRefetch();
    },
    onError: (error) => toast.error(error.message || "Failed to save"),
  });

  const handleSave = () => {
    updateContractDefaults.mutate({
      defaultContractExpiryDays: expiryDays,
      contractAutoRemind: autoRemind,
      contractSequentialSigning: sequentialSigning,
    });
  };

  return (
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
          <Label htmlFor="expiryDays">
            Contract Expiry Period
            <InfoTooltip text="Days before an unsigned contract expires" />
          </Label>
          <div className="relative">
            <select
              id="expiryDays"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value))}
              className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {contractExpiryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="pt-4 border-t border-border/50 space-y-1">
          <SettingRow
            label="Sign before sending"
            description="Sign contracts first to show commitment before sending to clients"
          >
            <Toggle checked={sequentialSigning} onChange={setSequentialSigning} />
          </SettingRow>

          <SettingRow
            label="Auto-send reminders"
            description="Automatically remind clients about unsigned contracts"
          >
            <Toggle checked={autoRemind} onChange={setAutoRemind} />
          </SettingRow>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateContractDefaults.isPending}
            className="gradient-primary border-0"
          >
            {updateContractDefaults.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}