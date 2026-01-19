import Link from "next/link";
import { Metadata, Route } from "next";
import { FileText, CheckCircle2, AlertCircle, Zap, ArrowRight, Send, Eye, PenLine, X, Shield, Download } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Creating Contracts",
  description: "Learn how to create, send, and manage legally binding contracts with e-signatures in Zovo.",
};

export default function ContractsPage() {
  return (
    <DocsLayout pathname="/docs/contracts">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Contracts & E-Signatures</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Create professional contracts and get them signed electronically. No client login required — 
        they simply click a link to sign.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        <p className="mb-4">
          Zovo's contract system lets you:
        </p>
        <ul className="mb-4 space-y-2">
          <li>• Create contracts from templates with auto-filled variables</li>
          <li>• Sign contracts yourself first (sequential signing)</li>
          <li>• Send contracts via email for client e-signature</li>
          <li>• Track when contracts are viewed and signed</li>
          <li>• Generate PDFs with full audit trails</li>
          <li>• Set automatic reminders for unsigned contracts</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            Legally binding
          </h4>
          <p className="text-sm text-muted-foreground">
            Zovo e-signatures comply with ESIGN Act (US) and UETA standards. Each signature includes 
            an audit trail with IP address, timestamp, and signature type for legal validity.
          </p>
        </div>
      </section>

      {/* Contract status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="status">Contract Status</h2>
        
        <p className="mb-4">
          Contracts move through the following statuses:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <span className="font-medium">Draft</span>
              <span className="text-sm text-muted-foreground ml-2">— Not yet sent, can still be edited</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-purple-500/50 bg-purple-500/5">
            <Send className="h-5 w-5 text-purple-500" />
            <div>
              <span className="font-medium text-purple-600 dark:text-purple-400">Sent</span>
              <span className="text-sm text-muted-foreground ml-2">— Awaiting client signature</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500/50 bg-blue-500/5">
            <Eye className="h-5 w-5 text-blue-500" />
            <div>
              <span className="font-medium text-blue-500">Viewed</span>
              <span className="text-sm text-muted-foreground ml-2">— Client opened the signing link</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <span className="font-medium text-success">Signed</span>
              <span className="text-sm text-muted-foreground ml-2">— Fully executed by all parties</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/50 bg-destructive/5">
            <X className="h-5 w-5 text-destructive" />
            <div>
              <span className="font-medium text-destructive">Declined</span>
              <span className="text-sm text-muted-foreground ml-2">— Client rejected the contract</span>
            </div>
          </div>
        </div>
      </section>

      {/* Creating a contract */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="creating">Creating a Contract</h2>
        
        <p className="mb-4">
          There are two ways to create a contract:
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Option 1: From a template (recommended)</h3>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Contracts → New Contract</strong></li>
          <li>Select a template from the dropdown</li>
          <li>Choose the client and project</li>
          <li>Variables like {"{{clientName}}"} and {"{{projectName}}"} are auto-filled</li>
          <li>Review and make any edits</li>
          <li>Save as draft or send immediately</li>
        </ol>

        <h3 className="text-lg font-semibold mt-6 mb-3">Option 2: From scratch</h3>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Contracts → New Contract</strong></li>
          <li>Select "Blank contract"</li>
          <li>Choose the client and project</li>
          <li>Enter your contract content</li>
          <li>Save as draft or send immediately</li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Create your own templates for common contract types. Templates save time and ensure 
            consistency across all your client agreements.{" "}
            <Link href="/docs/contracts/templates" className="text-primary hover:underline">
              Learn about templates →
            </Link>
          </p>
        </div>
      </section>

      {/* Sequential signing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="sequential">Sequential Signing</h2>
        
        <p className="mb-4">
          Zovo supports sequential signing, where you sign the contract before sending it to your 
          client. This is a professional best practice that shows commitment.
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium mb-2">Signing order</h4>
          <ol className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">1</span>
              <span>You sign first (optional but recommended)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">2</span>
              <span>Contract is sent to client</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">3</span>
              <span>Client reviews and signs</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success text-xs font-medium">✓</span>
              <span>Both parties receive confirmation</span>
            </li>
          </ol>
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/contracts/sequential" className="text-primary hover:underline">
            Learn more about sequential signing →
          </Link>
        </p>
      </section>

      {/* Signature types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="signatures">Signature Types</h2>
        
        <p className="mb-4">
          Clients can sign using either method:
        </p>

        <div className="not-prose grid gap-4 sm:grid-cols-2 mb-4">
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <PenLine className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Drawn signature</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Client draws their signature using mouse, trackpad, or touchscreen. Most common and 
              feels most personal.
            </p>
          </div>
          
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Typed signature</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Client types their name, which is rendered in a signature font. Quick alternative when 
              drawing isn't practical.
            </p>
          </div>
        </div>

        <p>
          Both signature types are equally valid legally. The audit trail records which method was used.
        </p>
      </section>

      {/* Sending contracts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="sending">Sending a Contract</h2>
        
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>From the contract detail page, click <strong>"Send Contract"</strong></li>
          <li>Optionally add a personal message to include in the email</li>
          <li>Click <strong>"Send"</strong></li>
        </ol>

        <p className="mb-4">
          Your client receives an email with a secure link to view and sign the contract. The link is 
          unique to this contract and doesn't expire (unless you set an expiry date).
        </p>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Once sent, contracts cannot be edited
          </h4>
          <p className="text-sm text-muted-foreground">
            To make changes after sending, you'll need to create a new contract. This ensures the 
            client always sees the same version they're signing.
          </p>
        </div>
      </section>

      {/* PDF generation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="pdf">PDF Generation</h2>
        
        <p className="mb-4">
          Generate professional PDFs of any contract by clicking the <strong>"Download PDF"</strong> 
          button. The PDF includes:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Full contract content</li>
          <li>• Your signature (if signed)</li>
          <li>• Client signature (if signed)</li>
          <li>• Status badge (Draft, Sent, Signed, etc.)</li>
          <li>• Complete audit trail with timestamps and IP addresses</li>
          <li>• Your business branding (if logo is set)</li>
        </ul>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="font-medium">Clients can download too</h4>
              <p className="text-sm text-muted-foreground">
                After signing, clients can download their own copy of the signed PDF directly from 
                the signing page.
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
            { title: "Contract templates & variables", href: "/docs/contracts/templates" as Route },
            { title: "Sequential signing workflow", href: "/docs/contracts/sequential" as Route },
            { title: "Reminders & expiry dates", href: "/docs/contracts/reminders" as Route },
            { title: "E-signature legal compliance", href: "/docs/contracts/signatures" as Route },
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
