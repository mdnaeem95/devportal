import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { deliverables, projects } from "../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getPresignedUploadUrl, deleteFile, getKeyFromUrl } from "@/lib/storage";

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Helper to get file extension
function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
}

// Map extensions to icons/categories
const fileCategories: Record<string, string> = {
  // Code
  js: "code", ts: "code", jsx: "code", tsx: "code", py: "code", rb: "code",
  go: "code", rs: "code", java: "code", cpp: "code", c: "code", h: "code",
  css: "code", scss: "code", html: "code", php: "code", swift: "code",
  // Documents
  pdf: "document", doc: "document", docx: "document", txt: "document",
  md: "document", rtf: "document",
  // Images
  png: "image", jpg: "image", jpeg: "image", gif: "image", svg: "image",
  webp: "image", ico: "image",
  // Archives
  zip: "archive", tar: "archive", gz: "archive", rar: "archive", "7z": "archive",
  // Data
  json: "data", xml: "data", csv: "data", sql: "data", yml: "data", yaml: "data",
  // Design
  fig: "design", sketch: "design", psd: "design", ai: "design", xd: "design",
};

export const deliverableRouter = router({
  // List all deliverables for a project
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        milestoneId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify project belongs to user
      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.projectId),
      });

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const conditions = [eq(deliverables.projectId, input.projectId)];
      
      if (input.milestoneId) {
        conditions.push(eq(deliverables.milestoneId, input.milestoneId));
      }

      const results = await ctx.db.query.deliverables.findMany({
        where: and(...conditions),
        with: {
          milestone: {
            columns: { id: true, name: true },
          },
        },
        orderBy: [desc(deliverables.createdAt)],
      });

      // Group by base filename to show version history
      const grouped = results.reduce((acc, file) => {
        const ext = getFileExtension(file.fileName);
        const category = fileCategories[ext] || "other";
        
        return [
          ...acc,
          {
            ...file,
            extension: ext,
            category,
            formattedSize: file.fileSize ? formatFileSize(file.fileSize) : null,
          },
        ];
      }, [] as Array<typeof results[0] & { extension: string; category: string; formattedSize: string | null }>);

      return grouped;
    }),

  // Get a single deliverable
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const deliverable = await ctx.db.query.deliverables.findFirst({
        where: eq(deliverables.id, input.id),
        with: {
          project: true,
          milestone: true,
        },
      });

      if (!deliverable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deliverable not found",
        });
      }

      // Verify access
      if (deliverable.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this deliverable",
        });
      }

      // Get version history
      const versions = await ctx.db.query.deliverables.findMany({
        where: eq(deliverables.fileName, deliverable.fileName),
        orderBy: [desc(deliverables.version)],
      });

      return {
        ...deliverable,
        extension: getFileExtension(deliverable.fileName),
        category: fileCategories[getFileExtension(deliverable.fileName)] || "other",
        formattedSize: deliverable.fileSize ? formatFileSize(deliverable.fileSize) : null,
        versions,
      };
    }),

  // Get upload URL (presigned URL for direct upload to R2)
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project belongs to user
      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.projectId),
      });

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (input.fileSize > maxSize) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File size exceeds 100MB limit",
        });
      }

      // Generate unique key for the file
      const timestamp = Date.now();
      const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileKey = `deliverables/${project.id}/${timestamp}-${sanitizedFileName}`;

      // Get presigned URL for direct upload to R2
      const { uploadUrl, fileUrl } = await getPresignedUploadUrl({
        key: fileKey,
        contentType: input.fileType,
        expiresIn: 3600, // 1 hour
      });

      return {
        uploadUrl,
        fileUrl,
        fileKey,
      };
    }),

  // Create a new deliverable (after successful upload)
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        milestoneId: z.string().optional(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        versionNotes: z.string().optional(),
        githubUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project belongs to user
      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.projectId),
      });

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Check if file with same name exists (for versioning)
      const existing = await ctx.db.query.deliverables.findFirst({
        where: and(
          eq(deliverables.projectId, input.projectId),
          eq(deliverables.fileName, input.fileName)
        ),
        orderBy: [desc(deliverables.version)],
      });

      const version = existing ? existing.version + 1 : 1;
      const previousVersionId = existing?.id;

      const [deliverable] = await ctx.db
        .insert(deliverables)
        .values({
          projectId: input.projectId,
          milestoneId: input.milestoneId,
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          version,
          versionNotes: input.versionNotes,
          previousVersionId,
          githubUrl: input.githubUrl,
          uploadedBy: ctx.user.id,
        })
        .returning();

      return deliverable;
    }),

  // Create new version of existing file
  createVersion: protectedProcedure
    .input(
      z.object({
        previousId: z.string(),
        fileUrl: z.string(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        versionNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get previous version
      const previous = await ctx.db.query.deliverables.findFirst({
        where: eq(deliverables.id, input.previousId),
        with: { project: true },
      });

      if (!previous) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Previous version not found",
        });
      }

      if (previous.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this deliverable",
        });
      }

      const [deliverable] = await ctx.db
        .insert(deliverables)
        .values({
          projectId: previous.projectId,
          milestoneId: previous.milestoneId,
          fileName: previous.fileName,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          version: previous.version + 1,
          versionNotes: input.versionNotes,
          previousVersionId: previous.id,
          githubUrl: previous.githubUrl,
          uploadedBy: ctx.user.id,
        })
        .returning();

      return deliverable;
    }),

  // Add GitHub link
  addGithubLink: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        githubUrl: z.string().url(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project belongs to user
      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.projectId),
      });

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Extract repo name from URL if not provided
      const repoName = input.name || input.githubUrl.split("/").slice(-2).join("/");

      const [deliverable] = await ctx.db
        .insert(deliverables)
        .values({
          projectId: input.projectId,
          fileName: repoName,
          fileUrl: input.githubUrl,
          mimeType: "application/x-github-repo",
          version: 1,
          githubUrl: input.githubUrl,
          uploadedBy: ctx.user.id,
        })
        .returning();

      return deliverable;
    }),

  // Update deliverable (notes, milestone)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        versionNotes: z.string().optional(),
        milestoneId: z.string().nullable().optional(),
        githubUrl: z.string().url().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.query.deliverables.findFirst({
        where: eq(deliverables.id, id),
        with: { project: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deliverable not found",
        });
      }

      if (existing.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this deliverable",
        });
      }

      const [updated] = await ctx.db
        .update(deliverables)
        .set(data)
        .where(eq(deliverables.id, id))
        .returning();

      return updated;
    }),

  // Delete deliverable
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.deliverables.findFirst({
        where: eq(deliverables.id, input.id),
        with: { project: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deliverable not found",
        });
      }

      if (existing.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this deliverable",
        });
      }

      // Delete file from R2 (skip for GitHub links)
      if (existing.mimeType !== "application/x-github-repo") {
        const fileKey = getKeyFromUrl(existing.fileUrl);
        if (fileKey) {
          try {
            await deleteFile(fileKey);
          } catch (error) {
            console.error("[Deliverable] Failed to delete file from R2:", error);
            // Continue anyway - don't block the database deletion
          }
        }
      }

      await ctx.db.delete(deliverables).where(eq(deliverables.id, input.id));

      return { success: true };
    }),

  // ============ PUBLIC ENDPOINTS ============

  // List deliverables for public project view
  listPublic: publicProcedure
    .input(z.object({ projectPublicId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.publicId, input.projectPublicId),
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const results = await ctx.db.query.deliverables.findMany({
        where: eq(deliverables.projectId, project.id),
        with: {
          milestone: {
            columns: { id: true, name: true },
          },
        },
        orderBy: [desc(deliverables.createdAt)],
      });

      return results.map((file) => {
        const ext = getFileExtension(file.fileName);
        return {
          id: file.id,
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          version: file.version,
          versionNotes: file.versionNotes,
          githubUrl: file.githubUrl,
          downloadCount: file.downloadCount,
          createdAt: file.createdAt,
          milestone: file.milestone,
          extension: ext,
          category: fileCategories[ext] || "other",
          formattedSize: file.fileSize ? formatFileSize(file.fileSize) : null,
        };
      });
    }),

  // Track download (public)
  trackDownload: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deliverable = await ctx.db.query.deliverables.findFirst({
        where: eq(deliverables.id, input.id),
      });

      if (!deliverable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deliverable not found",
        });
      }

      await ctx.db
        .update(deliverables)
        .set({
          downloadCount: sql`${deliverables.downloadCount} + 1`,
          lastDownloadedAt: new Date(),
        })
        .where(eq(deliverables.id, input.id));

      return { success: true, fileUrl: deliverable.fileUrl };
    }),
});