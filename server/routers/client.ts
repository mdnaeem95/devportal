import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { clients, projects, invoices, contracts, clientNotes } from "../db/schema";
import { eq, desc, asc, count, and, sum, max, lt, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const clientStatusEnum = z.enum(["active", "inactive", "lead"]);
const sortByEnum = z.enum(["name", "revenue", "lastActivity", "dateAdded"]);

// Calculate payment behavior based on invoice history
function calculatePaymentBehavior(
  invoiceList: { status: string; paidAt: Date | null; dueDate: Date; sentAt: Date | null }[]
): { label: string; variant: "success" | "default" | "warning" | "destructive"; avgDays: number | null } {
  const paidInvoices = invoiceList.filter((inv) => inv.status === "paid" && inv.paidAt && inv.sentAt);

  if (paidInvoices.length === 0) {
    return { label: "No History", variant: "default", avgDays: null };
  }

  // Calculate average days to pay from sent date
  const daysToPayList = paidInvoices.map((inv) => {
    const sent = new Date(inv.sentAt!);
    const paid = new Date(inv.paidAt!);
    return Math.floor((paid.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24));
  });

  const avgDays = Math.round(daysToPayList.reduce((a, b) => a + b, 0) / daysToPayList.length);

  if (avgDays <= 7) {
    return { label: "Pays Fast", variant: "success", avgDays };
  } else if (avgDays <= 30) {
    return { label: "On Time", variant: "default", avgDays };
  } else if (avgDays <= 45) {
    return { label: "Usually Late", variant: "warning", avgDays };
  } else {
    return { label: "Slow Payer", variant: "destructive", avgDays };
  }
}

export const clientRouter = router({
  // List all clients for the current user with project count, revenue, and last activity
  list: protectedProcedure
    .input(
      z
        .object({
          sortBy: sortByEnum.optional().default("dateAdded"),
          sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
          status: clientStatusEnum.optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { sortBy = "dateAdded", sortOrder = "desc", status } = input ?? {};

      // Build where clause
      const whereClause = status
        ? and(eq(clients.userId, ctx.user.id), eq(clients.status, status))
        : eq(clients.userId, ctx.user.id);

      const clientList = await ctx.db.query.clients.findMany({
        where: whereClause,
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

      const countMap = new Map(projectCounts.map((pc) => [pc.clientId, pc.count]));

      // Get revenue (sum of paid invoices) for each client
      const revenueData = await ctx.db
        .select({
          clientId: invoices.clientId,
          totalRevenue: sum(invoices.total),
        })
        .from(invoices)
        .where(and(eq(invoices.userId, ctx.user.id), eq(invoices.status, "paid")))
        .groupBy(invoices.clientId);

      const revenueMap = new Map(revenueData.map((r) => [r.clientId, Number(r.totalRevenue) || 0]));

      // Get last activity for each client (most recent of: project update, invoice, contract, note)
      const projectActivity = await ctx.db
        .select({
          clientId: projects.clientId,
          lastActivity: max(projects.updatedAt),
        })
        .from(projects)
        .where(eq(projects.userId, ctx.user.id))
        .groupBy(projects.clientId);

      const invoiceActivity = await ctx.db
        .select({
          clientId: invoices.clientId,
          lastActivity: max(invoices.updatedAt),
        })
        .from(invoices)
        .where(eq(invoices.userId, ctx.user.id))
        .groupBy(invoices.clientId);

      const contractActivity = await ctx.db
        .select({
          clientId: contracts.clientId,
          lastActivity: max(contracts.updatedAt),
        })
        .from(contracts)
        .where(eq(contracts.userId, ctx.user.id))
        .groupBy(contracts.clientId);

      const noteActivity = await ctx.db
        .select({
          clientId: clientNotes.clientId,
          lastActivity: max(clientNotes.createdAt),
        })
        .from(clientNotes)
        .where(eq(clientNotes.userId, ctx.user.id))
        .groupBy(clientNotes.clientId);

      // Merge all activity data
      const activityMap = new Map<string, Date>();

      for (const { clientId, lastActivity } of projectActivity) {
        if (clientId && lastActivity) {
          const current = activityMap.get(clientId);
          if (!current || lastActivity > current) {
            activityMap.set(clientId, lastActivity);
          }
        }
      }

      for (const { clientId, lastActivity } of invoiceActivity) {
        if (clientId && lastActivity) {
          const current = activityMap.get(clientId);
          if (!current || lastActivity > current) {
            activityMap.set(clientId, lastActivity);
          }
        }
      }

      for (const { clientId, lastActivity } of contractActivity) {
        if (clientId && lastActivity) {
          const current = activityMap.get(clientId);
          if (!current || lastActivity > current) {
            activityMap.set(clientId, lastActivity);
          }
        }
      }

      for (const { clientId, lastActivity } of noteActivity) {
        if (clientId && lastActivity) {
          const current = activityMap.get(clientId);
          if (!current || lastActivity > current) {
            activityMap.set(clientId, lastActivity);
          }
        }
      }

      // Map clients with additional data
      let enrichedClients = clientList.map((client) => ({
        ...client,
        projectCount: countMap.get(client.id) ?? 0,
        totalRevenue: revenueMap.get(client.id) ?? 0,
        lastActivity: activityMap.get(client.id) ?? client.createdAt,
      }));

      // Sort: starred always first, then by selected criteria
      enrichedClients.sort((a, b) => {
        // Starred clients always come first
        if (a.starred && !b.starred) return -1;
        if (!a.starred && b.starred) return 1;

        // Then sort by selected criteria
        let comparison = 0;
        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "revenue":
            comparison = a.totalRevenue - b.totalRevenue;
            break;
          case "lastActivity":
            comparison = new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
            break;
          case "dateAdded":
          default:
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }

        return sortOrder === "desc" ? -comparison : comparison;
      });

      return enrichedClients;
    }),

  // Get a single client by ID with projects, invoices, notes, timeline, and payment behavior
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
        where: and(eq(projects.clientId, input.id), eq(projects.userId, ctx.user.id)),
        orderBy: [desc(projects.updatedAt)],
      });

      // Fetch related invoices
      const clientInvoices = await ctx.db.query.invoices.findMany({
        where: and(eq(invoices.clientId, input.id), eq(invoices.userId, ctx.user.id)),
        orderBy: [desc(invoices.createdAt)],
      });

      // Fetch related contracts
      const clientContracts = await ctx.db.query.contracts.findMany({
        where: and(eq(contracts.clientId, input.id), eq(contracts.userId, ctx.user.id)),
        orderBy: [desc(contracts.createdAt)],
      });

      // Fetch quick notes (separate from client.notes string field)
      const quickNotes = await ctx.db.query.clientNotes.findMany({
        where: and(eq(clientNotes.clientId, input.id), eq(clientNotes.userId, ctx.user.id)),
        orderBy: [desc(clientNotes.createdAt)],
      });

      // Calculate last activity
      let lastActivity = client.createdAt;
      for (const project of clientProjects) {
        if (project.updatedAt > lastActivity) lastActivity = project.updatedAt;
      }
      for (const invoice of clientInvoices) {
        if (invoice.updatedAt > lastActivity) lastActivity = invoice.updatedAt;
      }
      for (const contract of clientContracts) {
        if (contract.updatedAt > lastActivity) lastActivity = contract.updatedAt;
      }
      for (const note of quickNotes) {
        if (note.createdAt > lastActivity) lastActivity = note.createdAt;
      }

      // Calculate payment behavior
      const paymentBehavior = calculatePaymentBehavior(
        clientInvoices.map((inv) => ({
          status: inv.status,
          paidAt: inv.paidAt,
          dueDate: inv.dueDate,
          sentAt: inv.sentAt,
        }))
      );

      // Calculate client insights
      const paidInvoices = clientInvoices.filter((inv) => inv.status === "paid");
      const lifetimeValue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const avgProjectValue =
        clientProjects.length > 0
          ? Math.round(clientProjects.reduce((sum, p) => sum + (p.totalAmount || 0), 0) / clientProjects.length)
          : 0;
      const firstInteraction = client.createdAt;
      const monthsWorking = Math.floor(
        (Date.now() - new Date(firstInteraction).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      // Build activity timeline
      const timeline: {
        id: string;
        type: "project" | "invoice" | "contract" | "note";
        title: string;
        description: string;
        date: Date;
        status?: string;
        amount?: number;
      }[] = [];

      for (const project of clientProjects) {
        timeline.push({
          id: project.id,
          type: "project",
          title: project.name,
          description: `Project ${project.status}`,
          date: project.createdAt,
          status: project.status,
          amount: project.totalAmount || undefined,
        });
      }

      for (const invoice of clientInvoices) {
        timeline.push({
          id: invoice.id,
          type: "invoice",
          title: invoice.invoiceNumber,
          description: `Invoice ${invoice.status}`,
          date: invoice.createdAt,
          status: invoice.status,
          amount: invoice.total,
        });
      }

      for (const contract of clientContracts) {
        timeline.push({
          id: contract.id,
          type: "contract",
          title: contract.name,
          description: `Contract ${contract.status}`,
          date: contract.createdAt,
          status: contract.status,
        });
      }

      for (const note of quickNotes) {
        timeline.push({
          id: note.id,
          type: "note",
          title: "Note added",
          description: note.content.length > 100 ? note.content.slice(0, 100) + "..." : note.content,
          date: note.createdAt,
        });
      }

      // Sort timeline by date descending
      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        ...client,
        projects: clientProjects,
        invoices: clientInvoices,
        contracts: clientContracts,
        quickNotes,
        lastActivity,
        paymentBehavior,
        insights: {
          lifetimeValue,
          avgProjectValue,
          totalProjects: clientProjects.length,
          totalInvoices: clientInvoices.length,
          paidInvoices: paidInvoices.length,
          monthsWorking,
        },
        timeline: timeline.slice(0, 20), // Limit to 20 most recent
      };
    }),

  // Get clients needing follow-up (not contacted in X days)
  getFollowUpReminders: protectedProcedure
    .input(
      z.object({
        daysThreshold: z.number().min(1).max(365).default(30),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const daysThreshold = input?.daysThreshold ?? 30;
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

      // Get all active clients
      const activeClients = await ctx.db.query.clients.findMany({
        where: and(eq(clients.userId, ctx.user.id), eq(clients.status, "active")),
      });

      // For each client, find their last activity
      const clientsNeedingFollowUp: {
        id: string;
        name: string;
        email: string;
        company: string | null;
        lastContactAt: Date | null;
        daysSinceContact: number;
      }[] = [];

      for (const client of activeClients) {
        // Get most recent activity across all tables
        const [lastProject] = await ctx.db
          .select({ date: max(projects.updatedAt) })
          .from(projects)
          .where(and(eq(projects.clientId, client.id), eq(projects.userId, ctx.user.id)));

        const [lastInvoice] = await ctx.db
          .select({ date: max(invoices.updatedAt) })
          .from(invoices)
          .where(and(eq(invoices.clientId, client.id), eq(invoices.userId, ctx.user.id)));

        const [lastContract] = await ctx.db
          .select({ date: max(contracts.updatedAt) })
          .from(contracts)
          .where(and(eq(contracts.clientId, client.id), eq(contracts.userId, ctx.user.id)));

        const [lastNote] = await ctx.db
          .select({ date: max(clientNotes.createdAt) })
          .from(clientNotes)
          .where(and(eq(clientNotes.clientId, client.id), eq(clientNotes.userId, ctx.user.id)));

        // Find the most recent date
        const dates = [
          client.lastContactAt,
          lastProject?.date,
          lastInvoice?.date,
          lastContract?.date,
          lastNote?.date,
        ].filter(Boolean) as Date[];

        const lastContactAt = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;

        // Check if needs follow-up
        if (!lastContactAt || lastContactAt < thresholdDate) {
          const daysSinceContact = lastContactAt
            ? Math.floor((Date.now() - lastContactAt.getTime()) / (1000 * 60 * 60 * 24))
            : Math.floor((Date.now() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24));

          clientsNeedingFollowUp.push({
            id: client.id,
            name: client.name,
            email: client.email,
            company: client.company,
            lastContactAt,
            daysSinceContact,
          });
        }
      }

      // Sort by days since contact (most urgent first)
      clientsNeedingFollowUp.sort((a, b) => b.daysSinceContact - a.daysSinceContact);

      return clientsNeedingFollowUp;
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
        status: clientStatusEnum.optional().default("active"),
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
        status: clientStatusEnum.optional(),
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

  // Toggle starred status
  toggleStarred: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.id),
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
          starred: !existing.starred,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, input.id))
        .returning();

      return updated;
    }),

  // Update status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: clientStatusEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.id),
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
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, input.id))
        .returning();

      return updated;
    }),

  // Update last contact
  updateLastContact: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.id),
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
          lastContactAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(clients.id, input.id))
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

  // ==================== NOTES ====================

  // Add a note
  addNote: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        content: z.string().min(1, "Note content is required").max(2000, "Note too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify client ownership
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });

      if (!client || client.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      const [note] = await ctx.db
        .insert(clientNotes)
        .values({
          userId: ctx.user.id,
          clientId: input.clientId,
          content: input.content,
        })
        .returning();

      // Update client's lastContactAt
      await ctx.db
        .update(clients)
        .set({
          lastContactAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(clients.id, input.clientId));

      return note;
    }),

  // List notes for a client
  listNotes: protectedProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify client ownership
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });

      if (!client || client.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      return ctx.db.query.clientNotes.findMany({
        where: eq(clientNotes.clientId, input.clientId),
        orderBy: [desc(clientNotes.createdAt)],
      });
    }),

  // Delete a note
  deleteNote: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await ctx.db.query.clientNotes.findFirst({
        where: eq(clientNotes.id, input.id),
      });

      if (!note || note.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note not found",
        });
      }

      await ctx.db.delete(clientNotes).where(eq(clientNotes.id, input.id));

      return { success: true };
    }),
});