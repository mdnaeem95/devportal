import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Documentation",
    template: "%s | Zovo Docs",
  },
  description: "Learn how to use Zovo to manage your freelance business. Guides, tutorials, and reference documentation.",
};

export default function DocsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}