import { router, protectedProcedure } from "../trpc";
import { projects, clients, invoices, milestones } from "../db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export const dashboardRouter = router({
  // Get dashboard stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Active projects count
    const activeProjects = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(
        and(eq(projects.userId, userId), eq(projects.status, "active"))
      );

    // Total clients
    const totalClients = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(eq(clients.userId, userId));

    // Outstanding invoices (sent but not paid)
    const outstandingInvoices = await ctx.db
      .select({
        count: sql<number>`count(*)`,
        total: sql<number>`coalesce(sum(total), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, "sent")
        )
      );

    // Paid this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const paidThisMonth = await ctx.db
      .select({
        total: sql<number>`coalesce(sum(paid_amount), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, "paid"),
          gte(invoices.paidAt, startOfMonth)
        )
      );

    return {
      activeProjects: Number(activeProjects[0]?.count ?? 0),
      totalClients: Number(totalClients[0]?.count ?? 0),
      outstandingInvoices: {
        count: Number(outstandingInvoices[0]?.count ?? 0),
        total: Number(outstandingInvoices[0]?.total ?? 0),
      },
      paidThisMonth: Number(paidThisMonth[0]?.total ?? 0),
    };
  }),

  // Get recent activity
  recentProjects: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.projects.findMany({
      where: eq(projects.userId, ctx.user.id),
      with: {
        client: true,
      },
      orderBy: [desc(projects.updatedAt)],
      limit: 5,
    });
  }),

  // Get upcoming milestones
  upcomingMilestones: protectedProcedure.query(async ({ ctx }) => {
    const userProjects = await ctx.db.query.projects.findMany({
      where: eq(projects.userId, ctx.user.id),
      columns: { id: true },
    });

    const projectIds = userProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return [];
    }

    return ctx.db.query.milestones.findMany({
      where: and(
        sql`${milestones.projectId} IN ${projectIds}`,
        eq(milestones.status, "pending"),
        gte(milestones.dueDate, new Date())
      ),
      with: {
        project: {
          columns: { id: true, name: true },
        },
      },
      orderBy: [milestones.dueDate],
      limit: 5,
    });
  }),

  // Get pending invoices
  pendingInvoices: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.invoices.findMany({
      where: and(
        eq(invoices.userId, ctx.user.id),
        eq(invoices.status, "sent")
      ),
      with: {
        client: true,
        project: {
          columns: { id: true, name: true },
        },
      },
      orderBy: [invoices.dueDate],
      limit: 5,
    });
  }),
});
