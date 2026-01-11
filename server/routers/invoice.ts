import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { invoices, clients, projects, milestones } from "../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0), // in cents
  amount: z.number(), // quantity * unitPrice
});

export const invoiceRouter = router({
  // List all invoices for the current user
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        clientId: z.string().optional(),
        status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(invoices.userId, ctx.user.id)];

      if (input?.projectId) {
        conditions.push(eq(invoices.projectId, input.projectId));
      }
      if (input?.clientId) {
        conditions.push(eq(invoices.clientId, input.clientId));
      }
      if (input?.status) {
        conditions.push(eq(invoices.status, input.status));
      }

      return ctx.db.query.invoices.findMany({
        where: and(...conditions),
        with: {
          client: true,
          project: {
            columns: { id: true, name: true },
          },
        },
        orderBy: [desc(invoices.createdAt)],
      });
    }),

  // Get a single invoice by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: {
          client: true,
          project: {
            columns: { id: true, name: true },
          },
          milestone: true,
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      if (invoice.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this invoice",
        });
      }

      // Get user info for invoice display
      const user = ctx.user;

      return { ...invoice, user };
    }),

  // Generate next invoice number
  getNextNumber: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.userId, ctx.user.id));

    const count = Number(result[0]?.count ?? 0);
    return `INV-${String(count + 1).padStart(4, "0")}`;
  }),

  // Create a new invoice
  create: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        projectId: z.string().optional(),
        milestoneId: z.string().optional(),
        invoiceNumber: z.string(),
        lineItems: z.array(lineItemSchema),
        taxRate: z.number().min(0).max(100).optional(),
        dueDate: z.date(),
        notes: z.string().optional(),
        currency: z.string().default("USD"),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      // Calculate totals
      const subtotal = input.lineItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = input.taxRate ? Math.round(subtotal * (input.taxRate / 100)) : 0;
      const total = subtotal + taxAmount;

      const [invoice] = await ctx.db
        .insert(invoices)
        .values({
          userId: ctx.user.id,
          clientId: input.clientId,
          projectId: input.projectId,
          milestoneId: input.milestoneId,
          invoiceNumber: input.invoiceNumber,
          lineItems: input.lineItems,
          subtotal,
          tax: taxAmount,
          taxRate: input.taxRate?.toString(),
          total,
          currency: input.currency,
          dueDate: input.dueDate,
          notes: input.notes,
        })
        .returning();

      // Update milestone status if linked
      if (input.milestoneId) {
        await ctx.db
          .update(milestones)
          .set({ status: "invoiced" })
          .where(eq(milestones.id, input.milestoneId));
      }

      return invoice;
    }),

  // Create invoice from milestone
  createFromMilestone: protectedProcedure
    .input(z.object({ milestoneId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get milestone with project and client
      const milestone = await ctx.db.query.milestones.findFirst({
        where: eq(milestones.id, input.milestoneId),
        with: {
          project: {
            with: {
              client: true,
            },
          },
        },
      });

      if (!milestone || milestone.project.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Milestone not found",
        });
      }

      // Generate invoice number
      const result = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(eq(invoices.userId, ctx.user.id));
      const count = Number(result[0]?.count ?? 0);
      const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;

      // Create line item from milestone
      const lineItems = [
        {
          id: nanoid(),
          description: milestone.name,
          quantity: 1,
          unitPrice: milestone.amount,
          amount: milestone.amount,
        },
      ];

      // Default due date: 14 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const [invoice] = await ctx.db
        .insert(invoices)
        .values({
          userId: ctx.user.id,
          clientId: milestone.project.clientId,
          projectId: milestone.project.id,
          milestoneId: milestone.id,
          invoiceNumber,
          lineItems,
          subtotal: milestone.amount,
          tax: 0,
          total: milestone.amount,
          currency: ctx.user.currency || "USD",
          dueDate,
        })
        .returning();

      // Update milestone status
      await ctx.db
        .update(milestones)
        .set({ status: "invoiced" })
        .where(eq(milestones.id, input.milestoneId));

      return invoice;
    }),

  // Update invoice
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        lineItems: z.array(lineItemSchema).optional(),
        taxRate: z.number().min(0).max(100).optional(),
        dueDate: z.date().optional(),
        notes: z.string().optional(),
        status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, id),
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      // Recalculate totals if line items changed
      let updateData: Record<string, unknown> = { ...data };
      
      if (data.lineItems) {
        const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
        const taxRate = data.taxRate ?? (existing.taxRate ? parseFloat(existing.taxRate) : 0);
        const taxAmount = Math.round(subtotal * (taxRate / 100));
        updateData = {
          ...updateData,
          lineItems: data.lineItems,
          subtotal,
          tax: taxAmount,
          total: subtotal + taxAmount,
        };
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set(updateData)
        .where(eq(invoices.id, id))
        .returning();

      return updated;
    }),

  // Send invoice (mark as sent)
  send: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: { client: true },
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      // Update status to sent
      const [updated] = await ctx.db
        .update(invoices)
        .set({ 
          status: "sent", 
          sentAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
        .returning();

      // TODO: Send email to client with pay link
      // const payUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.payToken}`;

      return updated;
    }),

  // Mark as paid (manual)
  markPaid: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        paymentMethod: z.string().default("manual"),
        amount: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          status: "paid",
          paidAt: new Date(),
          paidAmount: input.amount ?? invoice.total,
          paymentMethod: input.paymentMethod,
        })
        .where(eq(invoices.id, input.id))
        .returning();

      // Update linked milestone status
      if (invoice.milestoneId) {
        await ctx.db
          .update(milestones)
          .set({ status: "paid" })
          .where(eq(milestones.id, invoice.milestoneId));
      }

      return updated;
    }),

  // Delete invoice
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      // Reset milestone status if linked
      if (existing.milestoneId) {
        await ctx.db
          .update(milestones)
          .set({ status: "completed" })
          .where(eq(milestones.id, existing.milestoneId));
      }

      await ctx.db.delete(invoices).where(eq(invoices.id, input.id));

      return { success: true };
    }),

  // ============ PUBLIC ENDPOINTS ============

  // Get invoice by pay token (public)
  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.payToken, input.token),
        with: {
          client: true,
          project: {
            columns: { id: true, name: true },
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      // Mark as viewed if not already
      if (!invoice.viewedAt) {
        await ctx.db
          .update(invoices)
          .set({ viewedAt: new Date(), status: "viewed" })
          .where(eq(invoices.id, invoice.id));
      }

      // Get user/business info for display
      const user = await ctx.db.query.users.findFirst({
        where: eq(invoices.userId, invoice.userId),
      });

      // Return sanitized data
      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        lineItems: invoice.lineItems,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        taxRate: invoice.taxRate,
        total: invoice.total,
        currency: invoice.currency,
        dueDate: invoice.dueDate,
        notes: invoice.notes,
        createdAt: invoice.createdAt,
        client: {
          name: invoice.client.name,
          email: invoice.client.email,
          company: invoice.client.company,
        },
        project: invoice.project ? {
          name: invoice.project.name,
        } : null,
        business: user ? {
          name: user.businessName || user.name,
          email: user.email,
          address: user.businessAddress,
          taxId: user.taxId,
          logoUrl: user.logoUrl,
        } : null,
      };
    }),

  // Record payment (called after Stripe success)
  recordPayment: publicProcedure
    .input(
      z.object({
        token: z.string(),
        paymentMethod: z.string(),
        amount: z.number(),
        stripePaymentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.payToken, input.token),
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          status: "paid",
          paidAt: new Date(),
          paidAmount: input.amount,
          paymentMethod: input.paymentMethod,
        })
        .where(eq(invoices.id, invoice.id))
        .returning();

      // Update linked milestone
      if (invoice.milestoneId) {
        await ctx.db
          .update(milestones)
          .set({ status: "paid" })
          .where(eq(milestones.id, invoice.milestoneId));
      }

      return { success: true };
    }),
});