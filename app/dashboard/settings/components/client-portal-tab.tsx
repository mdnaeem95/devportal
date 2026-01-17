"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import { Toggle, SettingRow } from "./shared";

interface ClientPortalTabProps {
  settings: {
    clientPortal: {
      defaultPasswordProtected: boolean;
      defaultShowTimeLogs: boolean;
    };
  };
  onRefetch: () => void;
}

export function ClientPortalTab({ settings, onRefetch }: ClientPortalTabProps) {
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [showTimeLogs, setShowTimeLogs] = useState(true);

  useEffect(() => {
    const p = settings.clientPortal;
    setPasswordProtected(p.defaultPasswordProtected);
    setShowTimeLogs(p.defaultShowTimeLogs);
  }, [settings]);

  const updateClientPortal = trpc.settings.updateClientPortal.useMutation({
    onSuccess: () => {
      toast.success("Client portal settings saved");
      onRefetch();
    },
    onError: (error) => toast.error(error.message || "Failed to save"),
  });

  const handleSave = () => {
    updateClientPortal.mutate({
      defaultPortalPasswordProtected: passwordProtected,
      defaultShowTimeLogs: showTimeLogs,
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Client Portal Defaults</CardTitle>
        <CardDescription>
          Configure default settings for project client portals. You can override these on individual projects.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingRow
          label="Password protect by default"
          description="Require a password to view new project portals"
        >
          <Toggle checked={passwordProtected} onChange={setPasswordProtected} />
        </SettingRow>

        <SettingRow
          label="Show time logs to clients"
          description="Clients can see tracked time in their portal"
        >
          <Toggle checked={showTimeLogs} onChange={setShowTimeLogs} />
        </SettingRow>

        {showTimeLogs && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-600">Building Trust</p>
                <p className="text-muted-foreground">
                  When clients can see time logs, they'll see which entries were tracked in 
                  real-time vs. added manually. This transparency builds trust for hourly billing.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateClientPortal.isPending}
            className="gradient-primary border-0"
          >
            {updateClientPortal.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}