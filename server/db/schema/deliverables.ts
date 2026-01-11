import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { projects } from "./projects";
import { milestones } from "./milestones";

export const deliverables = pgTable("deliverables", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  milestoneId: text("milestone_id").references(() => milestones.id, { onDelete: "set null" }),
  
  // File info
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: text("mime_type"),
  
  // Versioning
  version: integer("version").default(1).notNull(),
  versionNotes: text("version_notes"),
  previousVersionId: text("previous_version_id"), // Links to previous version
  
  // GitHub integration
  githubUrl: text("github_url"),
  
  // Download tracking
  downloadCount: integer("download_count").default(0).notNull(),
  lastDownloadedAt: timestamp("last_downloaded_at"),
  
  // Metadata
  uploadedBy: text("uploaded_by").notNull(), // userId
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const deliverablesRelations = relations(deliverables, ({ one }) => ({
  project: one(projects, {
    fields: [deliverables.projectId],
    references: [projects.id],
  }),
  milestone: one(milestones, {
    fields: [deliverables.milestoneId],
    references: [milestones.id],
  }),
  previousVersion: one(deliverables, {
    fields: [deliverables.previousVersionId],
    references: [deliverables.id],
  }),
}));