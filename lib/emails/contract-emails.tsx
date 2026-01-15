import { Button, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./email-layout";

// ============================================
// Contract Sent for Signature
// ============================================

interface ContractSentEmailProps {
  clientName: string;
  contractName: string;
  projectName?: string;
  developerName: string;
  developerEmail: string;
  signUrl: string;
  expiresAt?: string;
  businessName?: string;
  businessLogo?: string;
  developerSigned?: boolean; // NEW: Optional flag for sequential signing
}

export function ContractSentEmail({
  clientName,
  contractName,
  projectName,
  developerName,
  developerEmail,
  signUrl,
  expiresAt,
  businessName,
  businessLogo,
  developerSigned,
}: ContractSentEmailProps) {
  return (
    <EmailLayout
      preview={`${developerName} sent you a contract to sign`}
      businessName={businessName}
      businessLogo={businessLogo}
    >
      <Text style={styles.heading}>Contract Ready for Signature</Text>
      
      <Text style={styles.paragraph}>Hi {clientName},</Text>
      
      <Text style={styles.paragraph}>
        {developerName} has sent you a contract for your review and signature.
      </Text>

      {/* NEW: Show if developer has already signed */}
      {developerSigned && (
        <Section style={developerSignedBadge}>
          <Text style={developerSignedText}>
            ✓ {developerName} has already signed this contract
          </Text>
        </Section>
      )}

      <Section style={styles.card}>
        <Text style={styles.label}>Contract</Text>
        <Text style={styles.value}>{contractName}</Text>
        
        {projectName && (
          <>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{projectName}</Text>
          </>
        )}
        
        <Text style={styles.label}>From</Text>
        <Text style={{ ...styles.value, marginBottom: 0 }}>{developerName}</Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={signUrl} style={styles.button}>
          Review & Sign Contract
        </Button>
      </Section>

      {expiresAt && (
        <Text style={styles.muted}>
          This contract will expire on {expiresAt}. Please review and sign before then.
        </Text>
      )}

      <Text style={styles.paragraph}>
        If you have any questions about this contract, please contact{" "}
        <Link href={`mailto:${developerEmail}`} style={styles.link}>
          {developerEmail}
        </Link>
      </Text>
    </EmailLayout>
  );
}

// Styles for developer signed badge
const developerSignedBadge = {
  backgroundColor: "#dcfce7",
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "24px",
};

const developerSignedText = {
  color: "#166534",
  fontSize: "14px",
  fontWeight: "600" as const,
  margin: "0",
  textAlign: "center" as const,
};

// ============================================
// Contract Signed - To Client
// ============================================

interface ContractSignedClientEmailProps {
  clientName: string;
  contractName: string;
  projectName?: string;
  developerName: string;
  signedAt: string;
  viewUrl: string;
  businessName?: string;
  businessLogo?: string;
}

export function ContractSignedClientEmail({
  clientName,
  contractName,
  projectName,
  developerName,
  signedAt,
  viewUrl,
  businessName,
  businessLogo,
}: ContractSignedClientEmailProps) {
  return (
    <EmailLayout
      preview={`Contract signed successfully`}
      businessName={businessName}
      businessLogo={businessLogo}
    >
      <Text style={styles.heading}>Contract Signed ✓</Text>
      
      <Text style={styles.paragraph}>Hi {clientName},</Text>
      
      <Text style={styles.paragraph}>
        Thank you for signing the contract. Both parties now have a copy of the signed agreement.
      </Text>

      <Section style={styles.card}>
        <Text style={styles.label}>Contract</Text>
        <Text style={styles.value}>{contractName}</Text>
        
        {projectName && (
          <>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{projectName}</Text>
          </>
        )}
        
        <Text style={styles.label}>Signed On</Text>
        <Text style={{ ...styles.value, marginBottom: 0 }}>{signedAt}</Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={viewUrl} style={styles.buttonSecondary}>
          View Contract
        </Button>
      </Section>

      <Text style={styles.paragraph}>
        Looking forward to working together!
      </Text>

      <Text style={styles.muted}>
        — {developerName}
      </Text>
    </EmailLayout>
  );
}

// ============================================
// Contract Signed - To Developer
// ============================================

interface ContractSignedDeveloperEmailProps {
  developerName: string;
  clientName: string;
  clientEmail: string;
  contractName: string;
  projectName?: string;
  signedAt: string;
  viewUrl: string;
}

export function ContractSignedDeveloperEmail({
  developerName,
  clientName,
  clientEmail,
  contractName,
  projectName,
  signedAt,
  viewUrl,
}: ContractSignedDeveloperEmailProps) {
  return (
    <EmailLayout preview={`${clientName} signed your contract`}>
      <Text style={styles.heading}>Contract Signed! 🎉</Text>
      
      <Text style={styles.paragraph}>Hi {developerName},</Text>
      
      <Text style={styles.paragraph}>
        Great news! <strong>{clientName}</strong> has signed the contract.
      </Text>

      <Section style={styles.card}>
        <Text style={styles.label}>Contract</Text>
        <Text style={styles.value}>{contractName}</Text>
        
        {projectName && (
          <>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{projectName}</Text>
          </>
        )}
        
        <Text style={styles.label}>Client</Text>
        <Text style={styles.value}>{clientName}</Text>
        
        <Text style={styles.label}>Signed On</Text>
        <Text style={{ ...styles.value, marginBottom: 0 }}>{signedAt}</Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={viewUrl} style={styles.button}>
          View Signed Contract
        </Button>
      </Section>

      <Text style={styles.muted}>
        You're all set to start the project. Both parties have received a copy of the signed contract.
      </Text>
    </EmailLayout>
  );
}

// ============================================
// Contract Declined
// ============================================

interface ContractDeclinedEmailProps {
  developerName: string;
  clientName: string;
  clientEmail: string;
  contractName: string;
  projectName?: string;
  viewUrl: string;
}

export function ContractDeclinedEmail({
  developerName,
  clientName,
  clientEmail,
  contractName,
  projectName,
  viewUrl,
}: ContractDeclinedEmailProps) {
  return (
    <EmailLayout preview={`${clientName} declined the contract`}>
      <Text style={styles.heading}>Contract Declined</Text>
      
      <Text style={styles.paragraph}>Hi {developerName},</Text>
      
      <Text style={styles.paragraph}>
        <strong>{clientName}</strong> has declined to sign the contract.
      </Text>

      <Section style={styles.card}>
        <Text style={styles.label}>Contract</Text>
        <Text style={styles.value}>{contractName}</Text>
        
        {projectName && (
          <>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{projectName}</Text>
          </>
        )}
        
        <Text style={styles.label}>Client</Text>
        <Text style={{ ...styles.value, marginBottom: 0 }}>{clientName}</Text>
      </Section>

      <Text style={styles.paragraph}>
        You may want to reach out to discuss any concerns. Contact them at{" "}
        <Link href={`mailto:${clientEmail}`} style={styles.link}>
          {clientEmail}
        </Link>
      </Text>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={viewUrl} style={styles.buttonSecondary}>
          View Contract
        </Button>
      </Section>
    </EmailLayout>
  );
}