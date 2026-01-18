import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  preview: string;
  businessName?: string;
  businessLogo?: string;
  children: React.ReactNode;
}

export function EmailLayout({
  preview,
  businessName = "Zovo",
  businessLogo,
  children,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            {businessLogo ? (
              <Img
                src={businessLogo}
                width="120"
                height="40"
                alt={businessName}
                style={logo}
              />
            ) : (
              <Text style={logoText}>{businessName}</Text>
            )}
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Sent via{" "}
              <Link href="https://zovo.dev" style={footerLink}>
                Zovo
              </Link>
              {" · "}The professional backend for freelance developers
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 48px 24px",
};

const logo = {
  margin: "0 auto",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1a1a1a",
  textAlign: "center" as const,
  margin: "0",
};

const content = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 48px",
};

const footer = {
  padding: "0 48px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  margin: "0",
};

const footerLink = {
  color: "#556cd6",
  textDecoration: "none",
};

// Shared component styles for use in email templates
export const styles = {
  heading: {
    color: "#1a1a1a",
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "32px",
    margin: "0 0 16px",
  },
  paragraph: {
    color: "#525f7f",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 16px",
  },
  button: {
    backgroundColor: "#556cd6",
    borderRadius: "8px",
    color: "#fff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "100%",
    padding: "14px 28px",
    textDecoration: "none",
    textAlign: "center" as const,
  },
  buttonSecondary: {
    backgroundColor: "#f6f9fc",
    border: "1px solid #e6ebf1",
    borderRadius: "8px",
    color: "#525f7f",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "100%",
    padding: "12px 24px",
    textDecoration: "none",
    textAlign: "center" as const,
  },
  card: {
    backgroundColor: "#f6f9fc",
    borderRadius: "8px",
    padding: "24px",
    margin: "24px 0",
  },
  label: {
    color: "#8898aa",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    margin: "0 0 4px",
  },
  value: {
    color: "#1a1a1a",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  amount: {
    color: "#1a1a1a",
    fontSize: "32px",
    fontWeight: "700",
    margin: "0",
  },
  link: {
    color: "#556cd6",
    textDecoration: "none",
  },
  muted: {
    color: "#8898aa",
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0",
  },
};