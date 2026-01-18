"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Bell, Check, CheckCheck, CreditCard, FileText, FolderKanban, Flag, Loader2, MoreHorizontal, PartyPopper,
  Clock, AlertTriangle, Eye, X, Trash2, UserPlus, Zap, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/dashboard/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Route } from "next";

// Notification type config (same as popover)
const notificationConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  // Invoice
  invoice_paid: { icon: CreditCard, color: "text-green-500", bgColor: "bg-green-500/10", label: "Payment" },
  invoice_partially_paid: { icon: CreditCard, color: "text-yellow-500", bgColor: "bg-yellow-500/10", label: "Payment" },
  invoice_viewed: { icon: Eye, color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Invoice" },
  invoice_overdue: { icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-500/10", label: "Invoice" },
  payment_reminder_sent: { icon: Bell, color: "text-orange-500", bgColor: "bg-orange-500/10", label: "Reminder" },
  // Contract
  contract_signed: { icon: FileText, color: "text-green-500", bgColor: "bg-green-500/10", label: "Contract" },
  contract_declined: { icon: X, color: "text-red-500", bgColor: "bg-red-500/10", label: "Contract" },
  contract_viewed: { icon: Eye, color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Contract" },
  contract_reminder_sent: { icon: Bell, color: "text-orange-500", bgColor: "bg-orange-500/10", label: "Reminder" },
  contract_expiring: { icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/10", label: "Contract" },
  // Project & Milestone
  milestone_due_soon: { icon: Flag, color: "text-yellow-500", bgColor: "bg-yellow-500/10", label: "Milestone" },
  milestone_overdue: { icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-500/10", label: "Milestone" },
  project_completed: { icon: FolderKanban, color: "text-green-500", bgColor: "bg-green-500/10", label: "Project" },
  // Client
  new_client: { icon: UserPlus, color: "text-primary", bgColor: "bg-primary/10", label: "Client" },
  // System
  welcome: { icon: PartyPopper, color: "text-primary", bgColor: "bg-primary/10", label: "System" },
  stripe_connected: { icon: Zap, color: "text-green-500", bgColor: "bg-green-500/10", label: "System" },
  stripe_payout: { icon: CreditCard, color: "text-green-500", bgColor: "bg-green-500/10", label: "System" },
};

type NotificationHref =
  | Route<`/dashboard/invoices/${string}`>
  | Route<`/dashboard/contracts/${string}`>
  | Route<`/dashboard/projects/${string}`>
  | Route<`/dashboard/clients/${string}`>
  | Route<`/dashboard/settings`>
  | Route<`/dashboard/notifications`>;

function getNotificationLink(
  resourceType?: string | null,
  resourceId?: string | null
): NotificationHref | null {
  if (!resourceType) return null;
  
  switch (resourceType) {
    case "invoice":
      return `/dashboard/invoices/${resourceId}`;
    case "contract":
      return `/dashboard/contracts/${resourceId}`;
    case "project":
      return `/dashboard/projects/${resourceId}`;
    case "milestone":
      return `/dashboard/projects/${resourceId}`;
    case "client":
      return `/dashboard/clients/${resourceId}`;
    case "settings":
      return `/dashboard/settings`;
    default:
      return null;
  }
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.notifications.list.useQuery({
    unreadOnly: filter === "unread",
    limit: 100,
  });

  const { data: unreadData } = trpc.notifications.getUnreadCount.useQuery();

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getRecent.invalidate();
    },
  });

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getRecent.invalidate();
      toast.success("All notifications marked as read");
    },
  });

  const deleteNotification = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getRecent.invalidate();
      toast.success("Notification deleted");
    },
  });

  const deleteAllRead = trpc.notifications.deleteAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getRecent.invalidate();
      toast.success("Read notifications deleted");
    },
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = unreadData?.count ?? 0;

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = format(new Date(notification.createdAt), "yyyy-MM-dd");
    const label = format(new Date(notification.createdAt), "EEEE, MMMM d, yyyy");
    if (!groups[date]) {
      groups[date] = { label, items: [] };
    }
    groups[date].items.push(notification);
    return groups;
  }, {} as Record<string, { label: string; items: typeof notifications }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated on your projects, invoices, and contracts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              Mark all read
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => deleteAllRead.mutate()}
                disabled={deleteAllRead.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete all read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.total ?? 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{unreadCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">
              {(data?.total ?? 0) - unreadCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Inbox className="h-4 w-4" />
            All
            {data?.total ? (
              <span className="ml-1 text-xs bg-secondary rounded-full px-2">
                {data.total}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            <Bell className="h-4 w-4" />
            Unread
            {unreadCount > 0 && (
              <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-2">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-lg border bg-card/50">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">
              {filter === "unread" ? "All caught up!" : "No notifications yet"}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {filter === "unread"
                ? "You've read all your notifications. Check back later for updates."
                : "When you receive payments, contract signatures, or other updates, they'll appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, group]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {group.label}
              </h3>
              <div className="space-y-2">
                {group.items.map((notification) => {
                  const config = notificationConfig[notification.type] || {
                    icon: Bell,
                    color: "text-muted-foreground",
                    bgColor: "bg-secondary",
                    label: "Notification",
                  };
                  const Icon = config.icon;
                  const link = getNotificationLink(notification.resourceType, notification.resourceId);

                  const content = (
                    <div
                      className={cn(
                        "flex gap-4 p-4 rounded-lg border transition-all group",
                        notification.read
                          ? "bg-card/30 border-border/50"
                          : "bg-primary/5 border-primary/20 hover:border-primary/40",
                        "hover:shadow-md"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                          config.bgColor
                        )}
                      >
                        <Icon className={cn("h-5 w-5", config.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full",
                              config.bgColor,
                              config.color
                            )}
                          >
                            {config.label}
                          </span>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className={cn("font-medium", !notification.read && "text-foreground")}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                        
                        {/* Amount badge */}
                        {notification.metadata?.amount && (
                          <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600">
                            {formatCurrency(
                              notification.metadata.amount,
                              notification.metadata.currency
                            )}
                          </span>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {link && (
                          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.preventDefault()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault();
                                  markAsRead.mutate({ id: notification.id });
                                }}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            {link && (
                              <DropdownMenuItem asChild>
                                <Link href={link}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View details
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                deleteNotification.mutate({ id: notification.id });
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );

                  if (link) {
                    return (
                      <Link
                        key={notification.id}
                        href={link}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead.mutate({ id: notification.id });
                          }
                        }}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead.mutate({ id: notification.id });
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}