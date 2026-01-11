"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFDownloadButtonProps extends Omit<ButtonProps, "onClick"> {
  url: string;
  filename?: string;
  children?: React.ReactNode;
}

export function PDFDownloadButton({
  url,
  filename,
  children,
  className,
  variant = "outline",
  size = "default",
  ...props
}: PDFDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // Get filename from Content-Disposition header or use provided filename
      let downloadFilename = filename || "document.pdf";
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      }

      // Create download link and click it
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
      // Could add toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleDownload}
      disabled={isDownloading}
      {...props}
    >
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        children || (
          <>
            <Download className="h-4 w-4" />
            Download PDF
          </>
        )
      )}
    </Button>
  );
}

// Specific button for contracts
interface ContractPDFButtonProps extends Omit<ButtonProps, "onClick"> {
  contractId: string;
  signToken?: string | null;
}

export function ContractPDFButton({
  contractId,
  signToken,
  ...props
}: ContractPDFButtonProps) {
  const url = signToken
    ? `/api/contracts/${contractId}/pdf?token=${signToken}`
    : `/api/contracts/${contractId}/pdf`;

  return (
    <PDFDownloadButton url={url} {...props}>
      <FileText className="h-4 w-4" />
      Download Contract
    </PDFDownloadButton>
  );
}

// Specific button for invoices
interface InvoicePDFButtonProps extends Omit<ButtonProps, "onClick"> {
  invoiceId: string;
  payToken?: string | null;
}

export function InvoicePDFButton({
  invoiceId,
  payToken,
  ...props
}: InvoicePDFButtonProps) {
  const url = payToken
    ? `/api/invoices/${invoiceId}/pdf?token=${payToken}`
    : `/api/invoices/${invoiceId}/pdf`;

  return (
    <PDFDownloadButton url={url} {...props}>
      <FileText className="h-4 w-4" />
      Download Invoice
    </PDFDownloadButton>
  );
}