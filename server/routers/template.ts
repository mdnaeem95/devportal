import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { templates } from "../db/schema";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const templateRouter = router({
  // List all templates (user's custom + system defaults)
  list: protectedProcedure
    .input(
      z.object({
        type: z.enum(["contract", "invoice"]).optional(),
        sortBy: z.enum(["created", "name", "usage", "lastUsed"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        or(
          eq(templates.userId, ctx.user.id),
          eq(templates.isSystem, true)
        ),
      ];

      if (input?.type) {
        conditions.push(eq(templates.type, input.type));
      }

      // Determine sort order
      let orderBy;
      switch (input?.sortBy) {
        case "name":
          orderBy = [desc(templates.isSystem), templates.name];
          break;
        case "usage":
          orderBy = [desc(templates.isSystem), desc(templates.usageCount), desc(templates.createdAt)];
          break;
        case "lastUsed":
          orderBy = [desc(templates.isSystem), desc(templates.lastUsedAt), desc(templates.createdAt)];
          break;
        default:
          orderBy = [desc(templates.isSystem), desc(templates.isDefault), desc(templates.createdAt)];
      }

      return ctx.db.query.templates.findMany({
        where: and(...conditions),
        orderBy,
      });
    }),

  // Get a single template
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.db.query.templates.findFirst({
        where: eq(templates.id, input.id),
      });

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      // Check access (own template or system template)
      if (template.userId !== ctx.user.id && !template.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this template",
        });
      }

      return template;
    }),

  // Get default template for a type
  getDefault: protectedProcedure
    .input(z.object({ type: z.enum(["contract", "invoice"]) }))
    .query(async ({ ctx, input }) => {
      // First try to find user's default
      const userDefault = await ctx.db.query.templates.findFirst({
        where: and(
          eq(templates.userId, ctx.user.id),
          eq(templates.type, input.type),
          eq(templates.isDefault, true)
        ),
      });

      if (userDefault) return userDefault;

      // Fall back to first system template of this type
      const systemDefault = await ctx.db.query.templates.findFirst({
        where: and(
          eq(templates.isSystem, true),
          eq(templates.type, input.type)
        ),
        orderBy: [desc(templates.createdAt)],
      });

      return systemDefault || null;
    }),

  // Create a new template
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["contract", "invoice"]),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        content: z.string().min(1, "Content is required"),
        setAsDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { setAsDefault, ...templateData } = input;

      // If setting as default, unset any existing default first
      if (setAsDefault) {
        await ctx.db
          .update(templates)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(
            and(
              eq(templates.userId, ctx.user.id),
              eq(templates.type, input.type),
              eq(templates.isDefault, true)
            )
          );
      }

      const [template] = await ctx.db
        .insert(templates)
        .values({
          userId: ctx.user.id,
          type: templateData.type,
          name: templateData.name,
          description: templateData.description,
          content: templateData.content,
          isSystem: false,
          isDefault: setAsDefault || false,
        })
        .returning();

      return template;
    }),

  // Update a template
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.query.templates.findFirst({
        where: eq(templates.id, id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      // Can't edit system templates
      if (existing.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot edit system templates. Duplicate it first.",
        });
      }

      if (existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this template",
        });
      }

      const [updated] = await ctx.db
        .update(templates)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(templates.id, id))
        .returning();

      return updated;
    }),

  // Set a template as default for its type
  setDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.query.templates.findFirst({
        where: eq(templates.id, input.id),
      });

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      // Must own the template or it must be a system template
      if (template.userId !== ctx.user.id && !template.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this template",
        });
      }

      // For system templates, we need to "adopt" it by creating a user preference
      // For simplicity, we'll just allow setting system templates as default directly
      // In a more complex system, you might create a separate user_template_preferences table

      // Unset any existing default for this type
      await ctx.db
        .update(templates)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(
          and(
            or(
              eq(templates.userId, ctx.user.id),
              eq(templates.isSystem, true)
            ),
            eq(templates.type, template.type),
            eq(templates.isDefault, true)
          )
        );

      // Set this template as default
      const [updated] = await ctx.db
        .update(templates)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(templates.id, input.id))
        .returning();

      return updated;
    }),

  // Remove default status from a template
  removeDefault: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.query.templates.findFirst({
        where: eq(templates.id, input.id),
      });

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      if (template.userId !== ctx.user.id && !template.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this template",
        });
      }

      const [updated] = await ctx.db
        .update(templates)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(templates.id, input.id))
        .returning();

      return updated;
    }),

  // Increment usage count (called when a contract/invoice is created from template)
  incrementUsage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.query.templates.findFirst({
        where: eq(templates.id, input.id),
      });

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      // Allow incrementing for system templates (they're shared)
      // For user templates, verify ownership
      if (!template.isSystem && template.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this template",
        });
      }

      const [updated] = await ctx.db
        .update(templates)
        .set({
          usageCount: sql`${templates.usageCount} + 1`,
          lastUsedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(templates.id, input.id))
        .returning();

      return updated;
    }),

  // Duplicate a template (useful for customizing system templates)
  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const original = await ctx.db.query.templates.findFirst({
        where: eq(templates.id, input.id),
      });

      if (!original) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      const [duplicate] = await ctx.db
        .insert(templates)
        .values({
          userId: ctx.user.id,
          type: original.type,
          name: `${original.name} (Copy)`,
          description: original.description,
          content: original.content,
          isSystem: false,
          isDefault: false,
          usageCount: 0, // Reset usage count for copies
          lastUsedAt: null,
        })
        .returning();

      return duplicate;
    }),

  // Delete a template
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.templates.findFirst({
        where: eq(templates.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      if (existing.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete system templates",
        });
      }

      if (existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this template",
        });
      }

      await ctx.db.delete(templates).where(eq(templates.id, input.id));

      return { success: true };
    }),
});