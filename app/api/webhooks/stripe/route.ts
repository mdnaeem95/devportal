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

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

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

  if (!invoiceId) {
    console.log("[Stripe Webhook] No invoiceId in session metadata");
    return;
  }

  console.log(`[Stripe Webhook] Checkout completed for invoice: ${invoiceId}`);

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
    console.log(`[Stripe Webhook] Invoice already paid: ${invoiceId}`);
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

  // Record the payment in invoice_payments table
  await db.insert(invoicePayments).values({
    id: createId(),
    invoiceId: invoice.id,
    userId: invoice.userId,
    amount: paymentAmount,
    paymentMethod: "stripe",
    stripePaymentId: session.payment_intent as string,
    paidAt,
  });

  // Determine new status
  const newStatus = isNowFullyPaid ? "paid" : "partially_paid";

  // Update invoice
  await db
    .update(invoices)
    .set({
      status: newStatus,
      paidAt: isNowFullyPaid ? paidAt : invoice.paidAt,
      paidAmount: newTotalPaid,
      paymentMethod: "stripe",
      stripePaymentId: session.payment_intent as string,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  console.log(`[Stripe Webhook] Invoice updated: ${invoiceId} - Status: ${newStatus}, Paid: ${newTotalPaid}`);

  // Update milestone if fully paid and linked
  if (isNowFullyPaid && invoice.milestoneId) {
    await db
      .update(milestones)
      .set({ status: "paid" })
      .where(eq(milestones.id, invoice.milestoneId));

    console.log(`[Stripe Webhook] Milestone marked as paid: ${invoice.milestoneId}`);
  }

  // Get user info for emails
  const user = await db.query.users.findFirst({
    where: eq(users.id, invoice.userId),
  });

  // Send confirmation emails
  const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${invoice.payToken}`;

  if (isNowFullyPaid) {
    // Send full payment confirmation
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
    // Send partial payment confirmation
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
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const invoiceId = paymentIntent.metadata?.invoiceId;

  if (!invoiceId) {
    // This might be a different type of payment, not invoice-related
    return;
  }

  console.log(`[Stripe Webhook] Payment succeeded for invoice: ${invoiceId}`);

  // The main processing happens in checkout.session.completed
  // This is a backup handler - only process if checkout.session.completed didn't run
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  });

  if (!invoice) {
    console.error(`[Stripe Webhook] Invoice not found in payment_intent.succeeded: ${invoiceId}`);
    return;
  }

  // Check if payment was already recorded (by checkout.session.completed)
  const existingPayment = await db.query.invoicePayments.findFirst({
    where: eq(invoicePayments.stripePaymentId, paymentIntent.id),
  });

  if (existingPayment) {
    console.log(`[Stripe Webhook] Payment already recorded for: ${paymentIntent.id}`);
    return;
  }

  // If not recorded, this is a fallback - record the payment
  const paymentAmount = paymentIntent.amount;
  const currentPaidAmount = invoice.paidAmount || 0;
  const newTotalPaid = currentPaidAmount + paymentAmount;
  const isNowFullyPaid = newTotalPaid >= invoice.total;

  await db.insert(invoicePayments).values({
    id: createId(),
    invoiceId: invoice.id,
    userId: invoice.userId,
    amount: paymentAmount,
    paymentMethod: "stripe",
    stripePaymentId: paymentIntent.id,
    paidAt: new Date(),
  });

  await db
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

  console.log(`[Stripe Webhook] Fallback payment recorded for: ${invoiceId}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const invoiceId = paymentIntent.metadata?.invoiceId;

  if (!invoiceId) {
    return;
  }

  console.log(`[Stripe Webhook] Payment failed for invoice: ${invoiceId}`);

  // Could send a notification to the developer here
  // For now, just log it
}

async function handleAccountUpdated(account: Stripe.Account) {
  const userId = account.metadata?.userId;

  if (!userId) {
    // Try to find user by stripeAccountId
    const user = await db.query.users.findFirst({
      where: eq(users.stripeAccountId, account.id),
    });

    if (user) {
      await db
        .update(users)
        .set({
          stripeConnected: account.charges_enabled && account.payouts_enabled,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
      
      console.log(`[Stripe Webhook] Account updated for user: ${user.id}`);
    }
    return;
  }

  console.log(`[Stripe Webhook] Account updated for user: ${userId}`);

  // Update user's Stripe status
  await db
    .update(users)
    .set({
      stripeConnected: account.charges_enabled && account.payouts_enabled,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}