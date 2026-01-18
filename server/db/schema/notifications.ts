import { pgTable, pgEnum, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";

// Notification types enum
export const notificationType = pgEnum("notification_type", [
  // Invoices
  "invoice_paid",
  "invoice_partially_paid",
  "invoice_viewed",
  "invoice_overdue",
  "payment_reminder_sent",
  // Contracts
  "contract_signed",
  "contract_declined",
  "contract_viewed",
  "contract_reminder_sent",
  "contract_expiring",
  // Projects & Milestones
  "milestone_due_soon",
  "milestone_overdue",
  "project_completed",
  // Clients
  "new_client",
  // System
  "welcome",
  "stripe_connected",
  "stripe_payout",
]);

// Resource types for linking
export const notificationResourceType = pgEnum("notification_resource_type", [
  "invoice",
  "contract",
  "project",
  "milestone",
  "client",
  "settings",
]);

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Notification content
  type: notificationType("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  // Optional link to resource
  resourceType: notificationResourceType("resource_type"),
  resourceId: text("resource_id"),
  
  // Metadata (for additional context like amounts, names, etc.)
  metadata: text("metadata"), // JSON string
  
  // Status
  read: boolean("read").default(false).notNull(),
  readAt: timestamp("read_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationType = typeof notificationType.enumValues[number];
export type NotificationResourceType = typeof notificationResourceType.enumValues[number];

// Helper type for metadata
export interface NotificationMetadata {
  amount?: number;
  currency?: string;
  clientName?: string;
  projectName?: string;
  invoiceNumber?: string;
  contractName?: string;
  milestoneName?: string;
  daysUntilDue?: number;
  daysOverdue?: number;
}