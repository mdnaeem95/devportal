import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getPresignedUploadUrl, deleteFile, getKeyFromUrl } from "@/lib/storage";

// Validation schema for settings update
const updateSettingsSchema = z.object({
  businessName: z.string().max(100).optional().nullable(),
  businessAddress: z.string().max(500).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
  currency: z.enum(["USD", "EUR", "GBP", "SGD", "AUD", "CAD"]).optional(),
});

const updateNotificationsSchema = z.object({
  emailInvoicePaid: z.boolean(),
  emailContractSigned: z.boolean(),
  emailWeeklyDigest: z.boolean(),
});

export const settingsRouter = router({
  // Get current user settings
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return {
      businessName: user.businessName,
      businessAddress: user.businessAddress,
      taxId: user.taxId,
      currency: user.currency || "USD",
      logoUrl: user.logoUrl,
      stripeConnected: user.stripeConnected || false,
      // Notification preferences - these could be in a separate table
      // For now, return defaults (you can add these columns to users table later)
      notifications: {
        emailInvoicePaid: true,
        emailContractSigned: true,
        emailWeeklyDigest: false,
      },
    };
  }),

  // Update business settings
  update: protectedProcedure
    .input(updateSettingsSchema)
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

  // Generate presigned URL for logo upload
  getLogoUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate content type is an image
      if (!input.contentType.startsWith("image/")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File must be an image",
        });
      }

      // Generate unique key for the logo
      const timestamp = Date.now();
      const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const key = `logos/${ctx.user.id}/${timestamp}-${sanitizedFileName}`;

      // Get presigned URL for direct upload to R2
      const { uploadUrl, fileUrl } = await getPresignedUploadUrl({
        key,
        contentType: input.contentType,
        expiresIn: 3600, // 1 hour
      });

      return {
        uploadUrl,
        fileUrl,
        key,
      };
    }),

  // Update logo URL (called after successful upload)
  updateLogo: protectedProcedure
    .input(z.object({ logoUrl: z.string().url().nullable() }))
    .mutation(async ({ ctx, input }) => {
      // Get current user to check for existing logo
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      // Delete old logo from R2 if exists and we're replacing it
      if (currentUser?.logoUrl && input.logoUrl !== currentUser.logoUrl) {
        const oldKey = getKeyFromUrl(currentUser.logoUrl);
        if (oldKey) {
          try {
            await deleteFile(oldKey);
          } catch (error) {
            console.error("[Settings] Failed to delete old logo:", error);
            // Continue anyway - don't block the update
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

  // Update notification preferences
  // Note: For MVP, these could just be stored in localStorage
  // or you can add columns to the users table
  updateNotifications: protectedProcedure
    .input(updateNotificationsSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Add notification preference columns to users table
      // For now, just return success
      console.log("[Settings] Notification preferences:", input);
      return { success: true };
    }),
});