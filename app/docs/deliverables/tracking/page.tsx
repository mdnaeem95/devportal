import Link from "next/link";
import { Metadata, Route } from "next";
import { Download, Clock, CheckCircle2, Zap, ArrowRight, Globe } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Download Tracking",
  description: "Know when clients access and download your deliverables.",
};

export default function DownloadTrackingPage() {
  return (
    <DocsLayout pathname="/docs/deliverables/tracking">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Download Tracking</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Zovo tracks when clients download files from the project portal. Know exactly when 
        deliverables have been accessed.
      </p>

      {/* What's tracked */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="what-tracked">What's Tracked</h2>
        
        <p className="mb-4">
          For each file download, Zovo records:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-sm">Timestamp</h4>
                <p className="text-xs text-muted-foreground">Exact date and time of download</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-sm">Download count</h4>
                <p className="text-xs text-muted-foreground">Total number of times file was downloaded</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium text-sm">Source</h4>
                <p className="text-xs text-muted-foreground">Portal vs direct link</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Viewing download history */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="viewing">Viewing Download History</h2>
        
        <p className="mb-4">
          See download activity for each file:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the project's <strong>Deliverables</strong> section</li>
          <li>Find the file</li>
          <li>Click to expand or select <strong>View Details</strong></li>
          <li>Scroll to <strong>Download History</strong></li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border/50 flex items-center justify-between">
            <span className="text-sm font-medium">final-deliverables.zip</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
              Downloaded 3 times
            </span>
          </div>
          <div className="divide-y divide-border/50 text-sm">
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>Downloaded via portal</span>
              </div>
              <span className="text-muted-foreground">Jan 19, 2026 at 3:45 PM</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>Downloaded via portal</span>
              </div>
              <span className="text-muted-foreground">Jan 18, 2026 at 10:22 AM</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>Downloaded via portal</span>
              </div>
              <span className="text-muted-foreground">Jan 17, 2026 at 2:15 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Download badges */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="badges">Download Badges</h2>
        
        <p className="mb-4">
          Files show download status at a glance:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Not downloaded
            </span>
            <span className="text-sm">Client hasn't accessed this file yet</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
              Downloaded
            </span>
            <span className="text-sm">Client has downloaded at least once</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500/50 bg-blue-500/5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
              Downloaded 5×
            </span>
            <span className="text-sm">Multiple downloads (useful for tracking engagement)</span>
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="why-matters">Why Tracking Matters</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Confirm delivery</h4>
              <p className="text-sm text-muted-foreground">
                Know for certain the client received your work
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Follow up appropriately</h4>
              <p className="text-sm text-muted-foreground">
                If a file hasn't been downloaded, maybe they missed your email
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Project documentation</h4>
              <p className="text-sm text-muted-foreground">
                Records prove when deliverables were accessed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy note */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="privacy">Privacy Note</h2>
        
        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Client-friendly tracking
          </h4>
          <p className="text-sm text-muted-foreground">
            Zovo only tracks downloads, not views. We don't track IP addresses or device information 
            for download events. This respects client privacy while still giving you useful delivery 
            confirmation.
          </p>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "File uploads", href: "/docs/deliverables" as Route },
            { title: "File versioning", href: "/docs/deliverables/versions" as Route },
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
