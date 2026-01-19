import { Metadata } from "next";
import { Calendar, Sparkles, Bug, ArrowUp } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Changelog",
  description: "See what's new in Zovo. Latest features, improvements, and bug fixes.",
};

const changelog = [
  {
    version: "1.2.0",
    date: "January 15, 2026",
    title: "Time Tracking & Anti-Abuse Features",
    changes: [
      { type: "feature", text: "Real-time timer with keyboard shortcut (⌘T)" },
      { type: "feature", text: "Manual time entry with retroactive limits" },
      { type: "feature", text: "Time entry classification (tracked vs manual)" },
      { type: "feature", text: "Invoice creation from tracked time" },
      { type: "feature", text: "Client-visible time logs in project portal" },
      { type: "improvement", text: "Timer persists across page navigation" },
      { type: "improvement", text: "Auto-stop timer at midnight option" },
    ],
  },
  {
    version: "1.1.0",
    date: "January 8, 2026",
    title: "Deliverables & File Management",
    changes: [
      { type: "feature", text: "Drag-and-drop file uploads" },
      { type: "feature", text: "Automatic version tracking" },
      { type: "feature", text: "Download tracking for deliverables" },
      { type: "feature", text: "File categories (source code, docs, design, etc.)" },
      { type: "feature", text: "GitHub repository linking" },
      { type: "improvement", text: "100MB file size limit" },
      { type: "fix", text: "Fixed file preview for large PDFs" },
    ],
  },
  {
    version: "1.0.0",
    date: "January 1, 2026",
    title: "Public Launch",
    changes: [
      { type: "feature", text: "Client management with status tracking" },
      { type: "feature", text: "Project and milestone management" },
      { type: "feature", text: "Contract creation with e-signatures" },
      { type: "feature", text: "Invoice generation with Stripe payments" },
      { type: "feature", text: "Public client portals" },
      { type: "feature", text: "Email notifications" },
      { type: "feature", text: "PDF generation for contracts and invoices" },
      { type: "feature", text: "Command palette (⌘K)" },
    ],
  },
  {
    version: "0.9.0",
    date: "December 15, 2025",
    title: "Beta Release",
    changes: [
      { type: "feature", text: "Initial beta with core features" },
      { type: "feature", text: "Stripe Connect integration" },
      { type: "feature", text: "Contract templates with variables" },
      { type: "improvement", text: "Dashboard analytics" },
      { type: "fix", text: "Various bug fixes from alpha testing" },
    ],
  },
];

const typeIcons = {
  feature: Sparkles,
  improvement: ArrowUp,
  fix: Bug,
};

const typeLabels = {
  feature: "New",
  improvement: "Improved",
  fix: "Fixed",
};

const typeColors = {
  feature: "text-green-600 bg-green-500/10 border-green-500/20",
  improvement: "text-blue-600 bg-blue-500/10 border-blue-500/20",
  fix: "text-orange-600 bg-orange-500/10 border-orange-500/20",
};

export default function ChangelogPage() {
  return (
    <DocsLayout pathname="/docs/changelog">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Changelog</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Stay up to date with the latest features, improvements, and fixes in Zovo.
      </p>

      {/* Legend */}
      <div className="not-prose mb-12 flex flex-wrap gap-4">
        {(["feature", "improvement", "fix"] as const).map((type) => {
          const Icon = typeIcons[type];
          return (
            <div key={type} className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeColors[type]}`}>
                <Icon className="h-3.5 w-3.5" />
                {typeLabels[type]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Changelog entries */}
      <div className="space-y-12">
        {changelog.map((release) => (
          <section key={release.version}>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl font-bold" id={`v${release.version.replace(/\./g, "-")}`}>
                v{release.version}
              </h2>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {release.date}
              </span>
            </div>
            
            <h3 className="text-lg font-medium mb-4">{release.title}</h3>

            <div className="not-prose space-y-2">
              {release.changes.map((change, index) => {
                const Icon = typeIcons[change.type as keyof typeof typeIcons];
                const colorClass = typeColors[change.type as keyof typeof typeColors];
                return (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50"
                  >
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                      {typeLabels[change.type as keyof typeof typeLabels]}
                    </span>
                    <span className="text-sm">{change.text}</span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Subscribe note */}
      <section className="not-prose mt-12">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
          <h3 className="font-medium mb-2">Stay Updated</h3>
          <p className="text-sm text-muted-foreground">
            We announce major updates via email. Make sure notifications are enabled in your{" "}
            <a href="/dashboard/settings" className="text-primary hover:underline">settings</a>.
          </p>
        </div>
      </section>
    </DocsLayout>
  );
}
