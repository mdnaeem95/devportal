import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { notifications, type NotificationType, type NotificationResourceType, type NotificationMetadata } from "../db/schema";
import { eq, desc, and, sql, isNull, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// NOTIFICATION ROUTER
// ============================================

export const notificationRouter = router({
  // Get all notifications with optional filters
  list: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(notifications.userId, ctx.user.id)];

      if (input?.unreadOnly) {
        conditions.push(eq(notifications.read, false));
      }

      const items = await ctx.db.query.notifications.findMany({
        where: and(...conditions),
        orderBy: [desc(notifications.createdAt)],
        limit: input?.limit ?? 50,
        offset: input?.offset ?? 0,
      });

      // Get total count for pagination
      const [countResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(...conditions));

      return {
        notifications: items.map((n) => ({
          ...n,
          metadata: n.metadata ? JSON.parse(n.metadata) as NotificationMetadata : null,
        })),
        total: Number(countResult?.count ?? 0),
      };
    }),

  // Get unread count (for badge)
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.read, false)
        )
      );

    return { count: Number(result?.count ?? 0) };
  }),

  // Get recent notifications (for popover)
  getRecent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.notifications.findMany({
        where: eq(notifications.userId, ctx.user.id),
        orderBy: [desc(notifications.createdAt)],
        limit: input?.limit ?? 10,
      });

      const [unreadResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, ctx.user.id),
            eq(notifications.read, false)
          )
        );

      return {
        notifications: items.map((n) => ({
          ...n,
          metadata: n.metadata ? JSON.parse(n.metadata) as NotificationMetadata : null,
        })),
        unreadCount: Number(unreadResult?.count ?? 0),
      };
    }),

  // Mark single notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.query.notifications.findFirst({
        where: eq(notifications.id, input.id),
      });

      if (!notification || notification.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Notification not found" });
      }

      if (notification.read) {
        return notification;
      }

      const [updated] = await ctx.db
        .update(notifications)
        .set({
          read: true,
          readAt: new Date(),
        })
        .where(eq(notifications.id, input.id))
        .returning();

      return updated;
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.read, false)
        )
      );

    return { success: true };
  }),

  // Delete a notification
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.query.notifications.findFirst({
        where: eq(notifications.id, input.id),
      });

      if (!notification || notification.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Notification not found" });
      }

      await ctx.db.delete(notifications).where(eq(notifications.id, input.id));

      return { success: true };
    }),

  // Delete all read notifications (cleanup)
  deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.read, true)
        )
      );

    return { success: true };
  }),

  // Create a notification (internal use, but exposed for flexibility)
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "invoice_paid",
          "invoice_partially_paid",
          "invoice_viewed",
          "invoice_overdue",
          "payment_reminder_sent",
          "contract_signed",
          "contract_declined",
          "contract_viewed",
          "contract_reminder_sent",
          "contract_expiring",
          "milestone_due_soon",
          "milestone_overdue",
          "project_completed",
          "new_client",
          "welcome",
          "stripe_connected",
          "stripe_payout",
        ]),
        title: z.string(),
        message: z.string(),
        resourceType: z.enum(["invoice", "contract", "project", "milestone", "client", "settings"]).optional(),
        resourceId: z.string().optional(),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [notification] = await ctx.db
        .insert(notifications)
        .values({
          userId: ctx.user.id,
          type: input.type,
          title: input.title,
          message: input.message,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        })
        .returning();

      return notification;
    }),
});

// ============================================
// HELPER FUNCTIONS (for use in other routers)
// ============================================

interface CreateNotificationParams {
  db: any;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceType?: NotificationResourceType;
  resourceId?: string;
  metadata?: NotificationMetadata;
}

export async function createNotification(params: CreateNotificationParams) {
  const { db, userId, type, title, message, resourceType, resourceId, metadata } = params;

  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      type,
      title,
      message,
      resourceType,
      resourceId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    })
    .returning();

  return notification;
}

// Pre-built notification creators for common scenarios
export const NotificationCreators = {
  // Invoice notifications
  invoicePaid: (db: any, userId: string, params: {
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    clientName: string;
    projectName?: string;
  }) => createNotification({
    db,
    userId,
    type: "invoice_paid",
    title: "Payment received",
    message: `${params.clientName} paid invoice ${params.invoiceNumber}`,
    resourceType: "invoice",
    resourceId: params.invoiceId,
    metadata: {
      amount: params.amount,
      currency: params.currency,
      clientName: params.clientName,
      invoiceNumber: params.invoiceNumber,
      projectName: params.projectName,
    },
  }),

  invoicePartiallyPaid: (db: any, userId: string, params: {
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    clientName: string;
  }) => createNotification({
    db,
    userId,
    type: "invoice_partially_paid",
    title: "Partial payment received",
    message: `${params.clientName} made a partial payment on invoice ${params.invoiceNumber}`,
    resourceType: "invoice",
    resourceId: params.invoiceId,
    metadata: {
      amount: params.amount,
      currency: params.currency,
      clientName: params.clientName,
      invoiceNumber: params.invoiceNumber,
    },
  }),

  invoiceViewed: (db: any, userId: string, params: {
    invoiceId: string;
    invoiceNumber: string;
    clientName: string;
  }) => createNotification({
    db,
    userId,
    type: "invoice_viewed",
    title: "Invoice viewed",
    message: `${params.clientName} viewed invoice ${params.invoiceNumber}`,
    resourceType: "invoice",
    resourceId: params.invoiceId,
    metadata: {
      clientName: params.clientName,
      invoiceNumber: params.invoiceNumber,
    },
  }),

  invoiceOverdue: (db: any, userId: string, params: {
    invoiceId: string;
    invoiceNumber: string;
    clientName: string;
    daysOverdue: number;
  }) => createNotification({
    db,
    userId,
    type: "invoice_overdue",
    title: "Invoice overdue",
    message: `Invoice ${params.invoiceNumber} for ${params.clientName} is ${params.daysOverdue} days overdue`,
    resourceType: "invoice",
    resourceId: params.invoiceId,
    metadata: {
      clientName: params.clientName,
      invoiceNumber: params.invoiceNumber,
      daysOverdue: params.daysOverdue,
    },
  }),

  // Contract notifications
  contractSigned: (db: any, userId: string, params: {
    contractId: string;
    contractName: string;
    clientName: string;
    projectName?: string;
  }) => createNotification({
    db,
    userId,
    type: "contract_signed",
    title: "Contract signed",
    message: `${params.clientName} signed "${params.contractName}"`,
    resourceType: "contract",
    resourceId: params.contractId,
    metadata: {
      clientName: params.clientName,
      contractName: params.contractName,
      projectName: params.projectName,
    },
  }),

  contractDeclined: (db: any, userId: string, params: {
    contractId: string;
    contractName: string;
    clientName: string;
  }) => createNotification({
    db,
    userId,
    type: "contract_declined",
    title: "Contract declined",
    message: `${params.clientName} declined "${params.contractName}"`,
    resourceType: "contract",
    resourceId: params.contractId,
    metadata: {
      clientName: params.clientName,
      contractName: params.contractName,
    },
  }),

  contractViewed: (db: any, userId: string, params: {
    contractId: string;
    contractName: string;
    clientName: string;
  }) => createNotification({
    db,
    userId,
    type: "contract_viewed",
    title: "Contract viewed",
    message: `${params.clientName} viewed "${params.contractName}"`,
    resourceType: "contract",
    resourceId: params.contractId,
    metadata: {
      clientName: params.clientName,
      contractName: params.contractName,
    },
  }),

  // Milestone notifications
  milestoneDueSoon: (db: any, userId: string, params: {
    milestoneId: string;
    milestoneName: string;
    projectId: string;
    projectName: string;
    daysUntilDue: number;
  }) => createNotification({
    db,
    userId,
    type: "milestone_due_soon",
    title: "Milestone due soon",
    message: `"${params.milestoneName}" in ${params.projectName} is due in ${params.daysUntilDue} days`,
    resourceType: "milestone",
    resourceId: params.milestoneId,
    metadata: {
      milestoneName: params.milestoneName,
      projectName: params.projectName,
      daysUntilDue: params.daysUntilDue,
    },
  }),

  milestoneOverdue: (db: any, userId: string, params: {
    milestoneId: string;
    milestoneName: string;
    projectId: string;
    projectName: string;
    daysOverdue: number;
  }) => createNotification({
    db,
    userId,
    type: "milestone_overdue",
    title: "Milestone overdue",
    message: `"${params.milestoneName}" in ${params.projectName} is ${params.daysOverdue} days overdue`,
    resourceType: "milestone",
    resourceId: params.milestoneId,
    metadata: {
      milestoneName: params.milestoneName,
      projectName: params.projectName,
      daysOverdue: params.daysOverdue,
    },
  }),

  // System notifications
  welcome: (db: any, userId: string) => createNotification({
    db,
    userId,
    type: "welcome",
    title: "Welcome to Zovo!",
    message: "Get started by creating your first project or connecting Stripe for payments.",
    resourceType: "settings",
  }),

  stripeConnected: (db: any, userId: string) => createNotification({
    db,
    userId,
    type: "stripe_connected",
    title: "Stripe connected",
    message: "You can now accept payments from clients.",
    resourceType: "settings",
  }),
};