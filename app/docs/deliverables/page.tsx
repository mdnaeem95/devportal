import Link from "next/link";
import { Metadata, Route } from "next";
import { Upload, Download, FileText, Image, Code, File, History, Eye, Github, ArrowRight, Zap, CheckCircle2, FolderOpen } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "File Uploads & Deliverables",
  description: "Upload files, track versions, and know when clients download your deliverables.",
};

export default function DeliverablesPage() {
  return (
    <DocsLayout pathname="/docs/deliverables">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Deliverables & Files</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Upload project files, track versions automatically, and see exactly when clients 
        download your deliverables.
      </p>

      {/* Uploading files */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="uploading">Uploading Files</h2>
        <p className="mb-4">
          Add deliverables to any project. Files can be associated with specific milestones 
          or the project as a whole.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Upload Methods</h3>
        <div className="not-prose grid gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Drag & Drop
            </h4>
            <p className="text-sm text-muted-foreground mt-2">
              Drag files directly onto the deliverables area. Supports multiple files at once.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-medium flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              File Browser
            </h4>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Upload" to browse and select files from your computer.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">File Limits</h3>
        <ul className="mb-4 space-y-2">
          <li><strong>Max file size:</strong> 100MB per file</li>
          <li><strong>Storage:</strong> Unlimited on all plans</li>
          <li><strong>File types:</strong> All file types accepted</li>
        </ul>
      </section>

      {/* File categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="categories">File Categories</h2>
        <p className="mb-4">
          Organize deliverables by category to help clients find what they need:
        </p>

        <div className="not-prose space-y-3 mb-6">
          {[
            { icon: Code, name: "Source Code", desc: "Code files, repositories, scripts" },
            { icon: FileText, name: "Documentation", desc: "Specs, guides, READMEs" },
            { icon: Image, name: "Design", desc: "Mockups, wireframes, prototypes" },
            { icon: Image, name: "Assets", desc: "Images, icons, media files" },
            { icon: File, name: "Other", desc: "Everything else" },
          ].map((cat) => (
            <div key={cat.name} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
              <cat.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-medium">{cat.name}</span>
                <span className="text-sm text-muted-foreground ml-2">— {cat.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Categories are automatically suggested based on file extension, but you can 
          change them manually.
        </p>
      </section>

      {/* Versioning */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="versioning">Automatic Versioning</h2>
        <p className="mb-4">
          When you upload a file with the same name as an existing file, Zovo automatically 
          creates a new version instead of replacing it.
        </p>

        <div className="not-prose rounded-lg border border-border/50 bg-card/50 p-4 mb-6">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <History className="h-4 w-4" />
            Version History Example
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-primary/10 rounded border border-primary/20">
              <span>design-mockup.fig</span>
              <span className="text-muted-foreground">v3 (current)</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-secondary/50 rounded">
              <span>design-mockup.fig</span>
              <span className="text-muted-foreground">v2</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-secondary/50 rounded">
              <span>design-mockup.fig</span>
              <span className="text-muted-foreground">v1</span>
            </div>
          </div>
        </div>

        <div className="not-prose rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Pro tip</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Clients can access all versions of a file from the portal. This is useful 
                when they need to compare changes or revert to an earlier version.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/docs/deliverables/versions" className="text-primary hover:underline">
            Learn more about versioning →
          </Link>
        </p>
      </section>

      {/* Download tracking */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="tracking">Download Tracking</h2>
        <p className="mb-4">
          Know exactly when clients access your deliverables. Each download is logged with:
        </p>

        <ul className="mb-4 space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Date and time of download
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Which version was downloaded
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Total download count
          </li>
        </ul>

        <div className="not-prose rounded-lg border border-border/50 bg-card/50 p-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>final-deliverable.zip</span>
            </div>
            <div className="text-muted-foreground">
              Downloaded 3 times · Last: Jan 15, 2026
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/deliverables/tracking" className="text-primary hover:underline">
            Learn more about download tracking →
          </Link>
        </p>
      </section>

      {/* GitHub linking */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="github">GitHub Integration</h2>
        <p className="mb-4">
          Link GitHub repositories directly to your project. Clients can see the repo 
          URL in their portal without needing repo access.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Adding a Repository Link</h3>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Go to your project's Deliverables tab</li>
          <li>Click "Link Repository"</li>
          <li>Enter the GitHub URL</li>
          <li>Optionally add a description</li>
        </ol>

        <div className="not-prose rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5" />
            <div>
              <p className="font-medium">acme-corp/website-redesign</p>
              <p className="text-sm text-muted-foreground">Main project repository</p>
            </div>
          </div>
        </div>
      </section>

      {/* Milestone association */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="milestones">Milestone Association</h2>
        <p className="mb-4">
          Associate deliverables with specific milestones to keep things organized. 
          This helps clients understand what they're receiving at each project phase.
        </p>

        <div className="not-prose rounded-lg border border-border/50 bg-secondary/30 p-4">
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-2">Milestone: Design Phase</p>
              <div className="space-y-1 ml-4">
                <p className="text-muted-foreground">• wireframes-v2.fig</p>
                <p className="text-muted-foreground">• style-guide.pdf</p>
                <p className="text-muted-foreground">• component-library.zip</p>
              </div>
            </div>
            <div>
              <p className="font-medium mb-2">Milestone: Development</p>
              <div className="space-y-1 ml-4">
                <p className="text-muted-foreground">• source-code.zip</p>
                <p className="text-muted-foreground">• deployment-guide.md</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client portal view */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="client-view">Client Portal View</h2>
        <p className="mb-4">
          In the client portal, deliverables are organized by category and milestone. 
          Clients can:
        </p>

        <ul className="mb-4 space-y-2">
          <li className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            Browse all project files
          </li>
          <li className="flex items-center gap-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            Download individual files or all files as ZIP
          </li>
          <li className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Access previous versions
          </li>
          <li className="flex items-center gap-2">
            <Github className="h-4 w-4 text-muted-foreground" />
            View linked repositories
          </li>
        </ul>
      </section>

      {/* Related pages */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Version Management",
              description: "Working with file versions",
              href: "/docs/deliverables/versions" as Route,
            },
            {
              title: "Download Tracking",
              description: "Monitor client file access",
              href: "/docs/deliverables/tracking" as Route,
            },
            {
              title: "Client Portal",
              description: "What clients see",
              href: "/docs/projects/portal" as Route,
            },
            {
              title: "Project Milestones",
              description: "Organize deliverables by phase",
              href: "/docs/projects/milestones" as Route,
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border hover:bg-card/50 transition-colors group"
            >
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
}
