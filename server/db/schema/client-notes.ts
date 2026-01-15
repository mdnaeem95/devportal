import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { clients } from "./clients";

export const clientNotes = pgTable("client_notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientNotesRelations = relations(clientNotes, ({ one }) => ({
  user: one(users, {
    fields: [clientNotes.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [clientNotes.clientId],
    references: [clients.id],
  }),
}));

export type ClientNote = typeof clientNotes.$inferSelect;
export type NewClientNote = typeof clientNotes.$inferInsert;