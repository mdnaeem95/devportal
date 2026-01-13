import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  businessName: text("business_name"),
  businessAddress: text("business_address"),
  taxId: text("tax_id"),
  logoUrl: text("logo_url"),
  stripeAccountId: text("stripe_account_id"),
  stripeConnected: boolean("stripe_connected").default(false),
  currency: text("currency").default("USD"),
  
  // Notification preferences
  emailInvoicePaid: boolean("email_invoice_paid").default(true),
  emailContractSigned: boolean("email_contract_signed").default(true),
  emailWeeklyDigest: boolean("email_weekly_digest").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;