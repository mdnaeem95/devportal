import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/providers";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Zoho",
    template: "%s | Zoho",
  },
  description:
    "The professional backend for freelance developers who work with direct clients.",
  keywords: [
    "freelance",
    "developer",
    "invoicing",
    "contracts",
    "client management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen antialiased">
          <TRPCProvider>{children}</TRPCProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
