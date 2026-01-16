import { pgTable, pgEnum, text, timestamp, integer, jsonb, decimal, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { clients } from "./clients";
import { projects } from "./projects";
import { milestones } from "./milestones";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "viewed",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
]);

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  milestoneId: text("milestone_id").references(() => milestones.id, { onDelete: "set null" }),

  // Invoice details
  invoiceNumber: text("invoice_number").notNull(),
  status: invoiceStatusEnum("status").default("draft").notNull(),

  // Line items stored as JSON
  lineItems: jsonb("line_items").notNull().$type<Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>>(),

  // Amounts (all in cents)
  subtotal: integer("subtotal").notNull(),
  tax: integer("tax").default(0),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }),
  total: integer("total").notNull(),
  currency: text("currency").default("USD"),

  // Payment info
  dueDate: timestamp("due_date").notNull(),
  notes: text("notes"),
  payToken: text("pay_token").unique(),

  // Partial payment settings
  allowPartialPayments: boolean("allow_partial_payments").default(false).notNull(),
  minimumPaymentAmount: integer("minimum_payment_amount"), // in cents, null means no minimum

  // Stripe integration
  stripePaymentId: text("stripe_payment_id"),

  // Tracking
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  paidAt: timestamp("paid_at"), // When fully paid
  paidAmount: integer("paid_amount").default(0), // Total amount paid so far
  paymentMethod: text("payment_method"),

  // Reminder tracking
  lastReminderAt: timestamp("last_reminder_at"),
  reminderCount: integer("reminder_count").default(0).notNull(),
  autoRemind: boolean("auto_remind").default(true).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  milestone: one(milestones, {
    fields: [invoices.milestoneId],
    references: [milestones.id],
  }),
  reminders: many(invoiceReminders),
  payments: many(invoicePayments),
}));

// Invoice Reminders table
export const invoiceReminders = pgTable("invoice_reminders", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Reminder details
  reminderType: text("reminder_type").notNull().default("manual"),
  customMessage: text("custom_message"),

  // Recipient (denormalized for history)
  sentToEmail: text("sent_to_email").notNull(),
  sentToName: text("sent_to_name").notNull(),

  // Timestamps
  sentAt: timestamp("sent_at").defaultNow().notNull(),

  // Tracking
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
});

export const invoiceRemindersRelations = relations(invoiceReminders, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceReminders.invoiceId],
    references: [invoices.id],
  }),
  user: one(users, {
    fields: [invoiceReminders.userId],
    references: [users.id],
  }),
}));

// Invoice Payments table - tracks individual payments for partial payment support
export const invoicePayments = pgTable("invoice_payments", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Payment details
  amount: integer("amount").notNull(), // in cents
  paymentMethod: text("payment_method"),
  stripePaymentId: text("stripe_payment_id"),

  // Metadata
  notes: text("notes"),

  // Timestamps
  paidAt: timestamp("paid_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoicePaymentsRelations = relations(invoicePayments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoicePayments.invoiceId],
    references: [invoices.id],
  }),
  user: one(users, {
    fields: [invoicePayments.userId],
    references: [users.id],
  }),
}));