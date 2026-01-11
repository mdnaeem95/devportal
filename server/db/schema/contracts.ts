import { pgTable, pgEnum, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { nanoid } from "nanoid";
import { users } from "./users";
import { clients } from "./clients";
import { projects } from "./projects";
import { templates } from "./templates";

export const contractStatus = pgEnum("contract_status", [
  "draft",
  "sent",
  "viewed",
  "signed",
  "declined",
  "expired",
]);

export const contracts = pgTable("contracts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  templateId: text("template_id").references(() => templates.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  content: text("content").notNull(), // The actual contract content (Markdown)
  status: contractStatus("status").default("draft").notNull(),
  
  // Signing
  signToken: text("sign_token").unique().$defaultFn(() => nanoid(21)),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  signedAt: timestamp("signed_at"),
  declinedAt: timestamp("declined_at"),
  expiresAt: timestamp("expires_at"),
  
  // Client signature data
  clientSignature: text("client_signature"), // Base64 signature image or typed name
  clientSignedName: text("client_signed_name"),
  clientSignedEmail: text("client_signed_email"),
  clientIp: text("client_ip"),
  clientUserAgent: text("client_user_agent"),
  
  // Developer signature (optional pre-sign)
  developerSignature: text("developer_signature"),
  developerSignedAt: timestamp("developer_signed_at"),
  
  // Generated PDF
  pdfUrl: text("pdf_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contractsRelations = relations(contracts, ({ one }) => ({
  user: one(users, {
    fields: [contracts.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [contracts.projectId],
    references: [projects.id],
  }),
  client: one(clients, {
    fields: [contracts.clientId],
    references: [clients.id],
  }),
  template: one(templates, {
    fields: [contracts.templateId],
    references: [templates.id],
  }),
}));