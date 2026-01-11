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

// Register fonts
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

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Inter",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  logo: {
    maxWidth: 150,
    maxHeight: 50,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 700,
  },
  businessInfo: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
    maxWidth: 200,
  },
  invoiceTitle: {
    textAlign: "right",
  },
  invoiceLabel: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1a1a1a",
  },
  invoiceNumber: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  statusBadgePaid: {
    marginTop: 8,
    backgroundColor: "#10b981",
    color: "#ffffff",
    padding: "4 12",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
    alignSelf: "flex-end",
  },
  statusBadgeUnpaid: {
    marginTop: 8,
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    padding: "4 12",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
    alignSelf: "flex-end",
  },
  statusBadgeOverdue: {
    marginTop: 8,
    backgroundColor: "#ef4444",
    color: "#ffffff",
    padding: "4 12",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
    alignSelf: "flex-end",
  },
  partiesRow: {
    flexDirection: "row",
    marginBottom: 30,
  },
  partyBox: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  partyName: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
  },
  partyDetail: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.5,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 30,
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 4,
  },
  detailBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: 600,
  },
  detailValuePaid: {
    fontSize: 11,
    fontWeight: 600,
    color: "#10b981",
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    padding: "10 12",
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    padding: "12 12",
    borderBottom: "1px solid #f3f4f6",
  },
  tableCell: {
    fontSize: 10,
  },
  colDescription: {
    flex: 3,
  },
  colQty: {
    width: 60,
    textAlign: "center",
  },
  colRate: {
    width: 80,
    textAlign: "right",
  },
  colAmount: {
    width: 80,
    textAlign: "right",
  },
  totalsSection: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 6,
    width: 200,
  },
  totalLabel: {
    flex: 1,
    fontSize: 10,
    color: "#6b7280",
  },
  totalValue: {
    width: 80,
    fontSize: 10,
    textAlign: "right",
  },
  grandTotal: {
    flexDirection: "row",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2px solid #1a1a1a",
    width: 200,
  },
  grandTotalLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: 700,
  },
  grandTotalValue: {
    width: 80,
    fontSize: 14,
    fontWeight: 700,
    textAlign: "right",
  },
  grandTotalValuePaid: {
    width: 80,
    fontSize: 14,
    fontWeight: 700,
    textAlign: "right",
    color: "#10b981",
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
});

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoicePDFProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
    lineItems: LineItem[];
    subtotal: number;
    tax: number;
    taxRate?: string | null;
    total: number;
    currency: string;
    dueDate: Date;
    paidAt?: Date | null;
    notes?: string | null;
    createdAt: Date;
  };
  client: {
    name: string;
    email: string;
    company?: string | null;
    address?: string | null;
  };
  developer: {
    name: string;
    email: string;
    businessName?: string | null;
    businessAddress?: string | null;
    logoUrl?: string | null;
    taxId?: string | null;
  };
  project?: {
    name: string;
  } | null;
}

function InvoicePDF({ invoice, client, developer, project }: InvoicePDFProps) {
  const isPaid = invoice.status === "paid";
  const isOverdue = !isPaid && new Date(invoice.dueDate) < new Date();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Determine which status badge style to use
  const getStatusBadgeStyle = () => {
    if (isPaid) return styles.statusBadgePaid;
    if (isOverdue) return styles.statusBadgeOverdue;
    return styles.statusBadgeUnpaid;
  };

  const getStatusText = () => {
    if (isPaid) return "PAID";
    if (isOverdue) return "OVERDUE";
    return "UNPAID";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
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
            {developer.taxId && (
              <Text style={styles.businessInfo}>Tax ID: {developer.taxId}</Text>
            )}
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={getStatusBadgeStyle()}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesRow}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{client.name}</Text>
            {client.company && (
              <Text style={styles.partyDetail}>{client.company}</Text>
            )}
            <Text style={styles.partyDetail}>{client.email}</Text>
            {client.address && (
              <Text style={styles.partyDetail}>{client.address}</Text>
            )}
          </View>
          <View style={styles.partyBox}>
            {project && (
              <>
                <Text style={styles.partyLabel}>Project</Text>
                <Text style={styles.partyName}>{project.name}</Text>
              </>
            )}
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Invoice Date</Text>
            <Text style={styles.detailValue}>{formatDate(invoice.createdAt)}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{formatDate(invoice.dueDate)}</Text>
          </View>
          {isPaid && invoice.paidAt && (
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Paid Date</Text>
              <Text style={styles.detailValuePaid}>
                {formatDate(invoice.paidAt)}
              </Text>
            </View>
          )}
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>
          {invoice.lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableCell, styles.colAmount]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Tax {invoice.taxRate && `(${invoice.taxRate}%)`}
              </Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.tax)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={isPaid ? styles.grandTotalValuePaid : styles.grandTotalValue}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by DevPortal • Invoice {invoice.invoiceNumber}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generate PDF buffer for an invoice
 */
export async function generateInvoicePDF(props: InvoicePDFProps): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoicePDF {...props} />);
  return buffer;
}

/**
 * Generate filename for invoice PDF
 */
export function generateInvoiceFilename(invoiceNumber: string, clientName: string): string {
  const sanitize = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").slice(0, 50);
  
  return `invoice-${invoiceNumber.toLowerCase()}-${sanitize(clientName)}.pdf`;
}