import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { projects, clients, milestones, invoices, users } from "../db/schema";
import { eq, desc, and, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const projectStatusSchema = z.enum([
  "draft",
  "active",
  "on_hold",
  "completed",
  "cancelled",
]);

export const projectRouter = router({
  // List all projects for the current user (with milestone counts for progress)
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

      const projectList = await ctx.db.query.projects.findMany({
        where: and(...conditions),
        with: {
          client: true,
        },
        orderBy: [desc(projects.createdAt)],
      });

      // Get milestone counts for each project
      const projectsWithProgress = await Promise.all(
        projectList.map(async (project) => {
          const projectMilestones = await ctx.db.query.milestones.findMany({
            where: eq(milestones.projectId, project.id),
          });

          const totalMilestones = projectMilestones.length;
          const completedMilestones = projectMilestones.filter((m) =>
            ["completed", "invoiced", "paid"].includes(m.status)
          ).length;

          // Check for overdue milestones
          const now = new Date();
          const hasOverdue = projectMilestones.some(
            (m) =>
              m.dueDate &&
              new Date(m.dueDate) < now &&
              !["completed", "invoiced", "paid"].includes(m.status)
          );

          return {
            ...project,
            totalMilestones,
            completedMilestones,
            progress: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
            hasOverdue,
          };
        })
      );

      return projectsWithProgress;
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
        orderBy: [asc(milestones.order)],
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
        .set({ ...data, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();

      return updated;
    }),

  // Duplicate a project
  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get original project with milestones
      const original = await ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.id),
      });

      if (!original || original.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Get original milestones
      const originalMilestones = await ctx.db.query.milestones.findMany({
        where: eq(milestones.projectId, input.id),
        orderBy: [asc(milestones.order)],
      });

      // Create new project with "(Copy)" suffix
      const [newProject] = await ctx.db
        .insert(projects)
        .values({
          userId: ctx.user.id,
          clientId: original.clientId,
          name: `${original.name} (Copy)`,
          description: original.description,
          status: "draft", // Always start as draft
          totalAmount: original.totalAmount,
          // Don't copy dates - user should set new dates
        })
        .returning();

      // Duplicate milestones (reset status to pending)
      if (originalMilestones.length > 0) {
        await ctx.db.insert(milestones).values(
          originalMilestones.map((m) => ({
            projectId: newProject.id,
            name: m.name,
            description: m.description,
            amount: m.amount,
            status: "pending" as const, // Reset to pending
            order: m.order,
            // Don't copy due dates - user should set new dates
          }))
        );
      }

      return newProject;
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

      // Check if password protected but no/wrong password provided
      const isLocked = !!project.publicPassword;
      if (isLocked && project.publicPassword !== input.password) {
        return {
          id: project.id,
          name: project.name,
          isLocked: true,
          status: project.status,
        };
      }

      // Get milestones
      const projectMilestones = await ctx.db.query.milestones.findMany({
        where: eq(milestones.projectId, project.id),
        orderBy: [asc(milestones.order)],
      });

      // Get invoices
      const projectInvoices = await ctx.db.query.invoices.findMany({
        where: eq(invoices.projectId, project.id),
        orderBy: [desc(invoices.createdAt)],
      });

      // Get user/business info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, project.userId),
      });

      // Return data for public view
      return {
        id: project.id,
        publicId: project.publicId,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        isLocked: false,
        client: {
          name: project.client.name,
          company: project.client.company,
          email: project.client.email,
        },
        business: user ? {
          name: user.businessName || user.name,
          email: user.email,
          logoUrl: user.logoUrl,
        } : null,
        milestones: projectMilestones.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          amount: m.amount,
          status: m.status,
          dueDate: m.dueDate,
        })),
        invoices: projectInvoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          total: inv.total,
          currency: inv.currency,
          status: inv.status,
          dueDate: inv.dueDate,
          payToken: inv.payToken,
        })),
      };
    }),
});