import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { invoices, invoiceReminders, invoicePayments, clients, projects, milestones, users } from "../db/schema";
import { eq, desc, and, sum } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { sendInvoiceEmail, sendInvoicePaidEmails, sendPaymentReminderEmail, sendPartialPaymentEmails } from "@/lib/emails";

const invoiceStatusSchema = z.enum([
  "draft",
  "sent",
  "viewed",
  "partially_paid",
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
          reminders: {
            orderBy: [desc(invoiceReminders.sentAt)],
            limit: 10,
          },
          payments: {
            orderBy: [desc(invoicePayments.paidAt)],
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Calculate remaining balance
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = invoice.total - totalPaid;

      return {
        ...invoice,
        totalPaid,
        remainingBalance,
      };
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
        allowPartialPayments: z.boolean().default(false),
        minimumPaymentAmount: z.number().min(0).optional(), // in cents
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

      // Validate minimum payment if partial payments enabled
      if (input.allowPartialPayments && input.minimumPaymentAmount) {
        if (input.minimumPaymentAmount > total) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Minimum payment amount cannot exceed invoice total",
          });
        }
      }

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
          allowPartialPayments: input.allowPartialPayments,
          minimumPaymentAmount: input.minimumPaymentAmount,
          paidAmount: 0,
        })
        .returning();

      return invoice;
    }),

  // Create invoice from milestone
  createFromMilestone: protectedProcedure
    .input(z.object({ 
      milestoneId: z.string(),
      allowPartialPayments: z.boolean().default(false),
      minimumPaymentAmount: z.number().min(0).optional(),
    }))
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
          allowPartialPayments: input.allowPartialPayments,
          minimumPaymentAmount: input.minimumPaymentAmount,
          paidAmount: 0,
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
        allowPartialPayments: z.boolean().optional(),
        minimumPaymentAmount: z.number().min(0).nullable().optional(),
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

      const { id, lineItems, taxRate, minimumPaymentAmount, ...data } = input;

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

      // Handle minimum payment amount (null means remove the minimum)
      if (minimumPaymentAmount !== undefined) {
        updateData.minimumPaymentAmount = minimumPaymentAmount;
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set(updateData)
        .where(eq(invoices.id, id))
        .returning();

      return updated;
    }),

  // Toggle partial payments
  togglePartialPayments: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      minimumPaymentAmount: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      // Can toggle partial payments for draft or sent invoices
      if (!["draft", "sent", "viewed"].includes(invoice.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change partial payment settings for this invoice",
        });
      }

      const newAllowPartial = !invoice.allowPartialPayments;

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          allowPartialPayments: newAllowPartial,
          minimumPaymentAmount: newAllowPartial ? (input.minimumPaymentAmount ?? null) : null,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
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
        allowPartialPayments: invoice.allowPartialPayments,
        minimumPaymentAmount: invoice.minimumPaymentAmount 
          ? formatCurrency(invoice.minimumPaymentAmount, invoice.currency ?? "USD")
          : undefined,
      });

      return updated;
    }),

  // Send reminder
  sendReminder: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      customMessage: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: {
          client: true,
          project: true,
          payments: true,
        },
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (!["sent", "viewed", "overdue", "partially_paid"].includes(invoice.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only send reminders for unpaid invoices",
        });
      }

      // Check 24-hour cooldown
      if (invoice.lastReminderAt) {
        const hoursSinceLastReminder = 
          (Date.now() - new Date(invoice.lastReminderAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastReminder < 24) {
          const hoursRemaining = Math.ceil(24 - hoursSinceLastReminder);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Please wait ${hoursRemaining} hour${hoursRemaining === 1 ? '' : 's'} before sending another reminder`,
          });
        }
      }

      // Get user info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      // Calculate days overdue and remaining balance
      const now = new Date();
      const dueDate = new Date(invoice.dueDate);
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = invoice.total - totalPaid;

      // Update status if overdue
      if (daysOverdue > 0 && invoice.status !== "overdue" && invoice.status !== "partially_paid") {
        await ctx.db
          .update(invoices)
          .set({ status: "overdue", updatedAt: new Date() })
          .where(eq(invoices.id, input.id));
      }

      const payUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${invoice.payToken}`;

      // FIXED: Use correct property names matching SendPaymentReminderEmailParams
      await sendPaymentReminderEmail({
        clientEmail: invoice.client.email,
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: formatCurrency(remainingBalance, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
        currency: invoice.currency ?? "USD",
        dueDate: formatDate(invoice.dueDate),
        daysOverdue: daysOverdue > 0 ? daysOverdue : undefined,
        projectName: invoice.project?.name,
        developerName: user?.name || "Developer",
        developerEmail: user?.email || "",
        payUrl,
        businessName: user?.businessName || "",
        businessLogo: user?.logoUrl ?? undefined,
        customMessage: input.customMessage,
        isPartiallyPaid: invoice.status === "partially_paid",
        paidAmount: totalPaid > 0 ? formatCurrency(totalPaid, invoice.currency ?? "USD").replace(/[^0-9.,]/g, "") : undefined,
        remainingBalance: totalPaid > 0 ? formatCurrency(remainingBalance, invoice.currency ?? "USD").replace(/[^0-9.,]/g, "") : undefined,
      });

      // Record reminder in database
      await ctx.db.insert(invoiceReminders).values({
        invoiceId: invoice.id,
        userId: ctx.user.id,
        reminderType: "manual",
        customMessage: input.customMessage,
        sentToEmail: invoice.client.email,
        sentToName: invoice.client.name,
      });

      // Update invoice reminder tracking
      await ctx.db
        .update(invoices)
        .set({
          lastReminderAt: new Date(),
          reminderCount: (invoice.reminderCount ?? 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id));

      return { success: true };
    }),

  // Toggle auto-remind setting
  toggleAutoRemind: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      const [updated] = await ctx.db
        .update(invoices)
        .set({
          autoRemind: !invoice.autoRemind,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
        .returning();

      return updated;
    }),

  // List reminders for an invoice
  listReminders: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.invoiceId),
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      return ctx.db.query.invoiceReminders.findMany({
        where: eq(invoiceReminders.invoiceId, input.invoiceId),
        orderBy: [desc(invoiceReminders.sentAt)],
      });
    }),

  // List payments for an invoice
  listPayments: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.invoiceId),
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      return ctx.db.query.invoicePayments.findMany({
        where: eq(invoicePayments.invoiceId, input.invoiceId),
        orderBy: [desc(invoicePayments.paidAt)],
      });
    }),

  // Get invoices needing reminders (for auto-remind cron)
  getInvoicesNeedingReminders: protectedProcedure
    .query(async ({ ctx }) => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get all unpaid invoices for this user with auto-remind enabled
      const unpaidInvoices = await ctx.db.query.invoices.findMany({
        where: and(
          eq(invoices.userId, ctx.user.id),
          eq(invoices.autoRemind, true),
        ),
        with: {
          client: true,
        },
      });

      // Filter to only unpaid statuses
      const pendingInvoices = unpaidInvoices.filter(inv => 
        ["sent", "viewed", "overdue", "partially_paid"].includes(inv.status)
      );

      // Filter invoices that need reminders
      const needsFirstReminder = pendingInvoices.filter(inv => {
        const sentAt = inv.sentAt ? new Date(inv.sentAt) : null;
        if (!sentAt || sentAt > threeDaysAgo) return false;
        if (inv.reminderCount > 0) return false;
        if (inv.lastReminderAt && new Date(inv.lastReminderAt) > oneDayAgo) return false;
        return true;
      });

      const needsSecondReminder = pendingInvoices.filter(inv => {
        const sentAt = inv.sentAt ? new Date(inv.sentAt) : null;
        if (!sentAt || sentAt > sevenDaysAgo) return false;
        if (inv.reminderCount !== 1) return false;
        if (inv.lastReminderAt && new Date(inv.lastReminderAt) > oneDayAgo) return false;
        return true;
      });

      const overdueNeedReminder = pendingInvoices.filter(inv => {
        const dueDate = new Date(inv.dueDate);
        if (dueDate > now) return false;
        if (inv.reminderCount >= 5) return false;
        if (inv.lastReminderAt && new Date(inv.lastReminderAt) > oneDayAgo) return false;
        return true;
      });

      return {
        needsFirstReminder,
        needsSecondReminder,
        overdueNeedReminder,
        total: needsFirstReminder.length + needsSecondReminder.length + overdueNeedReminder.length,
      };
    }),

  // Record a partial payment (manual)
  recordPartialPayment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().min(1), // in cents
        paymentMethod: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: {
          client: true,
          project: true,
          payments: true,
        },
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.status === "paid") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invoice already fully paid" });
      }

      if (invoice.status === "draft") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot record payment for draft invoice" });
      }

      // Calculate current total paid
      const currentTotalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = invoice.total - currentTotalPaid;

      if (input.amount > remainingBalance) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Payment amount exceeds remaining balance of ${formatCurrency(remainingBalance, invoice.currency ?? "USD")}`,
        });
      }

      // Check minimum payment amount
      if (invoice.minimumPaymentAmount && input.amount < invoice.minimumPaymentAmount && input.amount < remainingBalance) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum payment amount is ${formatCurrency(invoice.minimumPaymentAmount, invoice.currency ?? "USD")}`,
        });
      }

      const paidAt = new Date();
      const newTotalPaid = currentTotalPaid + input.amount;
      const isFullyPaid = newTotalPaid >= invoice.total;

      // Record the payment
      await ctx.db.insert(invoicePayments).values({
        invoiceId: invoice.id,
        userId: ctx.user.id,
        amount: input.amount,
        paymentMethod: input.paymentMethod || "manual",
        notes: input.notes,
        paidAt,
      });

      // Update invoice
      const newStatus = isFullyPaid ? "paid" : "partially_paid";
      
      const [updated] = await ctx.db
        .update(invoices)
        .set({
          status: newStatus,
          paidAmount: newTotalPaid,
          paidAt: isFullyPaid ? paidAt : null,
          paymentMethod: isFullyPaid ? (input.paymentMethod || "manual") : null,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.id))
        .returning();

      // Update milestone if linked and fully paid
      if (isFullyPaid && invoice.milestoneId) {
        await ctx.db
          .update(milestones)
          .set({ status: "paid" })
          .where(eq(milestones.id, invoice.milestoneId));
      }

      // Get user info for emails
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${invoice.payToken}`;

      // Send appropriate email
      if (isFullyPaid) {
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
      } else {
        // FIXED: Add missing totalPaid and percentagePaid properties
        const percentagePaid = Math.round((newTotalPaid / invoice.total) * 100);
        await sendPartialPaymentEmails({
          clientEmail: invoice.client.email,
          clientName: invoice.client.name,
          developerEmail: user?.email || "",
          developerName: user?.name || "Developer",
          invoiceNumber: invoice.invoiceNumber,
          paymentAmount: formatCurrency(input.amount, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
          totalAmount: formatCurrency(invoice.total, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
          remainingBalance: formatCurrency(invoice.total - newTotalPaid, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
          totalPaid: formatCurrency(newTotalPaid, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
          percentagePaid,
          currency: invoice.currency ?? "USD",
          paidAt: formatDate(paidAt),
          projectName: invoice.project?.name,
          paymentMethod: input.paymentMethod,
          viewUrl,
          businessName: user?.businessName || "",
          businessLogo: user?.logoUrl ?? undefined,
        });
      }

      return updated;
    }),

  // Mark as paid (full payment - manual)
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
          payments: true,
        },
      });

      if (!invoice || invoice.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.status === "paid") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invoice already paid" });
      }

      const paidAt = new Date();
      const currentTotalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingAmount = invoice.total - currentTotalPaid;

      // Record final payment if there's remaining balance
      if (remainingAmount > 0) {
        await ctx.db.insert(invoicePayments).values({
          invoiceId: invoice.id,
          userId: ctx.user.id,
          amount: remainingAmount,
          paymentMethod: input.paymentMethod || "manual",
          notes: "Final payment - marked as paid",
          paidAt,
        });
      }

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

  // Duplicate invoice
  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.invoices.findFirst({
        where: eq(invoices.id, input.id),
        with: {
          client: true,
          project: true,
        },
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      // Calculate new due date (14 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const [duplicated] = await ctx.db
        .insert(invoices)
        .values({
          userId: ctx.user.id,
          clientId: existing.clientId,
          projectId: existing.projectId,
          milestoneId: null, // Don't copy milestone association
          invoiceNumber: generateInvoiceNumber(),
          lineItems: existing.lineItems,
          subtotal: existing.subtotal,
          tax: existing.tax,
          taxRate: existing.taxRate,
          total: existing.total,
          currency: existing.currency,
          dueDate,
          notes: existing.notes,
          status: "draft",
          allowPartialPayments: existing.allowPartialPayments,
          minimumPaymentAmount: existing.minimumPaymentAmount,
          paidAmount: 0,
        })
        .returning();

      return duplicated;
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

      if (existing.status === "paid" || existing.status === "partially_paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete invoices with payments",
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
          payments: {
            orderBy: [desc(invoicePayments.paidAt)],
          },
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

      // Calculate remaining balance
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = invoice.total - totalPaid;

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
        // Partial payment info
        allowPartialPayments: invoice.allowPartialPayments,
        minimumPaymentAmount: invoice.minimumPaymentAmount,
        totalPaid,
        remainingBalance,
        payments: invoice.payments.map(p => ({
          id: p.id,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          paidAt: p.paidAt,
        })),
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

  // Record payment (called after Stripe webhook or manual payment - public)
  recordPayment: publicProcedure
    .input(
      z.object({
        token: z.string(),
        amount: z.number().min(1), // in cents
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
          payments: true,
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.status === "paid") {
        return { success: true, alreadyPaid: true };
      }

      // Calculate current total paid
      const currentTotalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = invoice.total - currentTotalPaid;

      // Validate payment amount
      if (input.amount > remainingBalance) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment amount exceeds remaining balance",
        });
      }

      const paidAt = new Date();
      const newTotalPaid = currentTotalPaid + input.amount;
      const isFullyPaid = newTotalPaid >= invoice.total;

      // Record the payment
      await ctx.db.insert(invoicePayments).values({
        invoiceId: invoice.id,
        userId: invoice.userId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        stripePaymentId: input.stripePaymentId,
        paidAt,
      });

      // Update invoice
      const newStatus = isFullyPaid ? "paid" : "partially_paid";

      await ctx.db
        .update(invoices)
        .set({
          status: newStatus,
          paidAmount: newTotalPaid,
          paidAt: isFullyPaid ? paidAt : null,
          paymentMethod: isFullyPaid ? input.paymentMethod : null,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));

      // Update milestone if linked and fully paid
      if (isFullyPaid && invoice.milestoneId) {
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

      if (isFullyPaid) {
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
      } else {
        // FIXED: Add missing totalPaid and percentagePaid properties
        const percentagePaid = Math.round((newTotalPaid / invoice.total) * 100);
        await sendPartialPaymentEmails({
          clientEmail: invoice.client.email,
          clientName: invoice.client.name,
          developerEmail: user?.email || "",
          developerName: user?.name || "Developer",
          invoiceNumber: invoice.invoiceNumber,
          paymentAmount: formatCurrency(input.amount, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
          totalAmount: formatCurrency(invoice.total, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
          remainingBalance: formatCurrency(invoice.total - newTotalPaid, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
          totalPaid: formatCurrency(newTotalPaid, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
          percentagePaid,
          currency: invoice.currency ?? "USD",
          paidAt: formatDate(paidAt),
          projectName: invoice.project?.name,
          paymentMethod: input.paymentMethod,
          viewUrl,
          businessName: user?.businessName || "",
          businessLogo: user?.logoUrl ?? undefined,
        });
      }

      return { success: true, isFullyPaid };
    }),
});