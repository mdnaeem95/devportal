"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Toggle, SettingRow, SectionHeader } from "./shared";

interface NotificationsTabProps {
  settings: {
    notifications: {
      emailInvoicePaid: boolean;
      emailContractSigned: boolean;
      emailWeeklyDigest: boolean;
      emailPaymentReminders: boolean;
      emailContractReminders: boolean;
      emailMilestonesDue: boolean;
    };
  };
  onRefetch: () => void;
}

export function NotificationsTab({ settings, onRefetch }: NotificationsTabProps) {
  const [emailInvoicePaid, setEmailInvoicePaid] = useState(true);
  const [emailContractSigned, setEmailContractSigned] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(false);
  const [emailPaymentReminders, setEmailPaymentReminders] = useState(true);
  const [emailContractReminders, setEmailContractReminders] = useState(true);
  const [emailMilestonesDue, setEmailMilestonesDue] = useState(true);

  useEffect(() => {
    const n = settings.notifications;
    setEmailInvoicePaid(n.emailInvoicePaid);
    setEmailContractSigned(n.emailContractSigned);
    setEmailWeeklyDigest(n.emailWeeklyDigest);
    setEmailPaymentReminders(n.emailPaymentReminders);
    setEmailContractReminders(n.emailContractReminders);
    setEmailMilestonesDue(n.emailMilestonesDue);
  }, [settings]);

  const updateNotifications = trpc.settings.updateNotifications.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences saved");
      onRefetch();
    },
    onError: (error) => toast.error(error.message || "Failed to save"),
  });

  const handleSave = () => {
    updateNotifications.mutate({
      emailInvoicePaid,
      emailContractSigned,
      emailWeeklyDigest,
      emailPaymentReminders,
      emailContractReminders,
      emailMilestonesDue,
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>
          Choose what emails you want to receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Payments */}
        <SectionHeader>Payments</SectionHeader>
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

        {/* Contracts */}
        <SectionHeader>Contracts</SectionHeader>
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

        {/* Projects */}
        <SectionHeader>Projects</SectionHeader>
        <SettingRow
          label="Milestones due"
          description="Get notified when milestones are approaching their due date"
        >
          <Toggle checked={emailMilestonesDue} onChange={setEmailMilestonesDue} />
        </SettingRow>

        {/* Summary */}
        <SectionHeader>Summary</SectionHeader>
        <SettingRow
          label="Weekly digest"
          description="Receive a weekly summary of your activity"
        >
          <Toggle checked={emailWeeklyDigest} onChange={setEmailWeeklyDigest} />
        </SettingRow>

        <div className="pt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateNotifications.isPending}
            className="gradient-primary border-0"
          >
            {updateNotifications.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}