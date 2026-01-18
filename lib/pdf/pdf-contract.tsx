import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";

// Register fonts for better typography
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2",
      fontWeight: 700,
    },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Inter",
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logo: {
    maxWidth: 150,
    maxHeight: 50,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1a1a",
  },
  businessInfo: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },
  contractTitle: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  contractMeta: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    color: "#1a1a1a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.7,
    marginBottom: 10,
    textAlign: "justify",
  },
  partiesGrid: {
    flexDirection: "row",
    marginBottom: 30,
  },
  partyBox: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    marginHorizontal: 5,
  },
  partyLabel: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  partyName: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
  },
  partyDetail: {
    fontSize: 10,
    color: "#4b5563",
  },
  signatureSection: {
    marginTop: 40,
    paddingTop: 30,
    borderTop: "2px solid #e5e7eb",
  },
  signatureGrid: {
    flexDirection: "row",
    marginTop: 20,
  },
  signatureBox: {
    flex: 1,
    marginHorizontal: 10,
  },
  signatureLabel: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  signatureLine: {
    borderBottom: "1px solid #d1d5db",
    height: 60,
    marginBottom: 8,
    justifyContent: "flex-end",
    paddingBottom: 5,
  },
  signatureImage: {
    maxHeight: 50,
    maxWidth: 200,
    objectFit: "contain",
  },
  signatureText: {
    fontSize: 18,
    fontFamily: "Times-Italic",
    color: "#1a1a1a",
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 600,
  },
  signatureDate: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  auditTrail: {
    marginTop: 40,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  auditTitle: {
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 10,
    color: "#4b5563",
  },
  auditRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  auditLabel: {
    fontSize: 9,
    color: "#6b7280",
    width: 100,
  },
  auditValue: {
    fontSize: 9,
    color: "#1a1a1a",
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  pageNumber: {
    fontSize: 8,
    color: "#9ca3af",
  },
  statusBadgeSigned: {
    position: "absolute",
    top: 50,
    right: 50,
    backgroundColor: "#10b981",
    color: "#ffffff",
    padding: "4 12",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
  },
  statusBadgeDraft: {
    position: "absolute",
    top: 50,
    right: 50,
    backgroundColor: "#6b7280",
    color: "#ffffff",
    padding: "4 12",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
  },
});

// Contract PDF component
interface ContractPDFProps {
  contract: {
    id: string;
    name: string;
    content: string;
    status: string;
    signedAt?: Date | null;
    clientSignature?: string | null;
    clientIp?: string | null;
    createdAt: Date;
  };
  client: {
    name: string;
    email: string;
    company?: string | null;
  };
  developer: {
    name: string;
    email: string;
    businessName?: string | null;
    businessAddress?: string | null;
    logoUrl?: string | null;
  };
  project?: {
    name: string;
  } | null;
}

function ContractPDF({ contract, client, developer, project }: ContractPDFProps) {
  const isSigned = contract.status === "signed" && contract.signedAt;
  const isDrawnSignature = contract.clientSignature?.startsWith("data:image");

  // Parse content - assuming it's stored with section markers
  const renderContent = () => {
    // Split content by double newlines for paragraphs
    const paragraphs = contract.content.split(/\n\n+/);
    
    return paragraphs.map((para, index) => {
      // Check if it's a section header (starts with ## or is all caps)
      const isHeader = para.startsWith("##") || /^[A-Z\s]{10,}$/.test(para.trim());
      
      if (isHeader) {
        return (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {para.replace(/^#+\s*/, "").trim()}
            </Text>
          </View>
        );
      }
      
      return (
        <Text key={index} style={styles.paragraph}>
          {para.trim()}
        </Text>
      );
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Status Badge */}
        <Text style={isSigned ? styles.statusBadgeSigned : styles.statusBadgeDraft}>
          {isSigned ? "SIGNED" : contract.status.toUpperCase()}
        </Text>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              {developer.logoUrl ? (
                <Image src={developer.logoUrl} style={styles.logo} />
              ) : (
                <Text style={styles.businessName}>
                  {developer.businessName || developer.name}
                </Text>
              )}
              {developer.businessAddress && (
                <Text style={styles.businessInfo}>{developer.businessAddress}</Text>
              )}
              <Text style={styles.businessInfo}>{developer.email}</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.contractTitle}>{contract.name}</Text>
        <Text style={styles.contractMeta}>
          {project ? `Project: ${project.name} • ` : ""}
          Created: {formatDate(contract.createdAt)}
        </Text>

        {/* Parties */}
        <View style={styles.partiesGrid}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Developer</Text>
            <Text style={styles.partyName}>
              {developer.businessName || developer.name}
            </Text>
            <Text style={styles.partyDetail}>{developer.email}</Text>
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Client</Text>
            <Text style={styles.partyName}>{client.name}</Text>
            {client.company && (
              <Text style={styles.partyDetail}>{client.company}</Text>
            )}
            <Text style={styles.partyDetail}>{client.email}</Text>
          </View>
        </View>

        {/* Contract Content */}
        {renderContent()}

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Signatures</Text>
          <View style={styles.signatureGrid}>
            {/* Developer Signature (placeholder) */}
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Developer</Text>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureText}>
                  {developer.businessName || developer.name}
                </Text>
              </View>
              <Text style={styles.signatureName}>
                {developer.businessName || developer.name}
              </Text>
              <Text style={styles.signatureDate}>
                Date: {formatDate(contract.createdAt)}
              </Text>
            </View>

            {/* Client Signature */}
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Client</Text>
              <View style={styles.signatureLine}>
                {isSigned && contract.clientSignature ? (
                  isDrawnSignature ? (
                    <Image
                      src={contract.clientSignature}
                      style={styles.signatureImage}
                    />
                  ) : (
                    <Text style={styles.signatureText}>
                      {contract.clientSignature}
                    </Text>
                  )
                ) : null}
              </View>
              <Text style={styles.signatureName}>{client.name}</Text>
              <Text style={styles.signatureDate}>
                Date: {isSigned && contract.signedAt ? formatDate(contract.signedAt) : "_______________"}
              </Text>
            </View>
          </View>
        </View>

        {/* Audit Trail (only for signed contracts) */}
        {isSigned && (
          <View style={styles.auditTrail}>
            <Text style={styles.auditTitle}>Audit Trail</Text>
            <View style={styles.auditRow}>
              <Text style={styles.auditLabel}>Document ID:</Text>
              <Text style={styles.auditValue}>{contract.id}</Text>
            </View>
            <View style={styles.auditRow}>
              <Text style={styles.auditLabel}>Signed By:</Text>
              <Text style={styles.auditValue}>{client.name} ({client.email})</Text>
            </View>
            <View style={styles.auditRow}>
              <Text style={styles.auditLabel}>Signed At:</Text>
              <Text style={styles.auditValue}>
                {contract.signedAt ? formatDateTime(contract.signedAt) : "N/A"}
              </Text>
            </View>
            {contract.clientIp && (
              <View style={styles.auditRow}>
                <Text style={styles.auditLabel}>IP Address:</Text>
                <Text style={styles.auditValue}>{contract.clientIp}</Text>
              </View>
            )}
            <View style={styles.auditRow}>
              <Text style={styles.auditLabel}>Signature Type:</Text>
              <Text style={styles.auditValue}>
                {isDrawnSignature ? "Drawn signature" : "Typed signature"}
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by Zovo • {contract.name}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

// Helper functions
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Generate PDF buffer for a contract
 */
export async function generateContractPDF(props: ContractPDFProps): Promise<Buffer> {
  const buffer = await renderToBuffer(<ContractPDF {...props} />);
  return buffer;
}

/**
 * Generate filename for contract PDF
 */
export function generateContractFilename(contractName: string, clientName: string): string {
  const sanitize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").slice(0, 50);
  
  const date = new Date().toISOString().split("T")[0];
  return `${sanitize(contractName)}-${sanitize(clientName)}-${date}.pdf`;
}