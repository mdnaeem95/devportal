import { sendEmail } from "./email";
import { ContractSentEmail, ContractSignedClientEmail, ContractSignedDeveloperEmail, ContractDeclinedEmail } from "./contract-emails";
import { InvoiceSentEmail, InvoicePaidClientEmail, InvoicePaidDeveloperEmail, PaymentReminderEmail } from "./invoice-emails";

// ============================================
// Contract Emails
// ============================================

interface SendContractEmailParams {
  clientEmail: string;
  clientName: string;
  contractName: string;
  projectName?: string;
  developerName: string;
  developerEmail: string;
  signUrl: string;
  expiresAt?: string;
  businessName?: string;
  businessLogo?: string;
}

export async function sendContractEmail(params: SendContractEmailParams) {
  return sendEmail({
    to: params.clientEmail,
    subject: `Contract from ${params.developerName}: ${params.contractName}`,
    replyTo: params.developerEmail,
    react: ContractSentEmail({
      clientName: params.clientName,
      contractName: params.contractName,
      projectName: params.projectName,
      developerName: params.developerName,
      developerEmail: params.developerEmail,
      signUrl: params.signUrl,
      expiresAt: params.expiresAt,
      businessName: params.businessName,
      businessLogo: params.businessLogo,
    }),
  });
}

interface SendContractSignedEmailsParams {
  // Client info
  clientEmail: string;
  clientName: string;
  // Developer info
  developerEmail: string;
  developerName: string;
  // Contract info
  contractName: string;
  projectName?: string;
  signedAt: string;
  viewUrl: string;
  businessName?: string;
  businessLogo?: string;
}

export async function sendContractSignedEmails(params: SendContractSignedEmailsParams) {
  // Send to client
  const clientResult = await sendEmail({
    to: params.clientEmail,
    subject: `Contract Signed: ${params.contractName}`,
    replyTo: params.developerEmail,
    react: ContractSignedClientEmail({
      clientName: params.clientName,
      contractName: params.contractName,
      projectName: params.projectName,
      developerName: params.developerName,
      signedAt: params.signedAt,
      viewUrl: params.viewUrl,
      businessName: params.businessName,
      businessLogo: params.businessLogo,
    }),
  });

  // Send to developer
  const developerResult = await sendEmail({
    to: params.developerEmail,
    subject: `✓ Contract Signed by ${params.clientName}`,
    react: ContractSignedDeveloperEmail({
      developerName: params.developerName,
      clientName: params.clientName,
      clientEmail: params.clientEmail,
      contractName: params.contractName,
      projectName: params.projectName,
      signedAt: params.signedAt,
      viewUrl: params.viewUrl,
    }),
  });

  return { clientResult, developerResult };
}

interface SendContractDeclinedEmailParams {
  developerEmail: string;
  developerName: string;
  clientEmail: string;
  clientName: string;
  contractName: string;
  projectName?: string;
  viewUrl: string;
}

export async function sendContractDeclinedEmail(params: SendContractDeclinedEmailParams) {
  return sendEmail({
    to: params.developerEmail,
    subject: `Contract Declined by ${params.clientName}`,
    react: ContractDeclinedEmail({
      developerName: params.developerName,
      clientName: params.clientName,
      clientEmail: params.clientEmail,
      contractName: params.contractName,
      projectName: params.projectName,
      viewUrl: params.viewUrl,
    }),
  });
}

// ============================================
// Invoice Emails
// ============================================

interface SendInvoiceEmailParams {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  projectName?: string;
  developerName: string;
  developerEmail: string;
  payUrl: string;
  lineItems?: Array<{ description: string; amount: string }>;
  businessName?: string;
  businessLogo?: string;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams) {
  return sendEmail({
    to: params.clientEmail,
    subject: `Invoice ${params.invoiceNumber} from ${params.developerName}`,
    replyTo: params.developerEmail,
    react: InvoiceSentEmail({
      clientName: params.clientName,
      invoiceNumber: params.invoiceNumber,
      amount: params.amount,
      currency: params.currency,
      dueDate: params.dueDate,
      projectName: params.projectName,
      developerName: params.developerName,
      developerEmail: params.developerEmail,
      payUrl: params.payUrl,
      lineItems: params.lineItems,
      businessName: params.businessName,
      businessLogo: params.businessLogo,
    }),
  });
}

interface SendInvoicePaidEmailsParams {
  // Client info
  clientEmail: string;
  clientName: string;
  // Developer info
  developerEmail: string;
  developerName: string;
  // Invoice info
  invoiceNumber: string;
  amount: string;
  currency: string;
  paidAt: string;
  projectName?: string;
  paymentMethod?: string;
  viewUrl: string;
  businessName?: string;
  businessLogo?: string;
}

export async function sendInvoicePaidEmails(params: SendInvoicePaidEmailsParams) {
  // Send receipt to client
  const clientResult = await sendEmail({
    to: params.clientEmail,
    subject: `Payment Received - Invoice ${params.invoiceNumber}`,
    replyTo: params.developerEmail,
    react: InvoicePaidClientEmail({
      clientName: params.clientName,
      invoiceNumber: params.invoiceNumber,
      amount: params.amount,
      currency: params.currency,
      paidAt: params.paidAt,
      projectName: params.projectName,
      developerName: params.developerName,
      paymentMethod: params.paymentMethod,
      viewUrl: params.viewUrl,
      businessName: params.businessName,
      businessLogo: params.businessLogo,
    }),
  });

  // Notify developer
  const developerResult = await sendEmail({
    to: params.developerEmail,
    subject: `💰 Payment Received: ${params.currency} ${params.amount}`,
    react: InvoicePaidDeveloperEmail({
      developerName: params.developerName,
      clientName: params.clientName,
      invoiceNumber: params.invoiceNumber,
      amount: params.amount,
      currency: params.currency,
      paidAt: params.paidAt,
      projectName: params.projectName,
      paymentMethod: params.paymentMethod,
      viewUrl: params.viewUrl,
    }),
  });

  return { clientResult, developerResult };
}

interface SendPaymentReminderEmailParams {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  daysOverdue?: number;
  projectName?: string;
  developerName: string;
  developerEmail: string;
  payUrl: string;
  businessName?: string;
  businessLogo?: string;
}

export async function sendPaymentReminderEmail(params: SendPaymentReminderEmailParams) {
  const isOverdue = params.daysOverdue && params.daysOverdue > 0;
  
  return sendEmail({
    to: params.clientEmail,
    subject: isOverdue
      ? `Overdue: Invoice ${params.invoiceNumber} from ${params.developerName}`
      : `Reminder: Invoice ${params.invoiceNumber} from ${params.developerName}`,
    replyTo: params.developerEmail,
    react: PaymentReminderEmail({
      clientName: params.clientName,
      invoiceNumber: params.invoiceNumber,
      amount: params.amount,
      currency: params.currency,
      dueDate: params.dueDate,
      daysOverdue: params.daysOverdue,
      projectName: params.projectName,
      developerName: params.developerName,
      developerEmail: params.developerEmail,
      payUrl: params.payUrl,
      businessName: params.businessName,
      businessLogo: params.businessLogo,
    }),
  });
}