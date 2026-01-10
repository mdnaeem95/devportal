import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import { users } from "./users";
import { clients } from "./clients";
import { projects } from "./projects";

export const contractStatusEnum = pgEnum("contract_status", [
  "draft",
  "sent",
  "viewed",
  "signed",
  "declined",
  "expired",
]);

export const contracts = pgTable("contracts", {
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
  templateId: text("template_id"),
  name: text("name").notNull(),
  content: text("content").notNull(), // JSON string
  status: contractStatusEnum("status").default("draft").notNull(),
  signToken: text("sign_token")
    .unique()
    .$defaultFn(() => nanoid(21)),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  signedAt: timestamp("signed_at"),
  clientSignature: text("client_signature"), // Base64 signature image
  clientIp: text("client_ip"),
  pdfUrl: text("pdf_url"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const contractsRelations = relations(contracts, ({ one }) => ({
  user: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [contracts.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [contracts.projectId],
    references: [projects.id],
  }),
}));

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
export type ContractStatus = (typeof contractStatusEnum.enumValues)[number];
