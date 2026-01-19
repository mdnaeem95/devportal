import { BookOpen, Users, FolderKanban, FileText, CreditCard, Clock, Package, Settings,
  Code, HelpCircle, type LucideIcon } from "lucide-react";

export interface DocPage {
  title: string;
  href: string;
  description?: string;
}

export interface DocSection {
  title: string;
  icon: LucideIcon;
  pages: DocPage[];
}

export const docsNavigation: DocSection[] = [
  {
    title: "Getting Started",
    icon: BookOpen,
    pages: [
      { title: "Introduction", href: "/docs", description: "Welcome to Zovo" },
      { title: "Quick Start", href: "/docs/quick-start", description: "Get up and running in 5 minutes" },
      { title: "Account Setup", href: "/docs/account-setup", description: "Configure your account and business info" },
      { title: "Connecting Stripe", href: "/docs/stripe-setup", description: "Set up payments with Stripe Connect" },
    ],
  },
  {
    title: "Clients",
    icon: Users,
    pages: [
      { title: "Managing Clients", href: "/docs/clients", description: "Add and organize your clients" },
      { title: "Client Status", href: "/docs/clients/status", description: "Track leads, active, and inactive clients" },
      { title: "Payment Behavior", href: "/docs/clients/payment-behavior", description: "Understand client payment patterns" },
      { title: "Follow-up Reminders", href: "/docs/clients/reminders", description: "Never lose touch with clients" },
    ],
  },
  {
    title: "Projects",
    icon: FolderKanban,
    pages: [
      { title: "Creating Projects", href: "/docs/projects", description: "Set up projects with milestones" },
      { title: "Milestones", href: "/docs/projects/milestones", description: "Track progress and payments" },
      { title: "Client Portal", href: "/docs/projects/portal", description: "Share project status with clients" },
      { title: "Project Templates", href: "/docs/projects/templates", description: "Reuse project structures" },
    ],
  },
  {
    title: "Contracts",
    icon: FileText,
    pages: [
      { title: "Creating Contracts", href: "/docs/contracts", description: "Build professional contracts" },
      { title: "Templates & Variables", href: "/docs/contracts/templates", description: "Use dynamic contract templates" },
      { title: "E-Signatures", href: "/docs/contracts/signatures", description: "Legally binding electronic signatures" },
      { title: "Sequential Signing", href: "/docs/contracts/sequential", description: "Sign before your client" },
      { title: "Reminders & Expiry", href: "/docs/contracts/reminders", description: "Automated follow-ups" },
    ],
  },
  {
    title: "Invoicing",
    icon: CreditCard,
    pages: [
      { title: "Creating Invoices", href: "/docs/invoices", description: "Generate professional invoices" },
      { title: "Line Items & Tax", href: "/docs/invoices/line-items", description: "Configure invoice details" },
      { title: "Partial Payments", href: "/docs/invoices/partial-payments", description: "Accept deposits and installments" },
      { title: "Payment Reminders", href: "/docs/invoices/reminders", description: "Automated payment follow-ups" },
      { title: "Multi-Currency", href: "/docs/invoices/currency", description: "Bill in different currencies" },
    ],
  },
  {
    title: "Time Tracking",
    icon: Clock,
    pages: [
      { title: "Overview", href: "/docs/time-tracking", description: "Track billable hours" },
      { title: "Timer & Manual Entries", href: "/docs/time-tracking/entries", description: "Log time your way" },
      { title: "Anti-Abuse Features", href: "/docs/time-tracking/integrity", description: "Build client trust" },
      { title: "Invoicing from Time", href: "/docs/time-tracking/invoicing", description: "Convert time to invoices" },
      { title: "Client Visibility", href: "/docs/time-tracking/client-view", description: "Transparency settings" },
    ],
  },
  {
    title: "Deliverables",
    icon: Package,
    pages: [
      { title: "Overview", href: "/docs/deliverables", description: "Share files with clients" },
      { title: "Uploading Files", href: "/docs/deliverables/uploads", description: "Upload and organize files" },
      { title: "GitHub Integration", href: "/docs/deliverables/github", description: "Link repositories to projects" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    pages: [
      { title: "Business Profile", href: "/docs/settings", description: "Configure your business info" },
      { title: "Branding & Logo", href: "/docs/settings/branding", description: "Customize your appearance" },
      { title: "Notifications", href: "/docs/settings/notifications", description: "Email preferences" },
      { title: "Stripe Connect", href: "/docs/settings/stripe", description: "Manage payment settings" },
    ],
  },
  {
    title: "API Reference",
    icon: Code,
    pages: [
      { title: "Introduction", href: "/docs/api", description: "API overview and authentication" },
      { title: "Clients API", href: "/docs/api/clients", description: "Manage clients programmatically" },
      { title: "Projects API", href: "/docs/api/projects", description: "Project endpoints" },
      { title: "Invoices API", href: "/docs/api/invoices", description: "Invoice management" },
      { title: "Webhooks", href: "/docs/api/webhooks", description: "Real-time event notifications" },
    ],
  },
  {
    title: "Resources",
    icon: HelpCircle,
    pages: [
      { title: "FAQ", href: "/docs/faq", description: "Frequently asked questions" },
      { title: "Keyboard Shortcuts", href: "/docs/shortcuts", description: "Work faster with shortcuts" },
      { title: "Changelog", href: "/docs/changelog", description: "What's new in Zovo" },
      { title: "Contact Support", href: "/docs/support", description: "Get help from our team" },
    ],
  },
];

// Helper to find current page and section
export function findCurrentDoc(pathname: string) {
  for (const section of docsNavigation) {
    for (const page of section.pages) {
      if (page.href === pathname) {
        return { section, page };
      }
    }
  }
  return null;
}

// Helper to get previous and next pages for navigation
export function getAdjacentPages(pathname: string) {
  const allPages = docsNavigation.flatMap((section) => section.pages);
  const currentIndex = allPages.findIndex((page) => page.href === pathname);
  
  return {
    prev: currentIndex > 0 ? allPages[currentIndex - 1] : null,
    next: currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null,
  };
}

// Helper to get all pages for search
export function getAllDocPages() {
  return docsNavigation.flatMap((section) =>
    section.pages.map((page) => ({
      ...page,
      section: section.title,
    }))
  );
}