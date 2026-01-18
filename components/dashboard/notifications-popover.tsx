"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, CheckCheck, CreditCard, FileText, FolderKanban, Flag, Loader2, MoreHorizontal, PartyPopper,
  Clock, AlertTriangle, Eye, X, Trash2, UserPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scrollarea";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Route } from "next";

// Notification type config
const notificationConfig: Record<
  string,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  // Invoice
  invoice_paid: { icon: CreditCard, color: "text-green-500", bgColor: "bg-green-500/10" },
  invoice_partially_paid: { icon: CreditCard, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  invoice_viewed: { icon: Eye, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  invoice_overdue: { icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-500/10" },
  payment_reminder_sent: { icon: Bell, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  // Contract
  contract_signed: { icon: FileText, color: "text-green-500", bgColor: "bg-green-500/10" },
  contract_declined: { icon: X, color: "text-red-500", bgColor: "bg-red-500/10" },
  contract_viewed: { icon: Eye, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  contract_reminder_sent: { icon: Bell, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  contract_expiring: { icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  // Project & Milestone
  milestone_due_soon: { icon: Flag, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  milestone_overdue: { icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-500/10" },
  project_completed: { icon: FolderKanban, color: "text-green-500", bgColor: "bg-green-500/10" },
  // Client
  new_client: { icon: UserPlus, color: "text-primary", bgColor: "bg-primary/10" },
  // System
  welcome: { icon: PartyPopper, color: "text-primary", bgColor: "bg-primary/10" },
  stripe_connected: { icon: Zap, color: "text-green-500", bgColor: "bg-green-500/10" },
  stripe_payout: { icon: CreditCard, color: "text-green-500", bgColor: "bg-green-500/10" },
};

type NotificationHref =
  | Route<`/dashboard/invoices/${string}`>
  | Route<`/dashboard/contracts/${string}`>
  | Route<`/dashboard/projects/${string}`>
  | Route<`/dashboard/clients/${string}`>
  | Route<`/dashboard/settings`>
  | Route<`/dashboard/notifications`>;

// Get link for notification resource
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
      return `/dashboard/projects/${resourceId}`; // Milestone links to project
    case "client":
      return `/dashboard/clients/${resourceId}`;
    case "settings":
      return `/dashboard/settings`;
    default:
      return null;
  }
}

// Format currency
function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    resourceType?: string | null;
    resourceId?: string | null;
    metadata?: {
      amount?: number;
      currency?: string;
      clientName?: string;
    } | null;
    read: boolean;
    createdAt: Date;
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete, onClose }: NotificationItemProps) {
  const config = notificationConfig[notification.type] || {
    icon: Bell,
    color: "text-muted-foreground",
    bgColor: "bg-secondary",
  };
  const Icon = config.icon;
  const link = getNotificationLink(notification.resourceType, notification.resourceId);

  const content = (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg transition-colors cursor-pointer group",
        notification.read ? "opacity-60" : "bg-primary/5",
        "hover:bg-secondary"
      )}
      onClick={() => {
        if (!notification.read) {
          onMarkAsRead(notification.id);
        }
        if (link) {
          onClose();
        }
      }}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center", config.bgColor)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium truncate", !notification.read && "text-foreground")}>
            {notification.title}
          </p>
          
          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!notification.read && (
                <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(notification.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        
        {/* Amount badge for payments */}
        {notification.metadata?.amount && (
          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
            {formatCurrency(notification.metadata.amount, notification.metadata.currency)}
          </span>
        )}
        
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-2" />
      )}
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.notifications.getRecent.useQuery(
    { limit: 10 },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getRecent.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getRecent.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      toast.success("All notifications marked as read");
    },
  });

  const deleteNotification = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.getRecent.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center p-4">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground">
                We'll notify you when something happens
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={(id) => markAsRead.mutate({ id })}
                  onDelete={(id) => deleteNotification.mutate({ id })}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full text-sm">
                View all notifications
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}