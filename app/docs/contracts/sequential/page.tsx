import Link from "next/link";
import { Metadata, Route } from "next";
import { ArrowRight, CheckCircle2, Clock, PenTool, Zap, AlertCircle } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Sequential Signing",
  description: "Sign contracts yourself before sending to clients for a more professional workflow.",
};

export default function SequentialSigningPage() {
  return (
    <DocsLayout pathname="/docs/contracts/sequential">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Sequential Signing</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Sign contracts yourself first before sending to your client. This creates a more 
        professional workflow and shows you're committed to the agreement.
      </p>

      {/* Why sequential signing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="why">Why Sign First?</h2>
        
        <p className="mb-4">
          Sequential signing means you (the developer) sign the contract before your client sees it. 
          Benefits include:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Shows commitment</h4>
              <p className="text-sm text-muted-foreground">
                Your signature already on the document demonstrates you're ready to proceed.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Professional presentation</h4>
              <p className="text-sm text-muted-foreground">
                Clients see a partially signed document, similar to traditional business contracts.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Clear next step</h4>
              <p className="text-sm text-muted-foreground">
                The client knows exactly what they need to do — just add their signature.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="how-it-works">How It Works</h2>
        
        <div className="not-prose mb-6">
          <div className="relative">
            {/* Flow diagram */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  1
                </div>
                <div className="flex-1 p-4 rounded-lg border border-border/50 bg-card/50">
                  <h4 className="font-medium">Create contract</h4>
                  <p className="text-sm text-muted-foreground">Draft your contract from a template</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  2
                </div>
                <div className="flex-1 p-4 rounded-lg border border-primary/50 bg-primary/5">
                  <h4 className="font-medium flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    You sign first
                  </h4>
                  <p className="text-sm text-muted-foreground">Add your signature before sending</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  3
                </div>
                <div className="flex-1 p-4 rounded-lg border border-border/50 bg-card/50">
                  <h4 className="font-medium">Send to client</h4>
                  <p className="text-sm text-muted-foreground">Client receives contract with your signature</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-white font-bold shrink-0">
                  ✓
                </div>
                <div className="flex-1 p-4 rounded-lg border border-success/50 bg-success/5">
                  <h4 className="font-medium">Client signs</h4>
                  <p className="text-sm text-muted-foreground">Contract complete with both signatures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enabling sequential signing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="enabling">Using Sequential Signing</h2>
        
        <p className="mb-4">
          When creating or editing a contract:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Create your contract as usual</li>
          <li>Before sending, click <strong>"Sign as Developer"</strong></li>
          <li>Draw or type your signature</li>
          <li>Click <strong>"Sign & Continue"</strong></li>
          <li>Then click <strong>"Send to Client"</strong></li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Optional but recommended
          </h4>
          <p className="text-sm text-muted-foreground">
            Sequential signing is optional. You can still send contracts for client-only signing 
            if you prefer the traditional approach.
          </p>
        </div>
      </section>

      {/* What client sees */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="client-view">What the Client Sees</h2>
        
        <p className="mb-4">
          When your client opens a sequentially-signed contract, they see:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-secondary/30">
            <h4 className="font-medium">Contract Signing Page</h4>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Developer Signature</p>
              <div className="p-3 rounded-lg border border-success/50 bg-success/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">Signed by you@example.com</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">January 19, 2026 at 10:30 AM</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Client Signature</p>
              <div className="p-3 rounded-lg border border-dashed border-border bg-secondary/30">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Awaiting your signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mb-4">
          This clear visual distinction helps clients understand the contract status at a glance.
        </p>
      </section>

      {/* Signature block */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="signature-block">Signature Block on PDFs</h2>
        
        <p className="mb-4">
          The final signed PDF includes both signatures with full audit information:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg border border-border/50">
              <p className="font-medium mb-2">Developer</p>
              <div className="h-12 mb-2 flex items-center justify-center italic text-lg">
                Your Signature
              </div>
              <p className="text-xs text-muted-foreground">Signed: Jan 19, 2026 10:30 AM</p>
              <p className="text-xs text-muted-foreground">you@example.com</p>
            </div>
            <div className="p-3 rounded-lg border border-border/50">
              <p className="font-medium mb-2">Client</p>
              <div className="h-12 mb-2 flex items-center justify-center italic text-lg">
                Client Signature
              </div>
              <p className="text-xs text-muted-foreground">Signed: Jan 19, 2026 2:15 PM</p>
              <p className="text-xs text-muted-foreground">client@example.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skipping sequential */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="skipping">Sending Without Your Signature</h2>
        
        <p className="mb-4">
          If you prefer not to sign first, simply skip the "Sign as Developer" step and send the 
          contract directly. The client will be the only signer.
        </p>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            When to skip
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Simple one-sided agreements (e.g., NDAs client must sign)</li>
            <li>• Terms of service acceptance</li>
            <li>• Documents where only client acknowledgment is needed</li>
          </ul>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "E-signatures", href: "/docs/contracts/signatures" as Route },
            { title: "Creating contracts", href: "/docs/contracts" as Route },
            { title: "Contract templates", href: "/docs/contracts/templates" as Route },
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
