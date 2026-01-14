"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, FileText, FolderOpen, Timer, Pencil, ArrowRight, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InvoiceFromTimeProps {
  projectId?: string;
  clientId?: string;
  onSuccess?: (invoiceId: string) => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function InvoiceFromTime({ projectId, clientId, onSuccess }: InvoiceFromTimeProps) {
  const router = useRouter();
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  // Get uninvoiced time entries
  const { data, isLoading } = trpc.timeTracking.getUninvoicedTime.useQuery({
    projectId,
    clientId,
  });

  const utils = trpc.useUtils();

  const entries = data?.entries || [];
  const totals = data?.totals || { totalSeconds: 0, totalEarnings: 0 };

  // Calculate selected totals
  const selectedTotals = entries
    .filter((e) => selectedEntries.has(e.id))
    .reduce(
      (acc, e) => ({
        seconds: acc.seconds + (e.duration || 0),
        earnings: acc.earnings + ((e.duration || 0) / 3600) * (e.hourlyRate || 0),
      }),
      { seconds: 0, earnings: 0 }
    );

  const toggleEntry = (id: string) => {
    const newSet = new Set(selectedEntries);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEntries(newSet);
  };

  const toggleAll = () => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map((e) => e.id)));
    }
  };

  const handleCreateInvoice = async () => {
    if (selectedEntries.size === 0) {
      toast.error("Select at least one time entry");
      return;
    }

    setIsCreating(true);

    try {
      // Group entries by date and create line items
      const lineItems = entries
        .filter((e) => selectedEntries.has(e.id))
        .map((e) => ({
          id: e.id,
          description: `${format(new Date(e.startTime), "MMM d")} - ${e.description || "Time tracked"}${e.entryType === "manual" ? " (manual)" : ""}`,
          quantity: Number((e.duration || 0) / 3600), // Convert to hours
          unitPrice: e.hourlyRate || 0,
          amount: Math.round(((e.duration || 0) / 3600) * (e.hourlyRate || 0)),
        }));

      // Navigate to new invoice page with pre-filled data
      const params = new URLSearchParams();
      if (projectId) params.set("projectId", projectId);
      if (clientId) params.set("clientId", clientId);
      params.set("fromTime", "true");
      params.set("entries", Array.from(selectedEntries).join(","));
      params.set("lineItems", JSON.stringify(lineItems));

      router.push(`/dashboard/invoices/new?${params.toString()}`);
    } catch (error) {
      toast.error("Failed to prepare invoice");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No Uninvoiced Time</h3>
          <p className="text-muted-foreground mt-2">
            All billable time has been invoiced, or no time has been tracked yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Uninvoiced Time
        </CardTitle>
        <CardDescription>
          Select time entries to include in a new invoice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Time</div>
            <div className="text-xl font-bold">{totals.formattedTotal}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-700">Total Value</div>
            <div className="text-xl font-bold text-green-700">
              {formatCurrency(totals.totalEarnings)}
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="text-sm text-primary">Selected</div>
            <div className="text-xl font-bold text-primary">
              {selectedEntries.size} entries
            </div>
          </div>
        </div>

        {/* Entries Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedEntries.size === entries.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const isSelected = selectedEntries.has(entry.id);
                const amount = ((entry.duration || 0) / 3600) * (entry.hourlyRate || 0);

                return (
                  <TableRow
                    key={entry.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected && "bg-primary/5"
                    )}
                    onClick={() => toggleEntry(entry.id)}
                  >
                    <TableCell onClick={(e: any) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleEntry(entry.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {format(new Date(entry.startTime), "MMM d")}
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1">
                        {entry.description || <span className="text-muted-foreground italic">No description</span>}
                      </span>
                      {entry.project && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <FolderOpen className="h-3 w-3" />
                          {entry.project.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">
                      {entry.formattedDuration}
                    </TableCell>
                    <TableCell>
                      {entry.entryType === "manual" ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-600/30">
                          <Pencil className="h-3 w-3 mr-1" />
                          Manual
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-primary border-primary/30">
                          <Timer className="h-3 w-3 mr-1" />
                          Tracked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.hourlyRate ? formatCurrency(Math.round(amount)) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Selected Summary */}
        {selectedEntries.size > 0 && (
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <div className="text-sm text-muted-foreground">
                {selectedEntries.size} entries selected
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="font-medium">
                  {formatDuration(selectedTotals.seconds)}
                </span>
                <span className="text-green-600 font-bold">
                  {formatCurrency(Math.round(selectedTotals.earnings))}
                </span>
              </div>
            </div>
            <Button
              onClick={handleCreateInvoice}
              disabled={isCreating}
              className="gradient-primary border-0"
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Info about manual entries */}
        {entries.some((e) => e.entryType === "manual") && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Note:</span> Some entries are marked as "Manual" 
              which means they were added after the fact rather than tracked in real-time. 
              This is shown to clients for transparency.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}