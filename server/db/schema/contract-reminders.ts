import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { contracts } from "./contracts";

// ============================================
// Contract Reminders Table
// ============================================

export const contractReminders = pgTable("contract_reminders", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  contractId: text("contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Reminder details
  reminderType: text("reminder_type").notNull().default("manual"), // 'manual', 'auto_3day', 'auto_7day', 'auto_expiring'
  customMessage: text("custom_message"),
  
  // Recipient info (denormalized for history)
  sentToEmail: text("sent_to_email").notNull(),
  sentToName: text("sent_to_name").notNull(),
  
  // Timestamps
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  
  // Tracking
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
});

export const contractRemindersRelations = relations(contractReminders, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractReminders.contractId],
    references: [contracts.id],
  }),
  user: one(users, {
    fields: [contractReminders.userId],
    references: [users.id],
  }),
}));

// ============================================
// Type exports
// ============================================

export type ContractReminder = typeof contractReminders.$inferSelect;
export type NewContractReminder = typeof contractReminders.$inferInsert;

// Reminder type enum for type safety
export const REMINDER_TYPES = {
  MANUAL: "manual",
  AUTO_3DAY: "auto_3day",
  AUTO_7DAY: "auto_7day", 
  AUTO_EXPIRING: "auto_expiring",
} as const;

export type ReminderType = typeof REMINDER_TYPES[keyof typeof REMINDER_TYPES];