"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/dashboard/skeleton";
import { trpc } from "@/lib/trpc";
import { getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Bell,
  Clock,
  ArrowUpRight,
  MessageCircle,
  ChevronRight,
  AlertTriangle,
  Users,
} from "lucide-react";

interface FollowUpRemindersProps {
  daysThreshold?: number;
  maxItems?: number;
  compact?: boolean;
}

export function FollowUpReminders({
  daysThreshold = 30,
  maxItems = 5,
  compact = false,
}: FollowUpRemindersProps) {
  const { data: clients, isLoading } = trpc.clients.getFollowUpReminders.useQuery({
    daysThreshold,
  });

  const utils = trpc.useUtils();

  const updateLastContact = trpc.clients.updateLastContact.useMutation({
    onSuccess: () => {
      utils.clients.getFollowUpReminders.invalidate();
      utils.clients.list.invalidate();
      toast.success("Marked as contacted");
    },
    onError: () => {
      toast.error("Failed to update");
    },
  });

  const handleMarkContacted = (e: React.MouseEvent, clientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    updateLastContact.mutate({ id: clientId });
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Follow-up Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayClients = clients?.slice(0, maxItems) ?? [];
  const totalCount = clients?.length ?? 0;

  if (totalCount === 0) {
    if (compact) return null;

    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Follow-up Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <p className="mt-4 text-sm font-medium text-green-500">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">
              You've contacted all active clients within {daysThreshold} days
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-yellow-500/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20">
              <Bell className="h-3.5 w-3.5 text-yellow-500" />
            </div>
            Follow-up Reminders
          </CardTitle>
          {totalCount > 0 && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {totalCount} client{totalCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Clients you haven't contacted in {daysThreshold}+ days
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayClients.map((client) => {
            const isUrgent = client.daysSinceContact >= 60;
            const isWarning = client.daysSinceContact >= 45;

            return (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="group flex items-center justify-between rounded-lg border border-border/50 p-3 transition-all hover:bg-secondary/50 hover:border-border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white",
                      isUrgent
                        ? "bg-red-500"
                        : isWarning
                        ? "bg-yellow-500"
                        : "gradient-primary"
                    )}
                  >
                    {getInitials(client.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">
                      {client.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock
                        className={cn(
                          "h-3 w-3",
                          isUrgent
                            ? "text-red-500"
                            : isWarning
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          isUrgent
                            ? "text-red-500 font-medium"
                            : isWarning
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        )}
                      >
                        {client.daysSinceContact} days ago
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleMarkContacted(e, client.id)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contacted
                  </Button>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </div>

        {totalCount > maxItems && (
          <Button variant="ghost" size="sm" className="w-full mt-3 gap-1" asChild>
            <Link href="/dashboard/clients?needsFollowUp=true">
              View all {totalCount} clients
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}