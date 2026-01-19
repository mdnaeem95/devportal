import Link from "next/link";
import { Metadata, Route } from "next";
import { Upload, File, AlertCircle, Zap, ArrowRight, Download } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "File Uploads",
  description: "Upload and organize deliverable files for your clients to access.",
};

export default function DeliverablesUploadsPage() {
  return (
    <DocsLayout pathname="/docs/deliverables/uploads">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Uploading Files</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Upload deliverable files directly to Zovo. Clients can download files from their project 
        portal without needing separate file sharing services.
      </p>

      {/* Uploading files */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="uploading">Uploading Files</h2>
        
        <p className="mb-4">
          To upload a deliverable file:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the project detail page</li>
          <li>Click the <strong>Deliverables</strong> tab</li>
          <li>Click <strong>"Upload File"</strong> or drag and drop files</li>
          <li>Select the category and optionally link to a milestone</li>
          <li>Click <strong>"Upload"</strong></li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border-2 border-dashed border-border/50 bg-card/50 p-8 text-center">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium mb-1">Drag and drop files here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Multiple files
          </h4>
          <p className="text-sm text-muted-foreground">
            You can upload multiple files at once. Each file gets its own entry with separate 
            category and milestone assignments.
          </p>
        </div>
      </section>

      {/* File requirements */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="requirements">File Requirements</h2>
        
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium mb-3">Upload limits</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Maximum file size</span>
              <span className="font-mono">100 MB per file</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Allowed file types</span>
              <span className="text-muted-foreground">All common file types</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Storage per project</span>
              <span className="font-mono">Unlimited</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Supported file types</h3>
        
        <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            "PDF", "ZIP", "PNG", "JPG",
            "SVG", "PSD", "AI", "SKETCH",
            "DOCX", "XLSX", "CSV", "JSON",
            "HTML", "CSS", "JS", "TS",
          ].map((type) => (
            <div key={type} className="text-center p-2 rounded-lg border border-border/50 bg-card/50">
              <span className="font-mono text-sm">.{type.toLowerCase()}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Virtually any file type is supported. The above are just common examples.
        </p>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="categories">File Categories</h2>
        
        <p className="mb-4">
          Organize files by category to help clients find what they need:
        </p>

        <div className="not-prose space-y-3 mb-6">
          {[
            { name: "Source Code", icon: "💻", desc: "Application code, scripts, repositories" },
            { name: "Documentation", icon: "📄", desc: "Technical docs, user guides, API references" },
            { name: "Design", icon: "🎨", desc: "Mockups, wireframes, design files" },
            { name: "Assets", icon: "🖼️", desc: "Images, icons, fonts, media files" },
            { name: "Other", icon: "📁", desc: "Everything else" },
          ].map((category) => (
            <div key={category.name} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
              <span className="text-xl">{category.icon}</span>
              <div>
                <h4 className="font-medium text-sm">{category.name}</h4>
                <p className="text-xs text-muted-foreground">{category.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Versioning */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="versioning">File Versioning</h2>
        
        <p className="mb-4">
          Upload updated versions of files without losing the original:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border/50">
            <div className="flex items-center gap-2">
              <File className="h-4 w-4" />
              <span className="font-medium text-sm">homepage-mockup.png</span>
            </div>
          </div>
          <div className="divide-y divide-border/50 text-sm">
            <div className="p-3 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs">v3</span>
                <span>Latest version</span>
              </div>
              <span className="text-muted-foreground">Jan 19, 2026</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-secondary text-xs">v2</span>
                <span className="text-muted-foreground">Previous version</span>
              </div>
              <span className="text-muted-foreground">Jan 15, 2026</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-secondary text-xs">v1</span>
                <span className="text-muted-foreground">Original upload</span>
              </div>
              <span className="text-muted-foreground">Jan 10, 2026</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">How versioning works</h3>
        
        <ul className="mb-4 space-y-2">
          <li>• Upload a file with the same name to create a new version</li>
          <li>• Previous versions are preserved and accessible</li>
          <li>• Clients see the latest version by default</li>
          <li>• Version history is viewable in the file detail view</li>
        </ul>
      </section>

      {/* Linking to milestones */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="milestones">Linking to Milestones</h2>
        
        <p className="mb-4">
          Associate files with specific milestones to organize deliverables:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Select a milestone when uploading</li>
          <li>• Files appear under the milestone in the client portal</li>
          <li>• Helps clients understand what was delivered at each stage</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Link deliverables to milestones even if the milestone isn't billable. It creates a 
            clear record of what was delivered and when.
          </p>
        </div>
      </section>

      {/* Download tracking */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="tracking">Download Tracking</h2>
        
        <p className="mb-4">
          Zovo tracks when clients download files:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Download className="h-4 w-4" />
            Download history
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>final-deliverables.zip</span>
              <span className="text-muted-foreground">Downloaded 3 times</span>
            </div>
            <div className="flex items-center justify-between">
              <span>homepage-mockup.png</span>
              <span className="text-muted-foreground">Downloaded 7 times</span>
            </div>
            <div className="flex items-center justify-between">
              <span>api-documentation.pdf</span>
              <span className="text-muted-foreground">Not downloaded yet</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          This helps you know when clients have received and accessed their deliverables.
        </p>
      </section>

      {/* Deleting files */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="deleting">Deleting Files</h2>
        
        <p className="mb-4">
          To delete a file:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to the project's Deliverables tab</li>
          <li>Find the file you want to delete</li>
          <li>Click the <strong>⋯</strong> menu</li>
          <li>Select <strong>"Delete"</strong></li>
          <li>Confirm the deletion</li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Deletion is permanent
          </h4>
          <p className="text-sm text-muted-foreground">
            Deleted files cannot be recovered. Make sure you have backups before deleting.
          </p>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Deliverables overview", href: "/docs/deliverables" as Route },
            { title: "GitHub integration", href: "/docs/deliverables/github" as Route },
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
