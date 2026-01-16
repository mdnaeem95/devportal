import { pgTable, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "./users";
import { clients } from "./clients";
import { milestones } from "./milestones";

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "active",
  "on_hold",
  "completed",
  "cancelled",
]);

export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("draft").notNull(),
  publicId: text("public_id")
    .notNull()
    .unique()
    .$defaultFn(() => nanoid(10)),
  publicPassword: text("public_password"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  totalAmount: integer("total_amount"), // in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  milestones: many(milestones),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];
