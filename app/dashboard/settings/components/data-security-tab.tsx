"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Download, AlertTriangle } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export function DataSecurityTab() {
  const { signOut } = useClerk();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const exportData = trpc.settings.exportData.useMutation({
    onSuccess: (data) => {
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zovo-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to export data");
      setIsExporting(false);
    },
  });

  const deleteAccount = trpc.settings.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted");
      signOut();
    },
    onError: (error) => toast.error(error.message || "Failed to delete account"),
  });

  const handleExport = () => {
    setIsExporting(true);
    exportData.mutate();
  };

  const handleDelete = () => {
    if (deleteConfirmation !== "DELETE MY ACCOUNT") {
      toast.error("Please type 'DELETE MY ACCOUNT' to confirm");
      return;
    }
    deleteAccount.mutate({ confirmation: deleteConfirmation });
  };

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Download a copy of all your data including clients, projects, invoices, contracts, and time entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "Exporting..." : "Export All Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="bg-card/50 backdrop-blur-sm border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-muted-foreground mb-3">
              This action cannot be undone. This will permanently delete:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Your account and profile</li>
              <li>All clients and projects</li>
              <li>All invoices and payment history</li>
              <li>All contracts and signatures</li>
              <li>All time tracking data</li>
              <li>All uploaded files</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Type <span className="font-mono text-destructive">DELETE MY ACCOUNT</span> to confirm:
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="font-mono"
            />
          </div>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteConfirmation !== "DELETE MY ACCOUNT" || deleteAccount.isPending}
          >
            {deleteAccount.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete Account Permanently
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}