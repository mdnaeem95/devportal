import Link from "next/link";
import { Metadata, Route } from "next";
import { PenTool, Type, Shield, AlertCircle, Zap, ArrowRight } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "E-Signatures",
  description: "Legally binding electronic signatures for your contracts. ESIGN and UETA compliant.",
};

export default function ESignaturesPage() {
  return (
    <DocsLayout pathname="/docs/contracts/signatures">
      <h1 className="text-3xl font-bold tracking-tight mb-4">E-Signatures</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Collect legally binding electronic signatures from your clients without them needing to 
        create an account. Compliant with ESIGN Act and UETA.
      </p>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="how-it-works">How It Works</h2>
        
        <p className="mb-4">
          When you send a contract, your client receives an email with a secure link. They can:
        </p>

        <ol className="mb-6 space-y-3 list-decimal list-inside">
          <li>Click the link to view the full contract</li>
          <li>Review all terms and conditions</li>
          <li>Draw or type their signature</li>
          <li>Click "Sign Contract" to complete</li>
        </ol>

        <p className="mb-4">
          Both you and your client receive confirmation emails with the signed PDF attached.
        </p>
      </section>

      {/* Signature methods */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="methods">Signature Methods</h2>
        
        <p className="mb-4">
          Clients can sign using two methods:
        </p>

        <div className="not-prose space-y-4 mb-6">
          <div className="rounded-lg border border-border/50 bg-card/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <PenTool className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Draw Signature</h3>
                <p className="text-sm text-muted-foreground">Use mouse, trackpad, or finger on mobile</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Clients draw their signature directly on the screen. This produces a unique, 
              handwriting-style signature that looks natural on documents.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Type className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Type Signature</h3>
                <p className="text-sm text-muted-foreground">Type name in a signature-style font</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Clients type their full legal name, which is rendered in a professional cursive font. 
              Quick and easy, especially on mobile devices.
            </p>
          </div>
        </div>
      </section>

      {/* Legal compliance */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="legal">Legal Compliance</h2>
        
        <p className="mb-4">
          Zovo's e-signatures are legally binding and comply with:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">ESIGN Act (US)</h4>
              <p className="text-sm text-muted-foreground">
                Electronic Signatures in Global and National Commerce Act — establishes legal 
                equivalence of electronic and paper contracts.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">UETA (US States)</h4>
              <p className="text-sm text-muted-foreground">
                Uniform Electronic Transactions Act — adopted by 47 US states, provides 
                state-level recognition of electronic signatures.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">eIDAS (EU)</h4>
              <p className="text-sm text-muted-foreground">
                Electronic Identification and Trust Services — provides legal framework for 
                electronic signatures in the European Union.
              </p>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Note on legal advice
          </h4>
          <p className="text-sm text-muted-foreground">
            While electronic signatures are broadly accepted, consult with a lawyer for high-value 
            contracts or specific industry requirements. Some document types (e.g., real estate 
            deeds, wills) may require traditional signatures in certain jurisdictions.
          </p>
        </div>
      </section>

      {/* Audit trail */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="audit-trail">Audit Trail</h2>
        
        <p className="mb-4">
          Every signature includes a complete audit trail for legal purposes:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border/50">
            <span className="text-sm font-medium">Signature Audit Trail</span>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Signer</span>
              <span>john@example.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Signed at</span>
              <span>Jan 19, 2026 at 2:34 PM EST</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">IP Address</span>
              <span className="font-mono">192.168.1.xxx</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Signature Type</span>
              <span>Drawn</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">User Agent</span>
              <span className="text-xs truncate max-w-[200px]">Chrome/120.0 on macOS</span>
            </div>
          </div>
        </div>

        <p className="mb-4">
          This information is embedded in the signed PDF and stored securely for your records.
        </p>
      </section>

      {/* Signature flow */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="flow">Client Signature Flow</h2>
        
        <p className="mb-4">
          Here's what your client experiences:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
            <div>
              <h4 className="font-medium text-sm">Email notification</h4>
              <p className="text-xs text-muted-foreground">Client receives email with "Sign Contract" button</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
            <div>
              <h4 className="font-medium text-sm">Review contract</h4>
              <p className="text-xs text-muted-foreground">Full contract text displayed on signing page</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</div>
            <div>
              <h4 className="font-medium text-sm">Add signature</h4>
              <p className="text-xs text-muted-foreground">Draw or type signature</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">4</div>
            <div>
              <h4 className="font-medium text-sm">Confirm intent</h4>
              <p className="text-xs text-muted-foreground">Checkbox: "I agree to sign this contract electronically"</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-white text-sm font-bold">✓</div>
            <div>
              <h4 className="font-medium text-sm">Complete</h4>
              <p className="text-xs text-muted-foreground">Both parties receive signed PDF via email</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile signing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="mobile">Mobile Signing</h2>
        
        <p className="mb-4">
          The signing page is fully responsive and works on mobile devices:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Draw signatures with finger on touchscreen</li>
          <li>• Pinch to zoom on contract text</li>
          <li>• Large touch targets for buttons</li>
          <li>• Works on iOS Safari and Android Chrome</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Many clients prefer signing on their phone — it's quick and they can do it anywhere. 
            The typed signature option is especially convenient on mobile.
          </p>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Creating contracts", href: "/docs/contracts" as Route },
            { title: "Sequential signing", href: "/docs/contracts/sequential" as Route },
            { title: "Contract reminders", href: "/docs/contracts/reminders" as Route },
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
