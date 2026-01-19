import Link from "next/link";
import { Metadata, Route } from "next";
import { Image, CheckCircle2, Zap, ArrowRight, Eye } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Branding & Logo",
  description: "Customize your logo and branding across invoices, contracts, and emails.",
};

export default function BrandingPage() {
  return (
    <DocsLayout pathname="/docs/settings/branding">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Branding & Logo</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Add your logo and customize branding to make your invoices, contracts, and emails look 
        professional and on-brand.
      </p>

      {/* Logo upload */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="logo">Uploading Your Logo</h2>
        
        <p className="mb-4">
          Your logo appears on all client-facing documents:
        </p>

        <ul className="mb-6 space-y-2">
          <li>• Invoice PDFs and payment pages</li>
          <li>• Contract PDFs and signing pages</li>
          <li>• Email headers</li>
          <li>• Client portal</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-3">To upload your logo:</h3>
        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Settings</strong></li>
          <li>Find the <strong>Logo</strong> section</li>
          <li>Click <strong>Upload Logo</strong> or drag and drop</li>
          <li>Your logo is saved automatically</li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <Image className="h-4 w-4" />
            Logo requirements
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>File formats</span>
              <span className="text-muted-foreground">PNG, JPG, SVG</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recommended size</span>
              <span className="text-muted-foreground">200×50 pixels (or similar aspect ratio)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Maximum file size</span>
              <span className="text-muted-foreground">2 MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Best practice</span>
              <span className="text-muted-foreground">Transparent background (PNG)</span>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            No logo? No problem
          </h4>
          <p className="text-sm text-muted-foreground">
            If you don't upload a logo, your business name will be displayed in its place. This 
            still looks professional and clean.
          </p>
        </div>
      </section>

      {/* Where logo appears */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="where-appears">Where Your Logo Appears</h2>
        
        <div className="not-prose space-y-4 mb-6">
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Invoice PDF</h3>
                <p className="text-sm text-muted-foreground">Top-left header of invoice documents</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Contract PDF</h3>
                <p className="text-sm text-muted-foreground">Header of contract documents</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Email notifications</h3>
                <p className="text-sm text-muted-foreground">Header of all emails sent to clients</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Eye className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-medium">Client portal</h3>
                <p className="text-sm text-muted-foreground">Project portal header when clients view</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Removing logo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="removing">Removing Your Logo</h2>
        
        <p className="mb-4">
          To remove your logo:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Settings</strong></li>
          <li>Find the <strong>Logo</strong> section</li>
          <li>Click <strong>Remove</strong></li>
          <li>Confirm the removal</li>
        </ol>

        <p className="text-sm text-muted-foreground">
          After removing, your business name will be displayed instead.
        </p>
      </section>

      {/* Best practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="best-practices">Best Practices</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Use a horizontal logo</h4>
              <p className="text-sm text-muted-foreground">
                Wider logos work better in document headers than square or vertical ones
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Test on both light and dark</h4>
              <p className="text-sm text-muted-foreground">
                Make sure your logo is visible on both light backgrounds (PDFs) and dark themes (portal)
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Keep it simple</h4>
              <p className="text-sm text-muted-foreground">
                Simple logos render better at small sizes on mobile devices
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
            { title: "Business profile", href: "/docs/settings" as Route },
            { title: "Account setup", href: "/docs/account-setup" as Route },
            { title: "Invoice PDFs", href: "/docs/invoices" as Route },
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
