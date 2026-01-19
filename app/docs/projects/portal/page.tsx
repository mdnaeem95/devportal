import Link from "next/link";
import { Metadata, Route } from "next";
import { Eye, Link as LinkIcon, CheckCircle2, AlertCircle, Zap, ArrowRight, FileText, CreditCard, Clock, Package, Shield, Copy } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Client Portal",
  description: "Share project status with clients through a secure, no-login-required portal.",
};

export default function ClientPortalPage() {
  return (
    <DocsLayout pathname="/docs/projects/portal">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Client Portal</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Give your clients a dedicated portal to view project progress, download files, and see 
        invoices — no login required.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        
        <p className="mb-4">
          Every project in Zovo has a unique public portal URL that you can share with your client. 
          The portal provides a professional, read-only view of:
        </p>

        <div className="not-prose grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: Eye, label: "Project overview", desc: "Name, description, dates" },
            { icon: CheckCircle2, label: "Milestone progress", desc: "Status and completion" },
            { icon: CreditCard, label: "Invoice history", desc: "Sent and paid invoices" },
            { icon: Package, label: "Deliverables", desc: "Downloadable files" },
            { icon: Clock, label: "Time logs", desc: "If enabled in settings" },
            { icon: FileText, label: "Contract status", desc: "Signature status" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border/50 bg-card/50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Getting the portal link */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="getting-link">Getting the Portal Link</h2>
        
        <p className="mb-4">
          To get your project's portal link:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the project detail page</li>
          <li>Look for the <strong>Share</strong> or <strong>Client Portal</strong> button</li>
          <li>Click to copy the link to your clipboard</li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <LinkIcon className="h-4 w-4" />
            Portal URL format
          </h4>
          <div className="flex items-center gap-2 p-2 rounded bg-secondary font-mono text-sm">
            <span className="text-muted-foreground">https://zovo.dev/p/</span>
            <span className="text-primary">abc123xyz</span>
            <button className="ml-auto text-muted-foreground hover:text-foreground">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Each project has a unique, unguessable ID that serves as the portal URL.
          </p>
        </div>
      </section>

      {/* What clients see */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="what-clients-see">What Clients See</h2>
        
        <p className="mb-4">
          The client portal is designed to be clean and informative:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-secondary/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Website Redesign Project</h4>
                <p className="text-sm text-muted-foreground">Acme Corp</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-success">50% Complete</p>
                <p className="text-xs text-muted-foreground">2 of 4 milestones</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-success" />
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">Jan 15, 2026</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target Completion</p>
              <p className="font-medium">Mar 15, 2026</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Portal sections</h3>
        
        <ul className="mb-4 space-y-3">
          <li>
            <strong>Overview</strong> — Project name, client name, dates, and overall progress
          </li>
          <li>
            <strong>Milestones</strong> — List of all milestones with status indicators (pending, in progress, completed)
          </li>
          <li>
            <strong>Invoices</strong> — All invoices with status and payment links for unpaid ones
          </li>
          <li>
            <strong>Files</strong> — Downloadable deliverables organized by milestone or category
          </li>
          <li>
            <strong>Time Log</strong> — (Optional) Detailed time entries if transparency is enabled
          </li>
        </ul>
      </section>

      {/* No login required */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="no-login">No Login Required</h2>
        
        <p className="mb-4">
          Clients access the portal using only the link — no account creation or login needed. This 
          makes it easy for clients to:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Check project status anytime</li>
          <li>• Download files immediately</li>
          <li>• Pay invoices with one click</li>
          <li>• Share access with their team</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Why no login?
          </h4>
          <p className="text-sm text-muted-foreground">
            We've found that requiring clients to create accounts creates friction and reduces 
            engagement. The secure unique URL provides sufficient access control for most use cases.
          </p>
        </div>
      </section>

      {/* Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="security">Security</h2>
        
        <p className="mb-4">
          Portal links are designed to be secure:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Unguessable IDs</h4>
              <p className="text-sm text-muted-foreground">
                Portal URLs use cryptographically random IDs that can't be guessed or enumerated.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Read-only access</h4>
              <p className="text-sm text-muted-foreground">
                Clients can only view information — they cannot modify projects, milestones, or files.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">HTTPS encrypted</h4>
              <p className="text-sm text-muted-foreground">
                All portal access is encrypted in transit.
              </p>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Keep links private
          </h4>
          <p className="text-sm text-muted-foreground">
            Anyone with the portal link can view the project. Share links only with your client and 
            advise them not to post the URL publicly.
          </p>
        </div>
      </section>

      {/* Controlling visibility */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="visibility">Controlling What's Visible</h2>
        
        <p className="mb-4">
          You can control what appears in the client portal:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
            <div>
              <h4 className="font-medium text-sm">Time logs</h4>
              <p className="text-xs text-muted-foreground">Show detailed time entries</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-secondary">Configurable</span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
            <div>
              <h4 className="font-medium text-sm">Milestones</h4>
              <p className="text-xs text-muted-foreground">Progress and status</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Always visible</span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
            <div>
              <h4 className="font-medium text-sm">Invoices</h4>
              <p className="text-xs text-muted-foreground">Sent invoices only</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Always visible</span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
            <div>
              <h4 className="font-medium text-sm">Deliverables</h4>
              <p className="text-xs text-muted-foreground">Uploaded files</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Always visible</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Configure time log visibility in{" "}
          <Link href="/docs/time-tracking/client-view" className="text-primary hover:underline">
            Time Tracking settings
          </Link>.
        </p>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Creating projects", href: "/docs/projects" as Route },
            { title: "Project milestones", href: "/docs/projects/milestones" as Route },
            { title: "Time tracking visibility", href: "/docs/time-tracking/client-view" as Route },
            { title: "Deliverables", href: "/docs/deliverables" as Route },
          ].map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border hover:bg-card/50 transition-colors group"
            >
              <span className="text-sm">{topic.title}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
}
