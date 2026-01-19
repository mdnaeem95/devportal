import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/stripe";
import { db } from "@/server/db";
import { invoices, invoicePayments, milestones, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { sendInvoicePaidEmails, sendPartialPaymentEmails } from "@/lib/emails";
import type Stripe from "stripe";

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

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[Stripe Webhook] Error processing ${event.type}:`, err);
    // Return 500 so Stripe will retry
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ============================================
// Event Handlers
// ============================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const invoiceId = session.metadata?.invoiceId;
  const paymentAmountStr = session.metadata?.paymentAmount;
  const stripePaymentId = session.payment_intent as string;

  if (!invoiceId) {
    console.log("[Stripe Webhook] No invoiceId in session metadata");
    return;
  }

  if (!stripePaymentId) {
    console.error("[Stripe Webhook] No payment_intent in session");
    return;
  }

  console.log(`[Stripe Webhook] Checkout completed for invoice: ${invoiceId}, payment: ${stripePaymentId}`);

  // ============================================
  // IDEMPOTENCY CHECK - Critical for reliability
  // ============================================
  const existingPayment = await db.query.invoicePayments.findFirst({
    where: eq(invoicePayments.stripePaymentId, stripePaymentId),
  });

  if (existingPayment) {
    console.log(`[Stripe Webhook] Payment already recorded: ${stripePaymentId} - skipping`);
    return;
  }

  // Get invoice with relations
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
    with: {
      client: true,
      project: true,
    },
  });

  if (!invoice) {
    console.error(`[Stripe Webhook] Invoice not found: ${invoiceId}`);
    return;
  }

  if (invoice.status === "paid") {
    console.log(`[Stripe Webhook] Invoice already fully paid: ${invoiceId}`);
    return;
  }

  const paidAt = new Date();
  
  // Determine payment amount from metadata or session amount
  const paymentAmount = paymentAmountStr 
    ? parseInt(paymentAmountStr) 
    : session.amount_total || invoice.total;

  // Calculate new totals
  const currentPaidAmount = invoice.paidAmount || 0;
  const newTotalPaid = currentPaidAmount + paymentAmount;
  const remainingAfterPayment = invoice.total - newTotalPaid;
  const isNowFullyPaid = remainingAfterPayment <= 0;
  const newStatus = isNowFullyPaid ? "paid" : "partially_paid";

  // ============================================
  // DATABASE TRANSACTION - Atomic updates
  // ============================================
  try {
    await db.transaction(async (tx) => {
      // 1. Record the payment
      await tx.insert(invoicePayments).values({
        id: createId(),
        invoiceId: invoice.id,
        userId: invoice.userId,
        amount: paymentAmount,
        paymentMethod: "stripe",
        stripePaymentId: stripePaymentId,
        paidAt,
      });

      // 2. Update invoice
      await tx
        .update(invoices)
        .set({
          status: newStatus,
          paidAt: isNowFullyPaid ? paidAt : invoice.paidAt,
          paidAmount: newTotalPaid,
          paymentMethod: "stripe",
          stripePaymentId: stripePaymentId,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoiceId));

      // 3. Update milestone if fully paid and linked
      if (isNowFullyPaid && invoice.milestoneId) {
        await tx
          .update(milestones)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(milestones.id, invoice.milestoneId));

        console.log(`[Stripe Webhook] Milestone marked as paid: ${invoice.milestoneId}`);
      }
    });

    console.log(`[Stripe Webhook] Invoice updated: ${invoiceId} - Status: ${newStatus}, Paid: ${newTotalPaid}`);
  } catch (txError) {
    console.error(`[Stripe Webhook] Transaction failed for invoice ${invoiceId}:`, txError);
    throw txError; // Re-throw to trigger 500 response and Stripe retry
  }

  // ============================================
  // SEND EMAILS - Outside transaction (non-critical)
  // ============================================
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, invoice.userId),
    });

    const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/public/pay/${invoice.payToken}`;

    if (isNowFullyPaid) {
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
        paymentMethod: "Credit Card",
        viewUrl,
        businessName: user?.businessName || "",
        businessLogo: user?.logoUrl ?? undefined,
      });

      console.log(`[Stripe Webhook] Full payment confirmation emails sent for: ${invoiceId}`);
    } else {
      const percentagePaid = Math.round((newTotalPaid / invoice.total) * 100);

      await sendPartialPaymentEmails({
        clientEmail: invoice.client.email,
        clientName: invoice.client.name,
        developerEmail: user?.email || "",
        developerName: user?.name || "Developer",
        invoiceNumber: invoice.invoiceNumber,
        paymentAmount: formatCurrency(paymentAmount, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
        totalAmount: formatCurrency(invoice.total, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
        remainingBalance: formatCurrency(remainingAfterPayment, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
        totalPaid: formatCurrency(newTotalPaid, invoice.currency ?? "USD").replace(/[^0-9.,]/g, ""),
        currency: invoice.currency ?? "USD",
        paidAt: formatDate(paidAt),
        projectName: invoice.project?.name,
        paymentMethod: "Credit Card",
        viewUrl,
        businessName: user?.businessName || "",
        businessLogo: user?.logoUrl ?? undefined,
        percentagePaid,
      });

      console.log(`[Stripe Webhook] Partial payment confirmation emails sent for: ${invoiceId}`);
    }
  } catch (emailError) {
    // Log email failure but don't fail the webhook
    // Payment was already recorded successfully
    console.error(`[Stripe Webhook] Failed to send emails for invoice ${invoiceId}:`, emailError);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const invoiceId = paymentIntent.metadata?.invoiceId;

  if (!invoiceId) {
    // This might be a different type of payment, not invoice-related
    return;
  }

  console.log(`[Stripe Webhook] Payment succeeded for invoice: ${invoiceId}, payment: ${paymentIntent.id}`);

  // ============================================
  // IDEMPOTENCY CHECK
  // ============================================
  const existingPayment = await db.query.invoicePayments.findFirst({
    where: eq(invoicePayments.stripePaymentId, paymentIntent.id),
  });

  if (existingPayment) {
    console.log(`[Stripe Webhook] Payment already recorded: ${paymentIntent.id} - skipping fallback`);
    return;
  }

  // The main processing happens in checkout.session.completed
  // This is a backup handler - only process if checkout.session.completed didn't run
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  });

  if (!invoice) {
    console.error(`[Stripe Webhook] Invoice not found in payment_intent.succeeded: ${invoiceId}`);
    return;
  }

  console.log(`[Stripe Webhook] Running fallback payment recording for: ${invoiceId}`);

  // Fallback: Record the payment with transaction
  const paymentAmount = paymentIntent.amount;
  const currentPaidAmount = invoice.paidAmount || 0;
  const newTotalPaid = currentPaidAmount + paymentAmount;
  const isNowFullyPaid = newTotalPaid >= invoice.total;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(invoicePayments).values({
        id: createId(),
        invoiceId: invoice.id,
        userId: invoice.userId,
        amount: paymentAmount,
        paymentMethod: "stripe",
        stripePaymentId: paymentIntent.id,
        paidAt: new Date(),
      });

      await tx
        .update(invoices)
        .set({
          status: isNowFullyPaid ? "paid" : "partially_paid",
          paidAt: isNowFullyPaid ? new Date() : invoice.paidAt,
          paidAmount: newTotalPaid,
          paymentMethod: "stripe",
          stripePaymentId: paymentIntent.id,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoiceId));

      // Update milestone if fully paid
      if (isNowFullyPaid && invoice.milestoneId) {
        await tx
          .update(milestones)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(milestones.id, invoice.milestoneId));
      }
    });

    console.log(`[Stripe Webhook] Fallback payment recorded for: ${invoiceId}`);
  } catch (txError) {
    console.error(`[Stripe Webhook] Fallback transaction failed for invoice ${invoiceId}:`, txError);
    throw txError;
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const invoiceId = paymentIntent.metadata?.invoiceId;

  if (!invoiceId) {
    return;
  }

  console.log(`[Stripe Webhook] Payment failed for invoice: ${invoiceId}`);

  // Log the failure reason
  const failureMessage = paymentIntent.last_payment_error?.message || "Unknown error";
  const failureCode = paymentIntent.last_payment_error?.code || "unknown";
  
  console.log(`[Stripe Webhook] Failure reason: ${failureCode} - ${failureMessage}`);

  // TODO: Could send a notification to the developer here
  // TODO: Could create a notification in the notifications table
}

async function handleAccountUpdated(account: Stripe.Account) {
  const userId = account.metadata?.userId;
  const isFullyConnected = account.charges_enabled && account.payouts_enabled;

  if (!userId) {
    // Try to find user by stripeAccountId
    const user = await db.query.users.findFirst({
      where: eq(users.stripeAccountId, account.id),
    });

    if (user) {
      await db
        .update(users)
        .set({
          stripeConnected: isFullyConnected,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
      
      console.log(`[Stripe Webhook] Account updated for user: ${user.id}, connected: ${isFullyConnected}`);
    }
    return;
  }

  console.log(`[Stripe Webhook] Account updated for user: ${userId}, connected: ${isFullyConnected}`);

  await db
    .update(users)
    .set({
      stripeConnected: isFullyConnected,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}