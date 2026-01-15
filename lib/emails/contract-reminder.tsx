import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ContractReminderEmailProps {
  clientName: string;
  contractName: string;
  projectName?: string;
  developerName: string;
  developerEmail: string;
  signUrl: string;
  expiresAt?: string;
  sentAt: string;
  customMessage?: string;
  businessName?: string;
  businessLogo?: string;
  reminderNumber: number;
}

// Props for the send function includes recipient email
interface SendContractReminderEmailParams extends ContractReminderEmailProps {
  toEmail: string;
}

export const ContractReminderEmail = ({
  clientName,
  contractName,
  projectName,
  developerName,
  developerEmail,
  signUrl,
  expiresAt,
  sentAt,
  customMessage,
  businessName,
  businessLogo,
  reminderNumber,
}: ContractReminderEmailProps) => {
  const previewText = `Reminder: "${contractName}" is awaiting your signature`;
  const displayName = businessName || developerName;
  
  // Determine urgency messaging
  const isUrgent = expiresAt && expiresAt.includes("day") && parseInt(expiresAt) <= 5;
  const urgencyColor = isUrgent ? "#ef4444" : "#f59e0b";
  
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with logo */}
          {businessLogo ? (
            <Img
              src={businessLogo}
              width="120"
              height="40"
              alt={displayName}
              style={logo}
            />
          ) : (
            <Text style={logoText}>{displayName}</Text>
          )}

          {/* Reminder Badge */}
          <Section style={reminderBadge}>
            <Text style={reminderBadgeText}>
              ⏰ Reminder {reminderNumber > 1 ? `#${reminderNumber}` : ""}
            </Text>
          </Section>

          <Heading style={heading}>
            Your signature is still needed
          </Heading>

          <Text style={paragraph}>
            Hi {clientName},
          </Text>

          <Text style={paragraph}>
            This is a friendly reminder that <strong>"{contractName}"</strong>
            {projectName && ` for ${projectName}`} was sent to you {sentAt} and is still awaiting your signature.
          </Text>

          {/* Custom message from developer */}
          {customMessage && (
            <Section style={customMessageBox}>
              <Text style={customMessageLabel}>Message from {developerName}:</Text>
              <Text style={customMessageText}>"{customMessage}"</Text>
            </Section>
          )}

          {/* Expiry warning */}
          {expiresAt && (
            <Section style={{ ...expiryBox, borderColor: urgencyColor }}>
              <Text style={{ ...expiryText, color: urgencyColor }}>
                ⚠️ This contract expires on {expiresAt}
              </Text>
            </Section>
          )}

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Button style={button} href={signUrl}>
              Review & Sign Contract
            </Button>
          </Section>

          <Text style={paragraph}>
            If you have any questions about the contract, please reply to this email
            or contact {developerName} directly at{" "}
            <Link href={`mailto:${developerEmail}`} style={link}>
              {developerEmail}
            </Link>.
          </Text>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            This reminder was sent by {displayName} via Zovo.
            <br />
            <Link href={signUrl} style={footerLink}>
              View contract
            </Link>
            {" • "}
            <Link href={`mailto:${developerEmail}`} style={footerLink}>
              Contact {developerName}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  marginBottom: "64px",
  maxWidth: "600px",
  borderRadius: "8px",
};

const logo = {
  margin: "0 auto 24px",
  display: "block" as const,
};

const logoText = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  textAlign: "center" as const,
  margin: "0 0 24px",
  color: "#1a1a1a",
};

const reminderBadge = {
  backgroundColor: "#fef3c7",
  borderRadius: "6px",
  padding: "8px 16px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const reminderBadgeText = {
  color: "#92400e",
  fontSize: "14px",
  fontWeight: "600" as const,
  margin: "0",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  textAlign: "center" as const,
  margin: "0 0 24px",
  color: "#1a1a1a",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#4a5568",
  margin: "0 0 16px",
};

const customMessageBox = {
  backgroundColor: "#f0f9ff",
  border: "1px solid #bae6fd",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const customMessageLabel = {
  fontSize: "12px",
  fontWeight: "600" as const,
  color: "#0369a1",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const customMessageText = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#0c4a6e",
  margin: "0",
  fontStyle: "italic" as const,
};

const expiryBox = {
  backgroundColor: "#fffbeb",
  border: "2px solid #f59e0b",
  borderRadius: "8px",
  padding: "12px 16px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const expiryText = {
  fontSize: "14px",
  fontWeight: "600" as const,
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#7c3aed",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const link = {
  color: "#7c3aed",
  textDecoration: "underline",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  textAlign: "center" as const,
};

const footerLink = {
  color: "#6b7280",
  textDecoration: "underline",
};

export default ContractReminderEmail;

// Export the send function for use in the router
export async function sendContractReminderEmail(params: SendContractReminderEmailParams) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { toEmail, ...emailProps } = params;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Zovo <noreply@zovo.dev>",
    to: toEmail,
    replyTo: params.developerEmail,
    subject: `Reminder: "${params.contractName}" is awaiting your signature`,
    react: ContractReminderEmail(emailProps),
  });
}