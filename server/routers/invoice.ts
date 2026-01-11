import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { invoices, clients, projects, milestones, users } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { sendInvoiceEmail, sendInvoicePaidEmails, sendPaymentReminderEmail } from "@/lib/emails";

const invoiceStatusSchema = z.enum([
  "draft",
  "sent",
  "viewed",
  "paid",
  "overdue",
  "cancelled",
]);

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number(), // in cents
  amount: z.number(), // quantity * unitPrice
});

// Helper to format currency
function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// Generate invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `INV-${year}${month}-${random}`;
}

export const invoiceRouter = router({
  // List invoices
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        clientId: z.string().optional(),
        status: invoiceStatusSchema.optional(),
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
          project: true,
        },
        orderBy: [desc(invoices.createdAt)],
      });
    }),

  // Get single invoice
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: {
          client: true,
          project: true,
          milestone: true,
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return invoice;
    }),

  // Create invoice
  create: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        projectId: z.string().optional(),
        milestoneId: z.string().optional(),
        lineItems: z.array(lineItemSchema),
        taxRate: z.number().min(0).max(100).optional(),
        currency: z.string().default("USD"),
        dueDate: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify client
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });

      if (!client || client.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }

      // Calculate totals
      const subtotal = input.lineItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = input.taxRate ? Math.round(subtotal * (input.taxRate / 100)) : 0;
      const total = subtotal + tax;

      const [invoice] = await ctx.db
        .insert(invoices)
        .values({
          userId: ctx.user.id,
          clientId: input.clientId,
          projectId: input.projectId,
          milestoneId: input.milestoneId,
          invoiceNumber: generateInvoiceNumber(),
          lineItems: input.lineItems,
          subtotal,
          tax,
          taxRate: input.taxRate?.toString(),
          total,
          currency: input.currency,
          dueDate: input.dueDate,
          notes: input.notes,
          status: "draft",
        })
        .returning();

      return invoice;
    }),

  // Create invoice from milestone
  createFromMilestone: protectedProcedure
    .input(z.object({ milestoneId: z.string() }))
    .mutation(async ({ ctx, input }) => {
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

      if (!milestone) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Milestone not found" });
      }

      if (milestone.project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Create line item from milestone
      const lineItems = [
        {
          id: nanoid(),
          description: `${milestone.project.name}: ${milestone.name}`,
          quantity: 1,
          unitPrice: milestone.amount,
          amount: milestone.amount,
        },
      ];

      // Due in 14 days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const [invoice] = await ctx.db
        .insert(invoices)
        .values({
          userId: ctx.user.id,
          clientId: milestone.project.clientId,
          projectId: milestone.projectId,
          milestoneId: milestone.id,
          invoiceNumber: generateInvoiceNumber(),
          lineItems,
          subtotal: milestone.amount,
          tax: 0,
          total: milestone.amount,
          currency: "USD",
          dueDate,
          status: "draft",
        })
        .returning();

      // Update milestone status
      await ctx.db
        .update(milestones)
        .set({ status: "invoiced" })
        .where(eq(milestones.id, milestone.id));

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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (existing.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only edit draft invoices",
        });
      }

      const { id, lineItems, taxRate, ...data } = input;

      // Recalculate if line items changed
      let updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };

      if (lineItems) {
        const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const tax = taxRate ? Math.round(subtotal * (taxRate / 100)) : existing.tax;
        updateData = {
          ...updateData,
          lineItems,
          subtotal,
          tax,
          taxRate: taxRate?.toString() ?? existing.taxRate,
          total: subtotal + (tax ?? 0),
        };
      } else if (taxRate !== undefined) {
        const tax = Math.round(existing.subtotal * (taxRate / 100));
        updateData = {
          ...updateData,
          tax,
          taxRate: taxRate.toString(),
          total: existing.subtotal + tax,
        };
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set(updateData)
        .where(eq(invoices.id, id))
        .returning();

      return updated;
    }),

  // Send invoice
  send: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: {
          client: true,
          project: true,
        },
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invoice has already been sent",
        });
      }

      // Get user/business info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      // Generate pay token
      const payToken = nanoid(32);

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          status: "sent",
          payToken,
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
        .returning();

      // Send email
      const payUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${payToken}`;
      const lineItemsForEmail = (invoice.lineItems as Array<{ description: string; amount: number }>).map(
        (item) => ({
          description: item.description,
          amount: formatCurrency(item.amount, invoice.currency ?? "USD"),
        })
      );

      await sendInvoiceEmail({
        clientEmail: invoice.client.email,
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: formatCurrency(invoice.total, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
        currency: invoice.currency ?? "USD",
        dueDate: formatDate(invoice.dueDate),
        projectName: invoice.project?.name,
        developerName: user?.name || "Developer",
        developerEmail: user?.email || "",
        payUrl,
        lineItems: lineItemsForEmail,
        businessName: user?.businessName || "",
        businessLogo: user?.logoUrl ?? undefined,
      });

      return updated;
    }),

  // Send reminder
  sendReminder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: {
          client: true,
          project: true,
        },
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (!["sent", "viewed", "overdue"].includes(invoice.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only send reminders for unpaid invoices",
        });
      }

      // Get user info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      // Calculate days overdue
      const now = new Date();
      const dueDate = new Date(invoice.dueDate);
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      // Update status if overdue
      if (daysOverdue > 0 && invoice.status !== "overdue") {
        await ctx.db
          .update(invoices)
          .set({ status: "overdue", updatedAt: new Date() })
          .where(eq(invoices.id, input.id));
      }

      const payUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${invoice.payToken}`;

      await sendPaymentReminderEmail({
        clientEmail: invoice.client.email,
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: formatCurrency(invoice.total, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
        currency: invoice.currency ?? "USD",
        dueDate: formatDate(invoice.dueDate),
        daysOverdue: daysOverdue > 0 ? daysOverdue : undefined,
        projectName: invoice.project?.name,
        developerName: user?.name || "Developer",
        developerEmail: user?.email || "",
        payUrl,
        businessName: user?.businessName || "",
        businessLogo: user?.logoUrl ?? undefined,
      });

      return { success: true };
    }),

  // Mark as paid (manual)
  markPaid: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        paymentMethod: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: {
          client: true,
          project: true,
        },
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.status === "paid") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invoice already paid" });
      }

      const paidAt = new Date();

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          status: "paid",
          paidAt,
          paidAmount: invoice.total,
          paymentMethod: input.paymentMethod || "manual",
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
        .returning();

      // Update milestone if linked
      if (invoice.milestoneId) {
        await ctx.db
          .update(milestones)
          .set({ status: "paid" })
          .where(eq(milestones.id, invoice.milestoneId));
      }

      // Get user info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      // Send confirmation emails
      const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${invoice.payToken}`;

      await sendInvoicePaidEmails({
        clientEmail: invoice.client.email,
        clientName: invoice.client.name,
        developerEmail: user?.email || "",
        developerName: user?.name || "Developer",
        invoiceNumber: invoice.invoiceNumber,
        amount: formatCurrency(invoice.total, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
        currency: invoice.currency ?? "USD",
        paidAt: formatDate(paidAt),
        projectName: invoice.project?.name,
        paymentMethod: input.paymentMethod,
        viewUrl,
        businessName: user?.businessName || "",
        businessLogo: user?.logoUrl ?? undefined,
      });

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
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (existing.status === "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete paid invoices",
        });
      }

      // Revert milestone status if linked
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

  // Get invoice by pay token
  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.payToken, input.token),
        with: {
          client: true,
          project: true,
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      // Mark as viewed if first time
      if (invoice.status === "sent") {
        await ctx.db
          .update(invoices)
          .set({ status: "viewed", viewedAt: new Date() })
          .where(eq(invoices.id, invoice.id));
      }

      // Get business info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, invoice.userId),
      });

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
        paidAt: invoice.paidAt,
        notes: invoice.notes,
        createdAt: invoice.createdAt,
        client: {
          name: invoice.client.name,
          email: invoice.client.email,
          company: invoice.client.company,
        },
        project: invoice.project
          ? { name: invoice.project.name }
          : null,
        business: user
          ? {
              name: user.businessName || user.name,
              email: user.email,
              address: user.businessAddress,
              logoUrl: user.logoUrl,
              taxId: user.taxId,
            }
          : null,
      };
    }),

  // Record payment (called after Stripe webhook or manual payment)
  recordPayment: publicProcedure
    .input(
      z.object({
        token: z.string(),
        paymentMethod: z.string(),
        stripePaymentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.payToken, input.token),
        with: {
          client: true,
          project: true,
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.status === "paid") {
        return { success: true, alreadyPaid: true };
      }

      const paidAt = new Date();

      await ctx.db
        .update(invoices)
        .set({
          status: "paid",
          paidAt,
          paidAmount: invoice.total,
          paymentMethod: input.paymentMethod,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));

      // Update milestone if linked
      if (invoice.milestoneId) {
        await ctx.db
          .update(milestones)
          .set({ status: "paid" })
          .where(eq(milestones.id, invoice.milestoneId));
      }

      // Get user info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, invoice.userId),
      });

      // Send confirmation emails
      const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${input.token}`;

      await sendInvoicePaidEmails({
        clientEmail: invoice.client.email,
        clientName: invoice.client.name,
        developerEmail: user?.email || "",
        developerName: user?.name || "Developer",
        invoiceNumber: invoice.invoiceNumber,
        amount: formatCurrency(invoice.total, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
        currency: invoice.currency ?? "USD",
        paidAt: formatDate(paidAt),
        projectName: invoice.project?.name,
        paymentMethod: input.paymentMethod,
        viewUrl,
        businessName: user?.businessName || "",
        businessLogo: user?.logoUrl ?? undefined,
      });

      return { success: true };
    }),
});