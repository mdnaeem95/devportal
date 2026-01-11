import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createConnectAccount,
  createConnectOnboardingLink,
  createConnectDashboardLink,
  getConnectAccountStatus,
  getConnectBalance,
} from "@/lib/stripe";

export const stripeRouter = router({
  // Get current Stripe Connect status
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (!user.stripeAccountId) {
      return {
        connected: false,
        accountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      };
    }

    try {
      const status = await getConnectAccountStatus(user.stripeAccountId);
      
      // Update local status if it changed
      const isFullyConnected = status.chargesEnabled && status.payoutsEnabled;
      if (user.stripeConnected !== isFullyConnected) {
        await ctx.db
          .update(users)
          .set({ stripeConnected: isFullyConnected, updatedAt: new Date() })
          .where(eq(users.id, ctx.user.id));
      }

      return {
        connected: isFullyConnected,
        accountId: status.id,
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        detailsSubmitted: status.detailsSubmitted,
        requirements: status.requirements,
      };
    } catch (error) {
      console.error("[Stripe] Error getting account status:", error);
      return {
        connected: false,
        accountId: user.stripeAccountId,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        error: "Failed to fetch Stripe status",
      };
    }
  }),

  // Create or get onboarding link
  getOnboardingLink: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const returnUrl = `${baseUrl}/dashboard/settings?tab=payments&stripe=success`;
    const refreshUrl = `${baseUrl}/dashboard/settings?tab=payments&stripe=refresh`;

    let accountId = user.stripeAccountId;

    // Create account if doesn't exist
    if (!accountId) {
      try {
        const account = await createConnectAccount({
          userId: ctx.user.id,
          email: user.email,
          businessName: user.businessName || undefined,
        });

        accountId = account.id;

        // Save account ID
        await ctx.db
          .update(users)
          .set({ stripeAccountId: accountId, updatedAt: new Date() })
          .where(eq(users.id, ctx.user.id));
      } catch (error) {
        console.error("[Stripe] Error creating account:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe account",
        });
      }
    }

    // Generate onboarding link
    try {
      const url = await createConnectOnboardingLink(accountId, returnUrl, refreshUrl);
      return { url };
    } catch (error) {
      console.error("[Stripe] Error creating onboarding link:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create onboarding link",
      });
    }
  }),

  // Get dashboard link (for connected accounts)
  getDashboardLink: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user?.stripeAccountId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Stripe account not connected",
      });
    }

    try {
      const url = await createConnectDashboardLink(user.stripeAccountId);
      return { url };
    } catch (error) {
      console.error("[Stripe] Error creating dashboard link:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create dashboard link",
      });
    }
  }),

  // Get balance (for connected accounts)
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user?.stripeAccountId || !user.stripeConnected) {
      return null;
    }

    try {
      const balance = await getConnectBalance(user.stripeAccountId);
      return balance;
    } catch (error) {
      console.error("[Stripe] Error getting balance:", error);
      return null;
    }
  }),

  // Disconnect Stripe (just clears the local reference)
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(users)
      .set({
        stripeAccountId: null,
        stripeConnected: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.user.id));

    return { success: true };
  }),
});