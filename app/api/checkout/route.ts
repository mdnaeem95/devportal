import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { invoices, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payToken, amount } = body;

    if (!payToken) {
      return NextResponse.json(
        { error: "Missing payToken" },
        { status: 400 }
      );
    }

    // Get invoice
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.payToken, payToken),
      with: {
        client: true,
        project: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (invoice.status === "paid") {
      return NextResponse.json(
        { error: "Invoice already paid" },
        { status: 400 }
      );
    }

    if (invoice.status === "cancelled") {
      return NextResponse.json(
        { error: "Invoice has been cancelled" },
        { status: 400 }
      );
    }

    // Get user's Stripe account
    const user = await db.query.users.findFirst({
      where: eq(users.id, invoice.userId),
    });

    if (!user?.stripeAccountId || !user.stripeConnected) {
      return NextResponse.json(
        { error: "Payment not available. Developer has not connected Stripe." },
        { status: 400 }
      );
    }

    // Calculate remaining balance and payment amount
    const paidAmount = invoice.paidAmount || 0;
    const remainingBalance = invoice.total - paidAmount;
    
    // Determine payment amount (use provided amount or remaining balance)
    let paymentAmount = amount || remainingBalance;
    
    // Validate payment amount
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    if (paymentAmount > remainingBalance) {
      return NextResponse.json(
        { error: "Payment amount exceeds remaining balance" },
        { status: 400 }
      );
    }

    // Check minimum payment if partial payments enabled
    if (invoice.allowPartialPayments && invoice.minimumPaymentAmount) {
      if (paymentAmount < invoice.minimumPaymentAmount && paymentAmount !== remainingBalance) {
        return NextResponse.json(
          { error: `Minimum payment is ${(invoice.minimumPaymentAmount / 100).toFixed(2)}` },
          { status: 400 }
        );
      }
    }

    // Determine if this is a partial payment
    const isPartialPayment = paymentAmount < remainingBalance;

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const description = isPartialPayment
      ? `Partial payment for Invoice ${invoice.invoiceNumber}${invoice.project ? ` - ${invoice.project.name}` : ""}`
      : invoice.project
        ? `${invoice.project.name} - Invoice ${invoice.invoiceNumber}`
        : `Invoice ${invoice.invoiceNumber}`;

    const { sessionId, url } = await createCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: paymentAmount,
      currency: invoice.currency ?? "USD",
      customerEmail: invoice.client.email,
      customerName: invoice.client.name,
      description,
      connectedAccountId: user.stripeAccountId,
      successUrl: `${baseUrl}/public/pay/${payToken}?success=true&amount=${paymentAmount}`,
      cancelUrl: `${baseUrl}/public/pay/${payToken}?cancelled=true`,
      metadata: {
        clientId: invoice.clientId,
        projectId: invoice.projectId || "",
        paymentAmount: paymentAmount.toString(),
        isPartialPayment: isPartialPayment.toString(),
      },
    });

    return NextResponse.json({ sessionId, url });
  } catch (error) {
    console.error("[Checkout] Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}