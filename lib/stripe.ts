import Stripe from "stripe";

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// ============================================
// Stripe Connect (for freelancers to receive payments)
// ============================================

interface CreateConnectAccountParams {
  userId: string;
  email: string;
  businessName?: string;
}

/**
 * Create a Stripe Connect account for a freelancer
 */
export async function createConnectAccount(params: CreateConnectAccountParams) {
  const { userId, email, businessName } = params;

  const account = await stripe.accounts.create({
    type: "express",
    email,
    // Don't specify country - Stripe will ask during onboarding
    business_profile: {
      name: businessName,
      product_description: "Freelance software development services",
    },
    metadata: {
      userId,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    // Also remove business_type - let user choose during onboarding
  });

  return account;
}

/**
 * Create an onboarding link for Connect account
 */
export async function createConnectOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    return_url: returnUrl,
    refresh_url: refreshUrl,
  });

  return accountLink.url;
}

/**
 * Create a dashboard login link for Connect account
 */
export async function createConnectDashboardLink(accountId: string) {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink.url;
}

/**
 * Get Connect account status
 */
export async function getConnectAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);

  return {
    id: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    email: account.email,
    country: account.country,
    defaultCurrency: account.default_currency,
    requirements: account.requirements,
  };
}

// ============================================
// Checkout Sessions (for invoice payments)
// ============================================

interface CreateCheckoutParams {
  invoiceId: string;
  invoiceNumber: string;
  amount: number; // in cents
  currency: string;
  customerEmail: string;
  customerName: string;
  description: string;
  connectedAccountId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe Checkout session for invoice payment
 */
export async function createCheckoutSession(params: CreateCheckoutParams) {
  const {
    invoiceId,
    invoiceNumber,
    amount,
    currency,
    customerEmail,
    customerName,
    description,
    connectedAccountId,
    successUrl,
    cancelUrl,
    metadata = {},
  } = params;

  // Calculate platform fee (e.g., 2.9% + $0.30 for Stripe, plus your margin)
  // For now, we'll take a small platform fee of 1%
  const platformFee = Math.round(amount * 0.01);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `Invoice ${invoiceNumber}`,
            description,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: connectedAccountId,
      },
      metadata: {
        invoiceId,
        invoiceNumber,
        ...metadata,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      invoiceId,
      invoiceNumber,
      customerName,
      ...metadata,
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

// ============================================
// Webhooks
// ============================================

/**
 * Construct and verify webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// ============================================
// Refunds
// ============================================

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // Optional partial refund amount in cents
  reason?: "duplicate" | "fraudulent" | "requested_by_customer"
) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
    reason,
  });

  return refund;
}

// ============================================
// Balance & Payouts
// ============================================

/**
 * Get balance for a connected account
 */
export async function getConnectBalance(accountId: string) {
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  });

  return {
    available: balance.available.map((b) => ({
      amount: b.amount,
      currency: b.currency,
    })),
    pending: balance.pending.map((b) => ({
      amount: b.amount,
      currency: b.currency,
    })),
  };
}

// ============================================
// Helpers
// ============================================

/**
 * Format amount for Stripe (converts dollars to cents)
 */
export function toStripeAmount(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format amount from Stripe (converts cents to dollars)
 */
export function fromStripeAmount(cents: number): number {
  return cents / 100;
}

/**
 * Get supported currencies
 */
export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
] as const;