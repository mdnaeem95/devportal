import Link from "next/link";
import { Metadata, Route } from "next";
import { CheckCircle2, AlertCircle, Zap, ArrowRight, Download } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "File Versioning",
  description: "Automatic version tracking when you upload updated files with the same name.",
};

export default function VersioningPage() {
  return (
    <DocsLayout pathname="/docs/deliverables/versions">
      <h1 className="text-3xl font-bold tracking-tight mb-4">File Versioning</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Zovo automatically tracks versions when you upload files with the same name. Keep a 
        complete history of deliverable revisions.
      </p>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="how-it-works">How Versioning Works</h2>
        
        <p className="mb-4">
          When you upload a file with the same name as an existing file in the same project:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Zovo detects the filename match</li>
          <li>The new file becomes the current version</li>
          <li>The previous file is preserved as an older version</li>
          <li>Version numbers increment automatically (v1, v2, v3...)</li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border/50">
            <span className="text-sm font-medium">homepage-design.fig</span>
          </div>
          <div className="divide-y divide-border/50">
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                  v3 (current)
                </span>
                <span className="text-sm">Final approved design</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Jan 18, 2026</span>
                <Download className="h-4 w-4" />
              </div>
            </div>
            <div className="p-3 flex items-center justify-between bg-secondary/20">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  v2
                </span>
                <span className="text-sm text-muted-foreground">After client feedback</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Jan 15, 2026</span>
                <Download className="h-4 w-4" />
              </div>
            </div>
            <div className="p-3 flex items-center justify-between bg-secondary/20">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  v1
                </span>
                <span className="text-sm text-muted-foreground">Initial upload</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Jan 10, 2026</span>
                <Download className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Viewing versions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="viewing">Viewing Version History</h2>
        
        <p className="mb-4">
          To see all versions of a file:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the project's <strong>Deliverables</strong> section</li>
          <li>Find the file you want to check</li>
          <li>Click the file row to expand version history</li>
          <li>Or click <strong>View History</strong> from the menu</li>
        </ol>

        <p className="mb-4">
          Files with multiple versions show a version badge indicating how many versions exist.
        </p>
      </section>

      {/* Downloading versions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="downloading">Downloading Older Versions</h2>
        
        <p className="mb-4">
          Both you and your client can download any version:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• <strong>Latest version</strong> — Main download button always gets the newest</li>
          <li>• <strong>Specific version</strong> — Expand history and click download on any version</li>
          <li>• <strong>Client portal</strong> — Clients see and can download all versions</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Add notes when uploading new versions to help track what changed. Notes appear in the 
            version history for reference.
          </p>
        </div>
      </section>

      {/* Client visibility */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="client-view">What Clients See</h2>
        
        <p className="mb-4">
          In the client portal, clients can:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• See all versions of each file</li>
          <li>• Download the current (latest) version</li>
          <li>• Access previous versions if needed</li>
          <li>• See when each version was uploaded</li>
        </ul>

        <p className="mb-4">
          This transparency helps avoid confusion about which version is current and gives clients 
          access to their complete project history.
        </p>
      </section>

      {/* Naming conventions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="naming">File Naming Tips</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Keep names consistent</h4>
              <p className="text-sm text-muted-foreground">
                Use exact same filename for updates: <code className="text-xs">design.fig</code> not <code className="text-xs">design-v2.fig</code>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Avoid version numbers in filenames</h4>
              <p className="text-sm text-muted-foreground">
                Don't add v1, v2 to names — Zovo handles versioning automatically
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "File uploads", href: "/docs/deliverables" as Route },
            { title: "Download tracking", href: "/docs/deliverables/tracking" as Route },
            { title: "Client portal", href: "/docs/projects/portal" as Route },
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
