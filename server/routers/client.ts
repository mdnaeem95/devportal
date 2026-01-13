import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { clients, projects, invoices } from "../db/schema";
import { eq, desc, count, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const clientRouter = router({
  // List all clients for the current user with project count
  list: protectedProcedure.query(async ({ ctx }) => {
    const clientList = await ctx.db.query.clients.findMany({
      where: eq(clients.userId, ctx.user.id),
      orderBy: [desc(clients.createdAt)],
    });

    // Get project counts for each client
    const projectCounts = await ctx.db
      .select({
        clientId: projects.clientId,
        count: count(),
      })
      .from(projects)
      .where(eq(projects.userId, ctx.user.id))
      .groupBy(projects.clientId);

    const countMap = new Map(
      projectCounts.map((pc) => [pc.clientId, pc.count])
    );

    return clientList.map((client) => ({
      ...client,
      projectCount: countMap.get(client.id) ?? 0,
    }));
  }),

  // Get a single client by ID with projects and invoices
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.id),
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      if (client.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this client",
        });
      }

      // Fetch related projects
      const clientProjects = await ctx.db.query.projects.findMany({
        where: and(
          eq(projects.clientId, input.id),
          eq(projects.userId, ctx.user.id)
        ),
        orderBy: [desc(projects.updatedAt)],
      });

      // Fetch related invoices
      const clientInvoices = await ctx.db.query.invoices.findMany({
        where: and(
          eq(invoices.clientId, input.id),
          eq(invoices.userId, ctx.user.id)
        ),
        orderBy: [desc(invoices.createdAt)],
      });

      return {
        ...client,
        projects: clientProjects,
        invoices: clientInvoices,
      };
    }),

  // Create a new client
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        company: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [client] = await ctx.db
        .insert(clients)
        .values({
          userId: ctx.user.id,
          ...input,
        })
        .returning();

      return client;
    }),

  // Update a client
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email("Invalid email").optional(),
        company: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check ownership
      const existing = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, id),
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      const [updated] = await ctx.db
        .update(clients)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, id))
        .returning();

      return updated;
    }),

  // Delete a client
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const existing = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.id),
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      await ctx.db.delete(clients).where(eq(clients.id, input.id));

      return { success: true };
    }),
});