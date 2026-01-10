import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
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

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // in cents
  amount: number; // quantity * unitPrice
}

export const invoices = pgTable("invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  milestoneId: text("milestone_id").references(() => milestones.id),
  invoiceNumber: text("invoice_number").notNull(),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  lineItems: jsonb("line_items").$type<LineItem[]>().notNull(),
  subtotal: integer("subtotal").notNull(), // in cents
  tax: integer("tax").default(0),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }),
  total: integer("total").notNull(),
  currency: text("currency").default("USD"),
  dueDate: timestamp("due_date").notNull(),
  notes: text("notes"),
  payToken: text("pay_token")
    .unique()
    .$defaultFn(() => nanoid(21)),
  stripeInvoiceId: text("stripe_invoice_id"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  paidAt: timestamp("paid_at"),
  paidAmount: integer("paid_amount"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
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

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number];
