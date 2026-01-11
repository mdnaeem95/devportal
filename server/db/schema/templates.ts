import { pgTable, pgEnum, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";

export const templateType = pgEnum("template_type", ["contract", "invoice"]);

export const templates = pgTable("templates", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: templateType("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false),
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templatesRelations = relations(templates, ({ one }) => ({
  user: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
}));