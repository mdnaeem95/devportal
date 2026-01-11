import { pgTable, pgEnum, text, timestamp, integer, jsonb, decimal } from "drizzle-orm/pg-core";
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

  // Stripe integration
  stripePaymentId: text("stripe_payment_id"),

  // Tracking
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  paidAt: timestamp("paid_at"),
  paidAmount: integer("paid_amount"),
  paymentMethod: text("payment_method"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
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
}));