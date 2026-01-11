import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { invoices, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payToken } = body;

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

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const description = invoice.project
      ? `${invoice.project.name} - Invoice ${invoice.invoiceNumber}`
      : `Invoice ${invoice.invoiceNumber}`;

    const { sessionId, url } = await createCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      currency: invoice.currency ?? "USD",
      customerEmail: invoice.client.email,
      customerName: invoice.client.name,
      description,
      connectedAccountId: user.stripeAccountId,
      successUrl: `${baseUrl}/pay/${payToken}?success=true`,
      cancelUrl: `${baseUrl}/pay/${payToken}?cancelled=true`,
      metadata: {
        clientId: invoice.clientId,
        projectId: invoice.projectId || "",
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