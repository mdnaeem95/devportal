import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { projects, clients, milestones } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const projectStatusSchema = z.enum([
  "draft",
  "active",
  "on_hold",
  "completed",
  "cancelled",
]);

export const projectRouter = router({
  // List all projects for the current user
  list: protectedProcedure
    .input(
      z
        .object({
          status: projectStatusSchema.optional(),
          clientId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(projects.userId, ctx.user.id)];

      if (input?.status) {
        conditions.push(eq(projects.status, input.status));
      }

      if (input?.clientId) {
        conditions.push(eq(projects.clientId, input.clientId));
      }

      return ctx.db.query.projects.findMany({
        where: and(...conditions),
        with: {
          client: true,
        },
        orderBy: [desc(projects.createdAt)],
      });
    }),

  // Get a single project by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.id),
        with: {
          client: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this project",
        });
      }

      // Get milestones separately
      const projectMilestones = await ctx.db.query.milestones.findMany({
        where: eq(milestones.projectId, input.id),
        orderBy: [milestones.order],
      });

      return {
        ...project,
        milestones: projectMilestones,
      };
    }),

  // Create a new project
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        clientId: z.string(),
        status: projectStatusSchema.optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        milestones: z
          .array(
            z.object({
              name: z.string(),
              description: z.string().optional(),
              amount: z.number().min(0),
              dueDate: z.date().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { milestones: inputMilestones, ...projectData } = input;

      // Verify client belongs to user
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });

      if (!client || client.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Calculate total amount from milestones
      const totalAmount = inputMilestones?.reduce((sum, m) => sum + m.amount, 0) ?? 0;

      // Create project
      const [project] = await ctx.db
        .insert(projects)
        .values({
          userId: ctx.user.id,
          ...projectData,
          totalAmount,
        })
        .returning();

      // Create milestones if provided
      if (inputMilestones && inputMilestones.length > 0) {
        await ctx.db.insert(milestones).values(
          inputMilestones.map((m, index) => ({
            projectId: project.id,
            name: m.name,
            description: m.description,
            amount: m.amount,
            dueDate: m.dueDate,
            order: index,
          }))
        );
      }

      return project;
    }),

  // Update a project
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: projectStatusSchema.optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check ownership
      const existing = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, id),
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const [updated] = await ctx.db
        .update(projects)
        .set(data)
        .where(eq(projects.id, id))
        .returning();

      return updated;
    }),

  // Delete a project
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const existing = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.id),
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      await ctx.db.delete(projects).where(eq(projects.id, input.id));

      return { success: true };
    }),

  // Get public project view (for clients)
  getPublic: publicProcedure
    .input(
      z.object({
        publicId: z.string(),
        password: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.publicId, input.publicId),
        with: {
          client: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Check password if required
      if (project.publicPassword && project.publicPassword !== input.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }

      // Get milestones
      const projectMilestones = await ctx.db.query.milestones.findMany({
        where: eq(milestones.projectId, project.id),
        orderBy: [milestones.order],
      });

      // Return sanitized data (no sensitive info)
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        client: {
          name: project.client.name,
          company: project.client.company,
        },
        milestones: projectMilestones.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          status: m.status,
          dueDate: m.dueDate,
        })),
      };
    }),
});
