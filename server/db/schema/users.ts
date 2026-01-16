import { pgTable, text, timestamp, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  
  // ========== Business Information ==========
  businessName: text("business_name"),
  businessAddress: text("business_address"),
  taxId: text("tax_id"),
  logoUrl: text("logo_url"),
  currency: text("currency").default("USD"),
  
  // ========== Stripe Integration ==========
  stripeAccountId: text("stripe_account_id"),
  stripeConnected: boolean("stripe_connected").default(false),
  
  // ========== Invoice Defaults ==========
  defaultPaymentTerms: integer("default_payment_terms").default(14), // Days until due
  defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 2 }), // e.g., 8.25
  invoicePrefix: text("invoice_prefix").default("INV"), // Invoice number prefix
  invoiceNotes: text("invoice_notes"), // Default notes/payment instructions
  defaultAllowPartialPayments: boolean("default_allow_partial_payments").default(false),
  defaultMinimumPaymentPercent: integer("default_minimum_payment_percent"), // e.g., 25 for 25%
  
  // ========== Contract Defaults ==========
  defaultContractExpiryDays: integer("default_contract_expiry_days").default(30),
  contractAutoRemind: boolean("contract_auto_remind").default(true),
  contractSequentialSigning: boolean("contract_sequential_signing").default(true), // Developer signs first
  
  // ========== Time Tracking Defaults ==========
  defaultHourlyRate: integer("default_hourly_rate"), // In cents
  maxRetroactiveDays: integer("max_retroactive_days").default(7),
  dailyHourWarning: integer("daily_hour_warning").default(720), // Minutes (12 hours)
  idleTimeoutMinutes: integer("idle_timeout_minutes").default(30),
  roundToMinutes: integer("round_to_minutes").default(0), // 0 = no rounding
  minimumEntryMinutes: integer("minimum_entry_minutes").default(1),
  allowOverlapping: boolean("allow_overlapping").default(false),
  clientVisibleLogs: boolean("client_visible_logs").default(true),
  requireDescription: boolean("require_description").default(false),
  autoStopAtMidnight: boolean("auto_stop_at_midnight").default(true),
  
  // ========== Client Portal Defaults ==========
  defaultPortalPasswordProtected: boolean("default_portal_password_protected").default(false),
  defaultShowTimeLogs: boolean("default_show_time_logs").default(true),
  
  // ========== Notification Preferences ==========
  emailInvoicePaid: boolean("email_invoice_paid").default(true),
  emailContractSigned: boolean("email_contract_signed").default(true),
  emailWeeklyDigest: boolean("email_weekly_digest").default(false),
  emailPaymentReminders: boolean("email_payment_reminders").default(true),
  emailContractReminders: boolean("email_contract_reminders").default(true),
  emailMilestonesDue: boolean("email_milestones_due").default(true),
  
  // ========== Timestamps ==========
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;