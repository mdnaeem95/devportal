import { pgTable, pgEnum, text, timestamp, integer, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { projects } from "./projects";
import { milestones } from "./milestones";
import { invoices } from "./invoices";

// Entry type: tracked = real-time timer, manual = added after the fact
export const timeEntryTypeEnum = pgEnum("time_entry_type", ["tracked", "manual"]);

// Edit history entry type for audit trail
export interface TimeEntryEdit {
  editedAt: string; // ISO timestamp
  field: string;
  oldValue: string | number | null;
  newValue: string | number | null;
  reason?: string;
}

export const timeEntries = pgTable("time_entries", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .references(() => projects.id, { onDelete: "set null" }),
  milestoneId: text("milestone_id")
    .references(() => milestones.id, { onDelete: "set null" }),
  
  // Time data
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"), // null = timer still running
  duration: integer("duration"), // in seconds, calculated when stopped
  
  // Billing
  hourlyRate: integer("hourly_rate"), // in cents, snapshot at time of entry
  billable: boolean("billable").default(true).notNull(),
  invoiceId: text("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  
  // === INTEGRITY / ANTI-ABUSE FIELDS ===
  
  // Entry type: "tracked" = real timer was used, "manual" = added retroactively
  entryType: timeEntryTypeEnum("entry_type").default("tracked").notNull(),
  
  // When the entry was actually created in the system (vs when work allegedly happened)
  // This exposes if someone adds "yesterday's work" today
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Lock entries once invoiced - prevents tampering with billed time
  lockedAt: timestamp("locked_at"),
  lockedReason: text("locked_reason"), // "invoiced", "approved", etc.
  
  // Full edit history for audit trail
  editHistory: jsonb("edit_history").$type<TimeEntryEdit[]>().default([]),
  
  // Track if this was auto-stopped (idle detection, browser close, etc.)
  autoStopped: boolean("auto_stopped").default(false),
  autoStopReason: text("auto_stop_reason"), // "idle", "midnight", "browser_close"
  
  // Original values before any edits (immutable snapshot)
  originalStartTime: timestamp("original_start_time"),
  originalEndTime: timestamp("original_end_time"),
  originalDuration: integer("original_duration"),
  
  // Metadata
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Indexes for common queries
  userIdIdx: index("time_entries_user_id_idx").on(table.userId),
  projectIdIdx: index("time_entries_project_id_idx").on(table.projectId),
  startTimeIdx: index("time_entries_start_time_idx").on(table.startTime),
  invoiceIdIdx: index("time_entries_invoice_id_idx").on(table.invoiceId),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [timeEntries.projectId],
    references: [projects.id],
  }),
  milestone: one(milestones, {
    fields: [timeEntries.milestoneId],
    references: [milestones.id],
  }),
  invoice: one(invoices, {
    fields: [timeEntries.invoiceId],
    references: [invoices.id],
  }),
}));

export type TimeEntry = typeof timeEntries.$inferSelect;
export type NewTimeEntry = typeof timeEntries.$inferInsert;

// ============================================
// TIME TRACKING SETTINGS (per user)
// ============================================

export const timeTrackingSettings = pgTable("time_tracking_settings", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Default hourly rate for new entries (in cents)
  defaultHourlyRate: integer("default_hourly_rate"),
  
  // === ANTI-ABUSE SETTINGS ===
  
  // How many days back can manual entries be added? (0 = same day only)
  maxRetroactiveDays: integer("max_retroactive_days").default(7),
  
  // Daily hour cap - warn if exceeded (in minutes, e.g., 720 = 12 hours)
  dailyHourWarning: integer("daily_hour_warning").default(720),
  
  // Auto-stop timer after X minutes of idle (0 = disabled)
  idleTimeoutMinutes: integer("idle_timeout_minutes").default(30),
  
  // Round time entries to nearest X minutes (0 = no rounding)
  roundToMinutes: integer("round_to_minutes").default(0),
  
  // Minimum entry duration in minutes (prevent micro-entries)
  minimumEntryMinutes: integer("minimum_entry_minutes").default(1),
  
  // Allow overlapping time entries? (default false for integrity)
  allowOverlapping: boolean("allow_overlapping").default(false),
  
  // Show time logs to clients in their portal?
  clientVisibleLogs: boolean("client_visible_logs").default(true),
  
  // Require description for all entries?
  requireDescription: boolean("require_description").default(false),
  
  // Auto-stop running timers at midnight?
  autoStopAtMidnight: boolean("auto_stop_at_midnight").default(true),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const timeTrackingSettingsRelations = relations(timeTrackingSettings, ({ one }) => ({
  user: one(users, {
    fields: [timeTrackingSettings.userId],
    references: [users.id],
  }),
}));

export type TimeTrackingSettings = typeof timeTrackingSettings.$inferSelect;
export type NewTimeTrackingSettings = typeof timeTrackingSettings.$inferInsert;