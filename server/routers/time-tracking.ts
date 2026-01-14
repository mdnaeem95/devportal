import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { timeEntries, timeTrackingSettings, projects, milestones, invoices, type TimeEntryEdit } from "../db/schema";
import { eq, desc, and, gte, lte, isNull, sql, or, lt, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateDuration(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 1000);
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function roundToNearest(seconds: number, roundToMinutes: number): number {
  if (roundToMinutes <= 0) return seconds;
  const roundToSeconds = roundToMinutes * 60;
  return Math.round(seconds / roundToSeconds) * roundToSeconds;
}

function addEditHistory(
  existing: TimeEntryEdit[] | null,
  field: string,
  oldValue: string | number | null,
  newValue: string | number | null,
  reason?: string
): TimeEntryEdit[] {
  const history = existing || [];
  return [
    ...history,
    {
      editedAt: new Date().toISOString(),
      field,
      oldValue,
      newValue,
      reason,
    },
  ];
}

// ============================================
// ROUTER
// ============================================

export const timeTrackingRouter = router({
  // ============================================
  // TIMER OPERATIONS
  // ============================================

  // Start a new timer
  startTimer: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        milestoneId: z.string().optional(),
        description: z.string().optional(),
        billable: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // ANTI-ABUSE: Check if there's already a running timer
      const runningTimer = await ctx.db.query.timeEntries.findFirst({
        where: and(
          eq(timeEntries.userId, ctx.user.id),
          isNull(timeEntries.endTime)
        ),
      });

      if (runningTimer) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have a timer running. Stop it before starting a new one.",
        });
      }

      // Verify project belongs to user if provided
      if (input.projectId) {
        const project = await ctx.db.query.projects.findFirst({
          where: eq(projects.id, input.projectId),
        });
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
      }

      // Get user's default hourly rate
      const settings = await ctx.db.query.timeTrackingSettings.findFirst({
        where: eq(timeTrackingSettings.userId, ctx.user.id),
      });

      const now = new Date();

      const [entry] = await ctx.db
        .insert(timeEntries)
        .values({
          userId: ctx.user.id,
          projectId: input.projectId,
          milestoneId: input.milestoneId,
          description: input.description,
          startTime: now,
          billable: input.billable,
          hourlyRate: settings?.defaultHourlyRate,
          entryType: "tracked",
          originalStartTime: now,
        })
        .returning();

      return entry;
    }),

  // Stop the running timer
  stopTimer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.query.timeEntries.findFirst({
        where: eq(timeEntries.id, input.id),
      });

      if (!entry || entry.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Time entry not found" });
      }

      if (entry.endTime) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Timer already stopped" });
      }

      // Get settings for rounding
      const settings = await ctx.db.query.timeTrackingSettings.findFirst({
        where: eq(timeTrackingSettings.userId, ctx.user.id),
      });

      const now = new Date();
      let duration = calculateDuration(entry.startTime, now);

      // Apply rounding if configured
      if (settings?.roundToMinutes && settings.roundToMinutes > 0) {
        duration = roundToNearest(duration, settings.roundToMinutes);
      }

      // ANTI-ABUSE: Enforce minimum duration
      const minSeconds = (settings?.minimumEntryMinutes || 1) * 60;
      if (duration < minSeconds) {
        duration = minSeconds;
      }

      const [updated] = await ctx.db
        .update(timeEntries)
        .set({
          endTime: now,
          duration,
          description: input.description || entry.description,
          originalEndTime: now,
          originalDuration: duration,
          updatedAt: new Date(),
        })
        .where(eq(timeEntries.id, input.id))
        .returning();

      return updated;
    }),

  // Get the currently running timer (if any)
  getRunningTimer: protectedProcedure.query(async ({ ctx }) => {
    const entry = await ctx.db.query.timeEntries.findFirst({
      where: and(
        eq(timeEntries.userId, ctx.user.id),
        isNull(timeEntries.endTime)
      ),
      with: {
        project: true,
        milestone: true,
      },
    });

    if (!entry) return null;

    // Calculate current duration
    const currentDuration = calculateDuration(entry.startTime, new Date());

    return {
      ...entry,
      currentDuration,
      formattedDuration: formatDuration(currentDuration),
    };
  }),

  // Discard running timer (no save)
  discardTimer: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.query.timeEntries.findFirst({
        where: eq(timeEntries.id, input.id),
      });

      if (!entry || entry.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Time entry not found" });
      }

      if (entry.endTime) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot discard a stopped timer" });
      }

      await ctx.db.delete(timeEntries).where(eq(timeEntries.id, input.id));

      return { success: true };
    }),

  // ============================================
  // MANUAL ENTRY OPERATIONS
  // ============================================

  // Create a manual time entry (with anti-abuse checks)
  createManual: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        milestoneId: z.string().optional(),
        description: z.string().min(1, "Description is required for manual entries"),
        date: z.date(),
        duration: z.number().min(60, "Minimum 1 minute"), // in seconds
        billable: z.boolean().default(true),
        hourlyRate: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user settings
      const settings = await ctx.db.query.timeTrackingSettings.findFirst({
        where: eq(timeTrackingSettings.userId, ctx.user.id),
      });

      // ANTI-ABUSE: Check retroactive limit
      const maxRetroactiveDays = settings?.maxRetroactiveDays ?? 7;
      const earliestAllowed = new Date();
      earliestAllowed.setDate(earliestAllowed.getDate() - maxRetroactiveDays);
      earliestAllowed.setHours(0, 0, 0, 0);

      if (input.date < earliestAllowed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot add entries more than ${maxRetroactiveDays} days in the past. Earliest allowed: ${earliestAllowed.toLocaleDateString()}`,
        });
      }

      // ANTI-ABUSE: No future entries
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      if (input.date >= tomorrow) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot add time entries for future dates",
        });
      }

      // Verify project if provided
      if (input.projectId) {
        const project = await ctx.db.query.projects.findFirst({
          where: eq(projects.id, input.projectId),
        });
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
        }
      }

      // Calculate start/end times (set to middle of the day for manual entries)
      const startTime = new Date(input.date);
      startTime.setHours(9, 0, 0, 0); // Default to 9 AM
      
      const endTime = new Date(startTime.getTime() + input.duration * 1000);

      // ANTI-ABUSE: Check for overlapping entries (if not allowed)
      if (!settings?.allowOverlapping) {
        const overlapping = await ctx.db.query.timeEntries.findFirst({
          where: and(
            eq(timeEntries.userId, ctx.user.id),
            or(
              // New entry starts during existing entry
              and(
                lte(timeEntries.startTime, startTime),
                gt(timeEntries.endTime, startTime)
              ),
              // New entry ends during existing entry
              and(
                lt(timeEntries.startTime, endTime),
                gte(timeEntries.endTime, endTime)
              ),
              // New entry completely contains existing entry
              and(
                gte(timeEntries.startTime, startTime),
                lte(timeEntries.endTime, endTime)
              )
            )
          ),
        });

        if (overlapping) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This time entry overlaps with an existing entry. Check your timesheet.",
          });
        }
      }

      // ANTI-ABUSE: Daily hour warning
      const dayStart = new Date(input.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(input.date);
      dayEnd.setHours(23, 59, 59, 999);

      const existingToday = await ctx.db
        .select({ totalDuration: sql<number>`COALESCE(SUM(duration), 0)` })
        .from(timeEntries)
        .where(
          and(
            eq(timeEntries.userId, ctx.user.id),
            gte(timeEntries.startTime, dayStart),
            lte(timeEntries.startTime, dayEnd)
          )
        );

      const totalTodaySeconds = Number(existingToday[0]?.totalDuration || 0) + input.duration;
      const totalTodayMinutes = totalTodaySeconds / 60;
      const warningThreshold = settings?.dailyHourWarning || 720;

      let warning: string | undefined;
      if (totalTodayMinutes > warningThreshold) {
        warning = `Note: This brings your total for ${input.date.toLocaleDateString()} to ${formatDuration(totalTodaySeconds)}, which exceeds ${formatDuration(warningThreshold * 60)}.`;
      }

      const [entry] = await ctx.db
        .insert(timeEntries)
        .values({
          userId: ctx.user.id,
          projectId: input.projectId,
          milestoneId: input.milestoneId,
          description: input.description,
          startTime,
          endTime,
          duration: input.duration,
          billable: input.billable,
          hourlyRate: input.hourlyRate || settings?.defaultHourlyRate,
          entryType: "manual", // CLEARLY MARKED AS MANUAL
          originalStartTime: startTime,
          originalEndTime: endTime,
          originalDuration: input.duration,
        })
        .returning();

      return { entry, warning };
    }),

  // ============================================
  // ENTRY MANAGEMENT
  // ============================================

  // List time entries with filters
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        milestoneId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        billable: z.boolean().optional(),
        invoiced: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(timeEntries.userId, ctx.user.id)];

      if (input?.projectId) {
        conditions.push(eq(timeEntries.projectId, input.projectId));
      }
      if (input?.milestoneId) {
        conditions.push(eq(timeEntries.milestoneId, input.milestoneId));
      }
      if (input?.startDate) {
        conditions.push(gte(timeEntries.startTime, input.startDate));
      }
      if (input?.endDate) {
        const endOfDay = new Date(input.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        conditions.push(lte(timeEntries.startTime, endOfDay));
      }
      if (input?.billable !== undefined) {
        conditions.push(eq(timeEntries.billable, input.billable));
      }
      if (input?.invoiced === true) {
        conditions.push(sql`${timeEntries.invoiceId} IS NOT NULL`);
      } else if (input?.invoiced === false) {
        conditions.push(isNull(timeEntries.invoiceId));
      }

      const entries = await ctx.db.query.timeEntries.findMany({
        where: and(...conditions),
        with: {
          project: true,
          milestone: true,
          invoice: true,
        },
        orderBy: [desc(timeEntries.startTime)],
        limit: input?.limit || 50,
        offset: input?.offset || 0,
      });

      // Calculate totals
      const totals = await ctx.db
        .select({
          totalDuration: sql<number>`COALESCE(SUM(duration), 0)`,
          totalBillable: sql<number>`COALESCE(SUM(CASE WHEN billable THEN duration ELSE 0 END), 0)`,
          totalEarnings: sql<number>`COALESCE(SUM(CASE WHEN billable AND hourly_rate IS NOT NULL THEN (duration / 3600.0) * hourly_rate ELSE 0 END), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(timeEntries)
        .where(and(...conditions));

      return {
        entries: entries.map((e) => ({
          ...e,
          formattedDuration: e.duration ? formatDuration(e.duration) : null,
          isLocked: !!e.lockedAt,
          isManual: e.entryType === "manual",
          isRunning: !e.endTime,
        })),
        totals: {
          totalDuration: Number(totals[0]?.totalDuration || 0),
          totalBillable: Number(totals[0]?.totalBillable || 0),
          totalEarnings: Number(totals[0]?.totalEarnings || 0),
          count: Number(totals[0]?.count || 0),
          formattedTotal: formatDuration(Number(totals[0]?.totalDuration || 0)),
          formattedBillable: formatDuration(Number(totals[0]?.totalBillable || 0)),
        },
      };
    }),

  // Get single entry with full audit trail
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const entry = await ctx.db.query.timeEntries.findFirst({
        where: eq(timeEntries.id, input.id),
        with: {
          project: true,
          milestone: true,
          invoice: true,
        },
      });

      if (!entry || entry.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Time entry not found" });
      }

      return {
        ...entry,
        formattedDuration: entry.duration ? formatDuration(entry.duration) : null,
        isLocked: !!entry.lockedAt,
        isManual: entry.entryType === "manual",
        hasBeenEdited: (entry.editHistory as TimeEntryEdit[] || []).length > 0,
      };
    }),

  // Update a time entry (with audit trail)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().optional(),
        projectId: z.string().nullable().optional(),
        milestoneId: z.string().nullable().optional(),
        duration: z.number().min(60).optional(),
        billable: z.boolean().optional(),
        hourlyRate: z.number().optional(),
        editReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.query.timeEntries.findFirst({
        where: eq(timeEntries.id, input.id),
      });

      if (!entry || entry.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Time entry not found" });
      }

      // ANTI-ABUSE: Cannot edit locked entries
      if (entry.lockedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `This entry is locked (${entry.lockedReason || "invoiced"}) and cannot be edited.`,
        });
      }

      // ANTI-ABUSE: Cannot edit running timers (stop first)
      if (!entry.endTime) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stop the timer before editing",
        });
      }

      // Build edit history
      let editHistory = entry.editHistory as TimeEntryEdit[] || [];
      const { id, editReason, ...updates } = input;

      if (updates.description !== undefined && updates.description !== entry.description) {
        editHistory = addEditHistory(editHistory, "description", entry.description, updates.description, editReason);
      }
      if (updates.duration !== undefined && updates.duration !== entry.duration) {
        editHistory = addEditHistory(editHistory, "duration", entry.duration, updates.duration, editReason);
      }
      if (updates.billable !== undefined && updates.billable !== entry.billable) {
        editHistory = addEditHistory(editHistory, "billable", entry.billable ? "yes" : "no", updates.billable ? "yes" : "no", editReason);
      }
      if (updates.hourlyRate !== undefined && updates.hourlyRate !== entry.hourlyRate) {
        editHistory = addEditHistory(editHistory, "hourlyRate", entry.hourlyRate, updates.hourlyRate, editReason);
      }

      // Calculate new end time if duration changed
      let newEndTime = entry.endTime;
      if (updates.duration && updates.duration !== entry.duration) {
        newEndTime = new Date(entry.startTime.getTime() + updates.duration * 1000);
      }

      const [updated] = await ctx.db
        .update(timeEntries)
        .set({
          ...updates,
          endTime: newEndTime,
          editHistory,
          updatedAt: new Date(),
        })
        .where(eq(timeEntries.id, input.id))
        .returning();

      return updated;
    }),

  // Delete a time entry
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.query.timeEntries.findFirst({
        where: eq(timeEntries.id, input.id),
      });

      if (!entry || entry.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Time entry not found" });
      }

      // ANTI-ABUSE: Cannot delete locked entries
      if (entry.lockedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete locked/invoiced time entries",
        });
      }

      await ctx.db.delete(timeEntries).where(eq(timeEntries.id, input.id));

      return { success: true };
    }),

  // ============================================
  // TIMESHEET / REPORTS
  // ============================================

  // Get weekly timesheet
  getWeeklyTimesheet: protectedProcedure
    .input(
      z.object({
        weekStart: z.date(), // Monday of the week
      })
    )
    .query(async ({ ctx, input }) => {
      const weekEnd = new Date(input.weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const entries = await ctx.db.query.timeEntries.findMany({
        where: and(
          eq(timeEntries.userId, ctx.user.id),
          gte(timeEntries.startTime, input.weekStart),
          lt(timeEntries.startTime, weekEnd)
        ),
        with: {
          project: true,
        },
        orderBy: [timeEntries.startTime],
      });

      // Group by day and project
      const days: Record<string, {
        date: string;
        entries: typeof entries;
        totalSeconds: number;
        billableSeconds: number;
      }> = {};

      for (let i = 0; i < 7; i++) {
        const date = new Date(input.weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        days[dateStr] = {
          date: dateStr,
          entries: [],
          totalSeconds: 0,
          billableSeconds: 0,
        };
      }

      for (const entry of entries) {
        const dateStr = entry.startTime.toISOString().split("T")[0];
        if (days[dateStr]) {
          days[dateStr].entries.push(entry);
          days[dateStr].totalSeconds += entry.duration || 0;
          if (entry.billable) {
            days[dateStr].billableSeconds += entry.duration || 0;
          }
        }
      }

      // Calculate week totals
      const weekTotals = {
        totalSeconds: entries.reduce((sum, e) => sum + (e.duration || 0), 0),
        billableSeconds: entries.filter((e) => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0),
        entryCount: entries.length,
        manualCount: entries.filter((e) => e.entryType === "manual").length,
      };

      return {
        weekStart: input.weekStart,
        days: Object.values(days).map((day) => ({
          ...day,
          formattedTotal: formatDuration(day.totalSeconds),
          formattedBillable: formatDuration(day.billableSeconds),
        })),
        totals: {
          ...weekTotals,
          formattedTotal: formatDuration(weekTotals.totalSeconds),
          formattedBillable: formatDuration(weekTotals.billableSeconds),
        },
      };
    }),

  // Get summary stats for dashboard
  getStats: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const endOfDay = new Date(input.endDate);
      endOfDay.setHours(23, 59, 59, 999);

      const stats = await ctx.db
        .select({
          totalDuration: sql<number>`COALESCE(SUM(duration), 0)`,
          billableDuration: sql<number>`COALESCE(SUM(CASE WHEN billable THEN duration ELSE 0 END), 0)`,
          totalEarnings: sql<number>`COALESCE(SUM(CASE WHEN billable AND hourly_rate IS NOT NULL THEN (duration / 3600.0) * hourly_rate ELSE 0 END), 0)`,
          entryCount: sql<number>`COUNT(*)`,
          projectCount: sql<number>`COUNT(DISTINCT project_id)`,
          trackedCount: sql<number>`COUNT(CASE WHEN entry_type = 'tracked' THEN 1 END)`,
          manualCount: sql<number>`COUNT(CASE WHEN entry_type = 'manual' THEN 1 END)`,
        })
        .from(timeEntries)
        .where(
          and(
            eq(timeEntries.userId, ctx.user.id),
            gte(timeEntries.startTime, input.startDate),
            lte(timeEntries.startTime, endOfDay)
          )
        );

      return {
        totalDuration: Number(stats[0]?.totalDuration || 0),
        billableDuration: Number(stats[0]?.billableDuration || 0),
        totalEarnings: Math.round(Number(stats[0]?.totalEarnings || 0)),
        entryCount: Number(stats[0]?.entryCount || 0),
        projectCount: Number(stats[0]?.projectCount || 0),
        trackedCount: Number(stats[0]?.trackedCount || 0),
        manualCount: Number(stats[0]?.manualCount || 0),
        formattedTotal: formatDuration(Number(stats[0]?.totalDuration || 0)),
        formattedBillable: formatDuration(Number(stats[0]?.billableDuration || 0)),
      };
    }),

  // ============================================
  // INVOICING INTEGRATION
  // ============================================

  // Get uninvoiced time for a project/client
  getUninvoicedTime: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        clientId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let projectIds: string[] = [];

      if (input.projectId) {
        projectIds = [input.projectId];
      } else if (input.clientId) {
        const clientProjects = await ctx.db.query.projects.findMany({
          where: and(
            eq(projects.userId, ctx.user.id),
            eq(projects.clientId, input.clientId)
          ),
        });
        projectIds = clientProjects.map((p) => p.id);
      }

      if (projectIds.length === 0 && (input.projectId || input.clientId)) {
        return { entries: [], totals: { totalSeconds: 0, totalEarnings: 0 } };
      }

      const conditions = [
        eq(timeEntries.userId, ctx.user.id),
        eq(timeEntries.billable, true),
        isNull(timeEntries.invoiceId),
        sql`${timeEntries.endTime} IS NOT NULL`, // Only completed entries
      ];

      if (projectIds.length > 0) {
        conditions.push(sql`${timeEntries.projectId} IN ${projectIds}`);
      }

      const entries = await ctx.db.query.timeEntries.findMany({
        where: and(...conditions),
        with: {
          project: true,
        },
        orderBy: [desc(timeEntries.startTime)],
      });

      const totalSeconds = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
      const totalEarnings = entries.reduce((sum, e) => {
        if (e.hourlyRate) {
          return sum + ((e.duration || 0) / 3600) * e.hourlyRate;
        }
        return sum;
      }, 0);

      return {
        entries: entries.map((e) => ({
          ...e,
          formattedDuration: e.duration ? formatDuration(e.duration) : null,
        })),
        totals: {
          totalSeconds,
          totalEarnings: Math.round(totalEarnings),
          formattedTotal: formatDuration(totalSeconds),
        },
      };
    }),

  // Mark entries as invoiced (locks them)
  markAsInvoiced: protectedProcedure
    .input(
      z.object({
        entryIds: z.array(z.string()),
        invoiceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all entries belong to user
      const entries = await ctx.db.query.timeEntries.findMany({
        where: and(
          eq(timeEntries.userId, ctx.user.id),
          sql`${timeEntries.id} IN ${input.entryIds}`
        ),
      });

      if (entries.length !== input.entryIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Some entries not found or access denied",
        });
      }

      // Check none are already invoiced
      const alreadyInvoiced = entries.filter((e) => e.invoiceId);
      if (alreadyInvoiced.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${alreadyInvoiced.length} entries are already invoiced`,
        });
      }

      // Update entries
      await ctx.db
        .update(timeEntries)
        .set({
          invoiceId: input.invoiceId,
          lockedAt: new Date(),
          lockedReason: "invoiced",
          updatedAt: new Date(),
        })
        .where(sql`${timeEntries.id} IN ${input.entryIds}`);

      return { success: true, count: input.entryIds.length };
    }),

  // ============================================
  // SETTINGS
  // ============================================

  // Get user's time tracking settings
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    let settings = await ctx.db.query.timeTrackingSettings.findFirst({
      where: eq(timeTrackingSettings.userId, ctx.user.id),
    });

    // Create default settings if none exist
    if (!settings) {
      const [newSettings] = await ctx.db
        .insert(timeTrackingSettings)
        .values({
          userId: ctx.user.id,
        })
        .returning();
      settings = newSettings;
    }

    return settings;
  }),

  // Update time tracking settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        defaultHourlyRate: z.number().min(0).optional(),
        maxRetroactiveDays: z.number().min(0).max(365).optional(),
        dailyHourWarning: z.number().min(60).max(1440).optional(),
        idleTimeoutMinutes: z.number().min(0).max(120).optional(),
        roundToMinutes: z.number().min(0).max(60).optional(),
        minimumEntryMinutes: z.number().min(1).max(30).optional(),
        allowOverlapping: z.boolean().optional(),
        clientVisibleLogs: z.boolean().optional(),
        requireDescription: z.boolean().optional(),
        autoStopAtMidnight: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create settings
      let settings = await ctx.db.query.timeTrackingSettings.findFirst({
        where: eq(timeTrackingSettings.userId, ctx.user.id),
      });

      if (!settings) {
        const [newSettings] = await ctx.db
          .insert(timeTrackingSettings)
          .values({
            userId: ctx.user.id,
            ...input,
          })
          .returning();
        return newSettings;
      }

      const [updated] = await ctx.db
        .update(timeTrackingSettings)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(timeTrackingSettings.userId, ctx.user.id))
        .returning();

      return updated;
    }),

  // ============================================
  // PUBLIC ENDPOINTS (for client portal)
  // ============================================

  // Get time entries visible to client
  getClientVisible: publicProcedure
    .input(
      z.object({
        projectPublicId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Find project by public ID
      const project = await ctx.db.query.projects.findFirst({
        where: eq(projects.publicId, input.projectPublicId),
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      // Check if user has client-visible logs enabled
      const settings = await ctx.db.query.timeTrackingSettings.findFirst({
        where: eq(timeTrackingSettings.userId, project.userId),
      });

      if (!settings?.clientVisibleLogs) {
        return { entries: [], enabled: false };
      }

      // Get completed, billable entries for this project
      const entries = await ctx.db.query.timeEntries.findMany({
        where: and(
          eq(timeEntries.projectId, project.id),
          eq(timeEntries.billable, true),
          sql`${timeEntries.endTime} IS NOT NULL`
        ),
        orderBy: [desc(timeEntries.startTime)],
      });

      return {
        entries: entries.map((e) => ({
          id: e.id,
          date: e.startTime,
          description: e.description,
          duration: e.duration,
          formattedDuration: e.duration ? formatDuration(e.duration) : null,
          entryType: e.entryType,
        })),
        enabled: true,
        totalSeconds: entries.reduce((sum, e) => sum + (e.duration || 0), 0),
      };
    }),
});