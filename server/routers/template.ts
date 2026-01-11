import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { templates } from "../db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const templateRouter = router({
  // List all templates (user's custom + system defaults)
  list: protectedProcedure
    .input(
      z.object({
        type: z.enum(["contract", "invoice"]).optional(),
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

      return ctx.db.query.templates.findMany({
        where: and(...conditions),
        orderBy: [desc(templates.isSystem), desc(templates.createdAt)],
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

  // Create a new template
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["contract", "invoice"]),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        content: z.string().min(1, "Content is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .insert(templates)
        .values({
          userId: ctx.user.id,
          type: input.type,
          name: input.name,
          description: input.description,
          content: input.content,
          isSystem: false,
          isDefault: false,
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
        isDefault: z.boolean().optional(),
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