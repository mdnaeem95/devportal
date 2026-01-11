import { Button, Column, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";

// ============================================
// Invoice Sent
// ============================================

interface InvoiceSentEmailProps {
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

export function InvoiceSentEmail({
  clientName,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  projectName,
  developerName,
  developerEmail,
  payUrl,
  lineItems,
  businessName,
  businessLogo,
}: InvoiceSentEmailProps) {
  return (
    <EmailLayout
      preview={`Invoice ${invoiceNumber} for ${currency} ${amount}`}
      businessName={businessName}
      businessLogo={businessLogo}
    >
      <Text style={styles.heading}>Invoice {invoiceNumber}</Text>
      
      <Text style={styles.paragraph}>Hi {clientName},</Text>
      
      <Text style={styles.paragraph}>
        Please find your invoice below. Payment is due by {dueDate}.
      </Text>

      <Section style={styles.card}>
        <Text style={{ ...styles.amount, textAlign: "center" }}>
          {currency} {amount}
        </Text>
        <Text style={{ ...styles.muted, textAlign: "center", marginTop: "8px" }}>
          Due {dueDate}
        </Text>
      </Section>

      <Section style={{ margin: "24px 0" }}>
        <Text style={styles.label}>Invoice Number</Text>
        <Text style={styles.value}>{invoiceNumber}</Text>
        
        {projectName && (
          <>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{projectName}</Text>
          </>
        )}
        
        <Text style={styles.label}>From</Text>
        <Text style={{ ...styles.value, marginBottom: 0 }}>{developerName}</Text>
      </Section>

      {lineItems && lineItems.length > 0 && (
        <Section style={{ margin: "24px 0", borderTop: "1px solid #e6ebf1", paddingTop: "24px" }}>
          <Text style={{ ...styles.label, marginBottom: "16px" }}>Items</Text>
          {lineItems.map((item, index) => (
            <Row key={index} style={{ marginBottom: "8px" }}>
              <Column style={{ width: "70%" }}>
                <Text style={{ ...styles.paragraph, margin: 0 }}>{item.description}</Text>
              </Column>
              <Column style={{ width: "30%", textAlign: "right" }}>
                <Text style={{ ...styles.paragraph, margin: 0, fontWeight: "600" }}>
                  {item.amount}
                </Text>
              </Column>
            </Row>
          ))}
        </Section>
      )}

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={payUrl} style={styles.button}>
          Pay Invoice
        </Button>
      </Section>

      <Text style={styles.muted}>
        Pay securely online with credit card or bank transfer.
      </Text>

      <Text style={styles.paragraph}>
        Questions about this invoice? Contact{" "}
        <Link href={`mailto:${developerEmail}`} style={styles.link}>
          {developerEmail}
        </Link>
      </Text>
    </EmailLayout>
  );
}

// ============================================
// Invoice Paid - To Client (Receipt)
// ============================================

interface InvoicePaidClientEmailProps {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  paidAt: string;
  projectName?: string;
  developerName: string;
  paymentMethod?: string;
  viewUrl: string;
  businessName?: string;
  businessLogo?: string;
}

export function InvoicePaidClientEmail({
  clientName,
  invoiceNumber,
  amount,
  currency,
  paidAt,
  projectName,
  developerName,
  paymentMethod,
  viewUrl,
  businessName,
  businessLogo,
}: InvoicePaidClientEmailProps) {
  return (
    <EmailLayout
      preview={`Payment received - Invoice ${invoiceNumber}`}
      businessName={businessName}
      businessLogo={businessLogo}
    >
      <Text style={styles.heading}>Payment Received ✓</Text>
      
      <Text style={styles.paragraph}>Hi {clientName},</Text>
      
      <Text style={styles.paragraph}>
        Thank you for your payment! This email serves as your receipt.
      </Text>

      <Section style={styles.card}>
        <Text style={{ ...styles.label, textAlign: "center" }}>Amount Paid</Text>
        <Text style={{ ...styles.amount, textAlign: "center" }}>
          {currency} {amount}
        </Text>
      </Section>

      <Section style={{ margin: "24px 0" }}>
        <Text style={styles.label}>Invoice Number</Text>
        <Text style={styles.value}>{invoiceNumber}</Text>
        
        {projectName && (
          <>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{projectName}</Text>
          </>
        )}
        
        <Text style={styles.label}>Paid On</Text>
        <Text style={styles.value}>{paidAt}</Text>
        
        {paymentMethod && (
          <>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={{ ...styles.value, marginBottom: 0 }}>{paymentMethod}</Text>
          </>
        )}
      </Section>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={viewUrl} style={styles.buttonSecondary}>
          View Invoice
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        Thank you for your business!
      </Text>

      <Text style={styles.muted}>
        — {developerName}
      </Text>
    </EmailLayout>
  );
}

// ============================================
// Invoice Paid - To Developer
// ============================================

interface InvoicePaidDeveloperEmailProps {
  developerName: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  paidAt: string;
  projectName?: string;
  paymentMethod?: string;
  viewUrl: string;
}

export function InvoicePaidDeveloperEmail({
  developerName,
  clientName,
  invoiceNumber,
  amount,
  currency,
  paidAt,
  projectName,
  paymentMethod,
  viewUrl,
}: InvoicePaidDeveloperEmailProps) {
  return (
    <EmailLayout preview={`Payment received: ${currency} ${amount}`}>
      <Text style={styles.heading}>Payment Received! 💰</Text>
      
      <Text style={styles.paragraph}>Hi {developerName},</Text>
      
      <Text style={styles.paragraph}>
        Great news! <strong>{clientName}</strong> has paid invoice {invoiceNumber}.
      </Text>

      <Section style={styles.card}>
        <Text style={{ ...styles.label, textAlign: "center" }}>Amount Received</Text>
        <Text style={{ ...styles.amount, textAlign: "center", color: "#22c55e" }}>
          {currency} {amount}
        </Text>
      </Section>

      <Section style={{ margin: "24px 0" }}>
        <Text style={styles.label}>Invoice</Text>
        <Text style={styles.value}>{invoiceNumber}</Text>
        
        <Text style={styles.label}>Client</Text>
        <Text style={styles.value}>{clientName}</Text>
        
        {projectName && (
          <>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{projectName}</Text>
          </>
        )}
        
        <Text style={styles.label}>Paid On</Text>
        <Text style={{ ...styles.value, marginBottom: 0 }}>{paidAt}</Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={viewUrl} style={styles.button}>
          View Invoice
        </Button>
      </Section>

      <Text style={styles.muted}>
        Funds will be deposited to your connected account according to your payout schedule.
      </Text>
    </EmailLayout>
  );
}

// ============================================
// Payment Reminder
// ============================================

interface PaymentReminderEmailProps {
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

export function PaymentReminderEmail({
  clientName,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  daysOverdue,
  projectName,
  developerName,
  developerEmail,
  payUrl,
  businessName,
  businessLogo,
}: PaymentReminderEmailProps) {
  const isOverdue = daysOverdue && daysOverdue > 0;
  
  return (
    <EmailLayout
      preview={isOverdue ? `Payment overdue: Invoice ${invoiceNumber}` : `Payment reminder: Invoice ${invoiceNumber}`}
      businessName={businessName}
      businessLogo={businessLogo}
    >
      <Text style={styles.heading}>
        {isOverdue ? "Payment Overdue" : "Payment Reminder"}
      </Text>
      
      <Text style={styles.paragraph}>Hi {clientName},</Text>
      
      <Text style={styles.paragraph}>
        {isOverdue
          ? `This is a reminder that invoice ${invoiceNumber} is now ${daysOverdue} days overdue.`
          : `This is a friendly reminder that invoice ${invoiceNumber} is due on ${dueDate}.`}
      </Text>

      <Section style={{
        ...styles.card,
        backgroundColor: isOverdue ? "#fef2f2" : "#f6f9fc",
        borderLeft: isOverdue ? "4px solid #ef4444" : "none",
      }}>
        <Text style={{ ...styles.amount, textAlign: "center", color: isOverdue ? "#ef4444" : "#1a1a1a" }}>
          {currency} {amount}
        </Text>
        <Text style={{ ...styles.muted, textAlign: "center", marginTop: "8px" }}>
          {isOverdue ? `Was due ${dueDate}` : `Due ${dueDate}`}
        </Text>
      </Section>

      <Section style={{ margin: "24px 0" }}>
        <Text style={styles.label}>Invoice Number</Text>
        <Text style={styles.value}>{invoiceNumber}</Text>
        
        {projectName && (
          <>
            <Text style={styles.label}>Project</Text>
            <Text style={{ ...styles.value, marginBottom: 0 }}>{projectName}</Text>
          </>
        )}
      </Section>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={payUrl} style={styles.button}>
          Pay Now
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        If you've already sent payment, please disregard this reminder. For questions, contact{" "}
        <Link href={`mailto:${developerEmail}`} style={styles.link}>
          {developerEmail}
        </Link>
      </Text>

      <Text style={styles.muted}>
        — {developerName}
      </Text>
    </EmailLayout>
  );
}