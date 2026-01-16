import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { users, clients, projects, invoices, contracts, timeEntries, milestones } from "../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getPresignedUploadUrl, deleteFile, getKeyFromUrl } from "@/lib/storage";

// ========== Validation Schemas ==========

const updateBusinessSchema = z.object({
  businessName: z.string().max(100).optional().nullable(),
  businessAddress: z.string().max(500).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
  currency: z.enum(["USD", "EUR", "GBP", "SGD", "AUD", "CAD"]).optional(),
});

const updateInvoiceDefaultsSchema = z.object({
  defaultPaymentTerms: z.number().min(1).max(90).optional(),
  defaultTaxRate: z.number().min(0).max(50).optional().nullable(),
  invoicePrefix: z.string().max(10).optional(),
  invoiceNotes: z.string().max(1000).optional().nullable(),
  defaultAllowPartialPayments: z.boolean().optional(),
  defaultMinimumPaymentPercent: z.number().min(10).max(90).optional().nullable(),
});

const updateContractDefaultsSchema = z.object({
  defaultContractExpiryDays: z.number().min(7).max(90).optional(),
  contractAutoRemind: z.boolean().optional(),
  contractSequentialSigning: z.boolean().optional(),
});

const updateTimeTrackingSchema = z.object({
  defaultHourlyRate: z.number().min(0).optional().nullable(), // In cents
  maxRetroactiveDays: z.number().min(0).max(30).optional(),
  dailyHourWarning: z.number().min(60).max(1440).optional(), // 1-24 hours in minutes
  idleTimeoutMinutes: z.number().min(5).max(120).optional(),
  roundToMinutes: z.number().min(0).max(60).optional(),
  minimumEntryMinutes: z.number().min(1).max(60).optional(),
  allowOverlapping: z.boolean().optional(),
  clientVisibleLogs: z.boolean().optional(),
  requireDescription: z.boolean().optional(),
  autoStopAtMidnight: z.boolean().optional(),
});

const updateClientPortalSchema = z.object({
  defaultPortalPasswordProtected: z.boolean().optional(),
  defaultShowTimeLogs: z.boolean().optional(),
});

const updateNotificationsSchema = z.object({
  emailInvoicePaid: z.boolean(),
  emailContractSigned: z.boolean(),
  emailWeeklyDigest: z.boolean(),
  emailPaymentReminders: z.boolean(),
  emailContractReminders: z.boolean(),
  emailMilestonesDue: z.boolean(),
});

// ========== Router ==========

export const settingsRouter = router({
  // ========== Get All Settings ==========
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return {
      // Business
      businessName: user.businessName,
      businessAddress: user.businessAddress,
      taxId: user.taxId,
      currency: user.currency || "USD",
      logoUrl: user.logoUrl,
      
      // Stripe
      stripeConnected: user.stripeConnected || false,
      
      // Invoice Defaults
      invoiceDefaults: {
        paymentTerms: user.defaultPaymentTerms ?? 14,
        taxRate: user.defaultTaxRate ? parseFloat(user.defaultTaxRate) : null,
        prefix: user.invoicePrefix || "INV",
        notes: user.invoiceNotes,
        allowPartialPayments: user.defaultAllowPartialPayments ?? false,
        minimumPaymentPercent: user.defaultMinimumPaymentPercent,
      },
      
      // Contract Defaults
      contractDefaults: {
        expiryDays: user.defaultContractExpiryDays ?? 30,
        autoRemind: user.contractAutoRemind ?? true,
        sequentialSigning: user.contractSequentialSigning ?? true,
      },
      
      // Time Tracking
      timeTracking: {
        defaultHourlyRate: user.defaultHourlyRate,
        maxRetroactiveDays: user.maxRetroactiveDays ?? 7,
        dailyHourWarning: user.dailyHourWarning ?? 720,
        idleTimeoutMinutes: user.idleTimeoutMinutes ?? 30,
        roundToMinutes: user.roundToMinutes ?? 0,
        minimumEntryMinutes: user.minimumEntryMinutes ?? 1,
        allowOverlapping: user.allowOverlapping ?? false,
        clientVisibleLogs: user.clientVisibleLogs ?? true,
        requireDescription: user.requireDescription ?? false,
        autoStopAtMidnight: user.autoStopAtMidnight ?? true,
      },
      
      // Client Portal
      clientPortal: {
        defaultPasswordProtected: user.defaultPortalPasswordProtected ?? false,
        defaultShowTimeLogs: user.defaultShowTimeLogs ?? true,
      },
      
      // Notifications
      notifications: {
        emailInvoicePaid: user.emailInvoicePaid ?? true,
        emailContractSigned: user.emailContractSigned ?? true,
        emailWeeklyDigest: user.emailWeeklyDigest ?? false,
        emailPaymentReminders: user.emailPaymentReminders ?? true,
        emailContractReminders: user.emailContractReminders ?? true,
        emailMilestonesDue: user.emailMilestonesDue ?? true,
      },
    };
  }),

  // ========== Update Business Settings ==========
  updateBusiness: protectedProcedure
    .input(updateBusinessSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.businessName !== undefined) {
        updateData.businessName = input.businessName || null;
      }
      if (input.businessAddress !== undefined) {
        updateData.businessAddress = input.businessAddress || null;
      }
      if (input.taxId !== undefined) {
        updateData.taxId = input.taxId || null;
      }
      if (input.currency !== undefined) {
        updateData.currency = input.currency;
      }

      const [updated] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return { success: true };
    }),

  // ========== Update Invoice Defaults ==========
  updateInvoiceDefaults: protectedProcedure
    .input(updateInvoiceDefaultsSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.defaultPaymentTerms !== undefined) {
        updateData.defaultPaymentTerms = input.defaultPaymentTerms;
      }
      if (input.defaultTaxRate !== undefined) {
        updateData.defaultTaxRate = input.defaultTaxRate?.toString() || null;
      }
      if (input.invoicePrefix !== undefined) {
        updateData.invoicePrefix = input.invoicePrefix;
      }
      if (input.invoiceNotes !== undefined) {
        updateData.invoiceNotes = input.invoiceNotes || null;
      }
      if (input.defaultAllowPartialPayments !== undefined) {
        updateData.defaultAllowPartialPayments = input.defaultAllowPartialPayments;
      }
      if (input.defaultMinimumPaymentPercent !== undefined) {
        updateData.defaultMinimumPaymentPercent = input.defaultMinimumPaymentPercent;
      }

      const [updated] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return { success: true };
    }),

  // ========== Update Contract Defaults ==========
  updateContractDefaults: protectedProcedure
    .input(updateContractDefaultsSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.defaultContractExpiryDays !== undefined) {
        updateData.defaultContractExpiryDays = input.defaultContractExpiryDays;
      }
      if (input.contractAutoRemind !== undefined) {
        updateData.contractAutoRemind = input.contractAutoRemind;
      }
      if (input.contractSequentialSigning !== undefined) {
        updateData.contractSequentialSigning = input.contractSequentialSigning;
      }

      const [updated] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return { success: true };
    }),

  // ========== Update Time Tracking Settings ==========
  updateTimeTracking: protectedProcedure
    .input(updateTimeTrackingSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.defaultHourlyRate !== undefined) {
        updateData.defaultHourlyRate = input.defaultHourlyRate;
      }
      if (input.maxRetroactiveDays !== undefined) {
        updateData.maxRetroactiveDays = input.maxRetroactiveDays;
      }
      if (input.dailyHourWarning !== undefined) {
        updateData.dailyHourWarning = input.dailyHourWarning;
      }
      if (input.idleTimeoutMinutes !== undefined) {
        updateData.idleTimeoutMinutes = input.idleTimeoutMinutes;
      }
      if (input.roundToMinutes !== undefined) {
        updateData.roundToMinutes = input.roundToMinutes;
      }
      if (input.minimumEntryMinutes !== undefined) {
        updateData.minimumEntryMinutes = input.minimumEntryMinutes;
      }
      if (input.allowOverlapping !== undefined) {
        updateData.allowOverlapping = input.allowOverlapping;
      }
      if (input.clientVisibleLogs !== undefined) {
        updateData.clientVisibleLogs = input.clientVisibleLogs;
      }
      if (input.requireDescription !== undefined) {
        updateData.requireDescription = input.requireDescription;
      }
      if (input.autoStopAtMidnight !== undefined) {
        updateData.autoStopAtMidnight = input.autoStopAtMidnight;
      }

      const [updated] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return { success: true };
    }),

  // ========== Update Client Portal Settings ==========
  updateClientPortal: protectedProcedure
    .input(updateClientPortalSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.defaultPortalPasswordProtected !== undefined) {
        updateData.defaultPortalPasswordProtected = input.defaultPortalPasswordProtected;
      }
      if (input.defaultShowTimeLogs !== undefined) {
        updateData.defaultShowTimeLogs = input.defaultShowTimeLogs;
      }

      const [updated] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return { success: true };
    }),

  // ========== Update Notifications ==========
  updateNotifications: protectedProcedure
    .input(updateNotificationsSchema)
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(users)
        .set({
          emailInvoicePaid: input.emailInvoicePaid,
          emailContractSigned: input.emailContractSigned,
          emailWeeklyDigest: input.emailWeeklyDigest,
          emailPaymentReminders: input.emailPaymentReminders,
          emailContractReminders: input.emailContractReminders,
          emailMilestonesDue: input.emailMilestonesDue,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return { success: true };
    }),

  // ========== Logo Upload ==========
  getLogoUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.contentType.startsWith("image/")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File must be an image",
        });
      }

      const timestamp = Date.now();
      const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const key = `logos/${ctx.user.id}/${timestamp}-${sanitizedFileName}`;

      const { uploadUrl, fileUrl } = await getPresignedUploadUrl({
        key,
        contentType: input.contentType,
        expiresIn: 3600,
      });

      return { uploadUrl, fileUrl, key };
    }),

  updateLogo: protectedProcedure
    .input(z.object({ logoUrl: z.string().url().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      // Delete old logo from R2 if replacing
      if (currentUser?.logoUrl && input.logoUrl !== currentUser.logoUrl) {
        const oldKey = getKeyFromUrl(currentUser.logoUrl);
        if (oldKey) {
          try {
            await deleteFile(oldKey);
          } catch (error) {
            console.error("[Settings] Failed to delete old logo:", error);
          }
        }
      }

      const [updated] = await ctx.db
        .update(users)
        .set({
          logoUrl: input.logoUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return { logoUrl: updated.logoUrl };
    }),

  // ========== Data Export ==========
  exportData: protectedProcedure.mutation(async ({ ctx }) => {
    // Fetch all user data
    const [userClients, userProjects, userInvoices, userContracts, userTimeEntries] = await Promise.all([
      ctx.db.query.clients.findMany({
        where: eq(clients.userId, ctx.user.id),
      }),
      ctx.db.query.projects.findMany({
        where: eq(projects.userId, ctx.user.id),
        with: { milestones: true },
      }),
      ctx.db.query.invoices.findMany({
        where: eq(invoices.userId, ctx.user.id),
      }),
      ctx.db.query.contracts.findMany({
        where: eq(contracts.userId, ctx.user.id),
      }),
      ctx.db.query.timeEntries.findMany({
        where: eq(timeEntries.userId, ctx.user.id),
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      clients: userClients,
      projects: userProjects,
      invoices: userInvoices,
      contracts: userContracts,
      timeEntries: userTimeEntries,
    };
  }),

  // ========== Delete Account ==========
  deleteAccount: protectedProcedure
    .input(z.object({ confirmation: z.literal("DELETE MY ACCOUNT") }))
    .mutation(async ({ ctx }) => {
      // This will cascade delete all related data due to foreign key constraints
      await ctx.db.delete(users).where(eq(users.id, ctx.user.id));
      
      // Note: You may also want to:
      // 1. Delete user from Clerk
      // 2. Disconnect Stripe account
      // 3. Delete files from R2
      
      return { success: true };
    }),

  // ========== Legacy update method (for backward compatibility) ==========
  update: protectedProcedure
    .input(updateBusinessSchema)
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.businessName !== undefined) {
        updateData.businessName = input.businessName || null;
      }
      if (input.businessAddress !== undefined) {
        updateData.businessAddress = input.businessAddress || null;
      }
      if (input.taxId !== undefined) {
        updateData.taxId = input.taxId || null;
      }
      if (input.currency !== undefined) {
        updateData.currency = input.currency;
      }

      const [updated] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id))
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return {
        businessName: updated.businessName,
        businessAddress: updated.businessAddress,
        taxId: updated.taxId,
        currency: updated.currency,
      };
    }),
});