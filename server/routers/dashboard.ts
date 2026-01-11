import { router, protectedProcedure } from "../trpc";
import { projects, clients, invoices, milestones } from "../db/schema";
import { eq, and, desc, sql, gte, lte, lt } from "drizzle-orm";

export const dashboardRouter = router({
  // Get dashboard stats
  stats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Date calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

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

    // Paid last month (for growth calculation)
    const paidLastMonth = await ctx.db
      .select({
        total: sql<number>`coalesce(sum(paid_amount), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, "paid"),
          gte(invoices.paidAt, startOfLastMonth),
          lte(invoices.paidAt, endOfLastMonth)
        )
      );

    // Projects created this month vs last month (for growth)
    const projectsThisMonth = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(
        and(
          eq(projects.userId, userId),
          gte(projects.createdAt, startOfMonth)
        )
      );

    const projectsLastMonth = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(
        and(
          eq(projects.userId, userId),
          gte(projects.createdAt, startOfLastMonth),
          lte(projects.createdAt, endOfLastMonth)
        )
      );

    // Calculate growth percentages
    const thisMonthRevenue = Number(paidThisMonth[0]?.total ?? 0);
    const lastMonthRevenue = Number(paidLastMonth[0]?.total ?? 0);
    const revenueGrowth = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : thisMonthRevenue > 0 ? 100 : 0;

    const thisMonthProjects = Number(projectsThisMonth[0]?.count ?? 0);
    const lastMonthProjects = Number(projectsLastMonth[0]?.count ?? 0);
    const projectGrowth = lastMonthProjects > 0
      ? Math.round(((thisMonthProjects - lastMonthProjects) / lastMonthProjects) * 100)
      : thisMonthProjects > 0 ? 100 : 0;

    return {
      activeProjects: Number(activeProjects[0]?.count ?? 0),
      totalClients: Number(totalClients[0]?.count ?? 0),
      outstandingInvoices: {
        count: Number(outstandingInvoices[0]?.count ?? 0),
        total: Number(outstandingInvoices[0]?.total ?? 0),
      },
      paidThisMonth: thisMonthRevenue,
      // Growth metrics (positive = growth, negative = decline, 0 = no change)
      revenueGrowth,
      projectGrowth,
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