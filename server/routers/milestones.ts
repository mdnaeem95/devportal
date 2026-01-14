import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { milestones, projects } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const milestoneStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "invoiced",
  "paid",
]);

export const milestoneRouter = router({
  // List milestones for a project
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
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

      return ctx.db.query.milestones.findMany({
        where: eq(milestones.projectId, input.projectId),
        orderBy: [asc(milestones.order)],
      });
    }),

  // Get a single milestone
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const milestone = await ctx.db.query.milestones.findFirst({
        where: eq(milestones.id, input.id),
        with: {
          project: true,
        },
      });

      if (!milestone) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Milestone not found",
        });
      }

      if (milestone.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return milestone;
    }),

  // Create a new milestone
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        amount: z.number().min(0, "Amount must be positive"),
        dueDate: z.date().optional(),
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

      // Get the highest order number
      const existingMilestones = await ctx.db.query.milestones.findMany({
        where: eq(milestones.projectId, input.projectId),
        orderBy: [asc(milestones.order)],
      });

      const nextOrder = existingMilestones.length > 0 
        ? Math.max(...existingMilestones.map(m => m.order ?? 0)) + 1 
        : 0;

      const [milestone] = await ctx.db
        .insert(milestones)
        .values({
          projectId: input.projectId,
          name: input.name,
          description: input.description,
          amount: input.amount,
          dueDate: input.dueDate,
          order: nextOrder,
          status: "pending",
        })
        .returning();

      // Update project total amount
      const newTotal = (project.totalAmount ?? 0) + input.amount;
      await ctx.db
        .update(projects)
        .set({ totalAmount: newTotal, updatedAt: new Date() })
        .where(eq(projects.id, input.projectId));

      return milestone;
    }),

  // Update a milestone
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        amount: z.number().min(0).optional(),
        dueDate: z.date().nullable().optional(),
        status: milestoneStatusSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.query.milestones.findFirst({
        where: eq(milestones.id, id),
        with: {
          project: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Milestone not found",
        });
      }

      if (existing.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Don't allow editing invoiced/paid milestones (except status)
      if (
        ["invoiced", "paid"].includes(existing.status) &&
        (data.name || data.description || data.amount !== undefined)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot edit invoiced or paid milestones",
        });
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
      if (data.status !== undefined) {
        updateData.status = data.status;
        // Set completedAt when marking as completed
        if (data.status === "completed" && existing.status !== "completed") {
          updateData.completedAt = new Date();
        }
        // Clear completedAt if moving back from completed
        if (data.status !== "completed" && existing.status === "completed") {
          updateData.completedAt = null;
        }
      }

      // Handle amount change - update project total
      if (data.amount !== undefined && data.amount !== existing.amount) {
        updateData.amount = data.amount;
        const amountDiff = data.amount - existing.amount;
        const newTotal = (existing.project.totalAmount ?? 0) + amountDiff;
        await ctx.db
          .update(projects)
          .set({ totalAmount: newTotal, updatedAt: new Date() })
          .where(eq(projects.id, existing.projectId));
      }

      const [updated] = await ctx.db
        .update(milestones)
        .set(updateData)
        .where(eq(milestones.id, id))
        .returning();

      return updated;
    }),

  // Update milestone status (quick action)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: milestoneStatusSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.milestones.findFirst({
        where: eq(milestones.id, input.id),
        with: {
          project: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Milestone not found",
        });
      }

      if (existing.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Don't allow changing status of paid milestones
      if (existing.status === "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change status of paid milestones",
        });
      }

      const updateData: Record<string, unknown> = {
        status: input.status,
        updatedAt: new Date(),
      };

      // Set completedAt when marking as completed
      if (input.status === "completed" && existing.status !== "completed") {
        updateData.completedAt = new Date();
      }
      // Clear completedAt if moving back from completed
      if (input.status !== "completed" && existing.status === "completed") {
        updateData.completedAt = null;
      }

      const [updated] = await ctx.db
        .update(milestones)
        .set(updateData)
        .where(eq(milestones.id, input.id))
        .returning();

      return updated;
    }),

  // Delete a milestone
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.milestones.findFirst({
        where: eq(milestones.id, input.id),
        with: {
          project: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Milestone not found",
        });
      }

      if (existing.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Don't allow deleting invoiced/paid milestones
      if (["invoiced", "paid"].includes(existing.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete invoiced or paid milestones",
        });
      }

      await ctx.db.delete(milestones).where(eq(milestones.id, input.id));

      // Update project total amount
      const newTotal = Math.max(0, (existing.project.totalAmount ?? 0) - existing.amount);
      await ctx.db
        .update(projects)
        .set({ totalAmount: newTotal, updatedAt: new Date() })
        .where(eq(projects.id, existing.projectId));

      return { success: true };
    }),

  // Reorder milestones
  reorder: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        milestoneIds: z.array(z.string()),
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

      // Update order for each milestone
      await Promise.all(
        input.milestoneIds.map((id, index) =>
          ctx.db
            .update(milestones)
            .set({ order: index, updatedAt: new Date() })
            .where(and(eq(milestones.id, id), eq(milestones.projectId, input.projectId)))
        )
      );

      return { success: true };
    }),
});