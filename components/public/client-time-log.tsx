"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Timer, Pencil, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

interface ClientTimeLogProps {
  projectPublicId: string;
}

export function ClientTimeLog({ projectPublicId }: ClientTimeLogProps) {
  const { data, isLoading, error } = trpc.timeTracking.getClientVisible.useQuery({
    projectPublicId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  if (!data.enabled) {
    return null; // Time logs not enabled for this freelancer
  }

  if (data.entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Time Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No billable time tracked yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalSeconds = data.totalSeconds ?? 0;
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Time Log
          <Badge variant="secondary" className="ml-auto">
            {totalHours} hours total
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Verified time tracking with entry type indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {format(new Date(entry.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {entry.description || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="font-mono">
                  {entry.formattedDuration}
                </TableCell>
                <TableCell>
                  {entry.entryType === "manual" ? (
                    <Badge variant="outline" className="text-amber-600 border-amber-600/30 text-xs">
                      <Pencil className="h-3 w-3 mr-1" />
                      Manual
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600/30 text-xs">
                      <Timer className="h-3 w-3 mr-1" />
                      Tracked
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Legend */}
        <div className="mt-4 p-3 bg-secondary/50 rounded-md text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Timer className="h-3 w-3 text-green-600" />
              <span><strong>Tracked:</strong> Recorded with real-time timer</span>
            </div>
            <div className="flex items-center gap-1">
              <Pencil className="h-3 w-3 text-amber-600" />
              <span><strong>Manual:</strong> Added after the fact</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}