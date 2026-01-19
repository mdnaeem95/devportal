import Link from "next/link";
import { Metadata, Route } from "next";
import { ArrowRight, AlertCircle, Shield, Zap, CheckCircle2 } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Webhooks",
  description: "Receive real-time notifications when events occur in Zovo.",
};

export default function WebhooksApiPage() {
  return (
    <DocsLayout pathname="/docs/api/webhooks">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Webhooks</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Receive real-time HTTP notifications when events occur in your Zovo account. Build 
        integrations that react instantly to invoice payments, contract signings, and more.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        
        <p className="mb-4">
          Webhooks send POST requests to your server when specific events happen. Instead of 
          polling the API, you receive instant notifications.
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium mb-2">Webhook delivery flow</h4>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li>1. Event occurs (e.g., invoice paid)</li>
            <li>2. Zovo sends POST request to your webhook URL</li>
            <li>3. Your server processes the event</li>
            <li>4. Respond with 2xx status to confirm receipt</li>
          </ol>
        </div>
      </section>

      {/* Available events */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="events">Available Events</h2>
        
        <div className="not-prose rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-3 font-medium">Event</th>
                <th className="text-left p-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="p-3 font-mono text-xs">invoice.created</td>
                <td className="p-3 text-muted-foreground">New invoice created</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">invoice.sent</td>
                <td className="p-3 text-muted-foreground">Invoice sent to client</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">invoice.viewed</td>
                <td className="p-3 text-muted-foreground">Client viewed invoice</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">invoice.paid</td>
                <td className="p-3 text-muted-foreground">Invoice paid (full or partial)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">invoice.overdue</td>
                <td className="p-3 text-muted-foreground">Invoice became overdue</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">contract.created</td>
                <td className="p-3 text-muted-foreground">New contract created</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">contract.sent</td>
                <td className="p-3 text-muted-foreground">Contract sent for signing</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">contract.viewed</td>
                <td className="p-3 text-muted-foreground">Client viewed contract</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">contract.signed</td>
                <td className="p-3 text-muted-foreground">Contract signed by client</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">contract.declined</td>
                <td className="p-3 text-muted-foreground">Contract declined by client</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">project.created</td>
                <td className="p-3 text-muted-foreground">New project created</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">project.completed</td>
                <td className="p-3 text-muted-foreground">Project marked complete</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">client.created</td>
                <td className="p-3 text-muted-foreground">New client added</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">deliverable.downloaded</td>
                <td className="p-3 text-muted-foreground">Client downloaded a file</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Webhook payload */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="payload">Webhook Payload</h2>
        
        <p className="mb-4">
          Every webhook delivers a JSON payload with this structure:
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <div className="p-3 border-b border-border/50 bg-secondary/50">
            <span className="text-sm font-medium font-mono">invoice.paid</span>
          </div>
          <pre className="p-4 text-sm overflow-x-auto"><code>{`{
  "id": "evt_abc123xyz",
  "type": "invoice.paid",
  "created": "2026-01-19T14:30:00Z",
  "data": {
    "object": {
      "id": "inv_def456",
      "invoiceNumber": "INV-2026-001",
      "clientId": "cli_xyz789",
      "status": "paid",
      "total": 5000,
      "amountPaid": 5000,
      "paidAt": "2026-01-19T14:30:00Z",
      "paymentMethod": "card",
      "last4": "4242"
    },
    "previousAttributes": {
      "status": "sent",
      "amountPaid": 0
    }
  }
}`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Payload Fields</h3>
        <div className="not-prose rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="p-3 font-mono text-xs">id</td>
                <td className="p-3 text-muted-foreground">Unique event identifier</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">type</td>
                <td className="p-3 text-muted-foreground">Event type (e.g., invoice.paid)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">created</td>
                <td className="p-3 text-muted-foreground">When the event occurred (ISO 8601)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">data.object</td>
                <td className="p-3 text-muted-foreground">The affected object with current state</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">data.previousAttributes</td>
                <td className="p-3 text-muted-foreground">Changed fields with previous values</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="security">Verifying Webhooks</h2>
        
        <p className="mb-4">
          All webhooks include a signature header for verification. Always verify signatures 
          before processing events.
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            Signature header
          </h4>
          <code className="text-sm font-mono">
            Zovo-Signature: t=1705673400,v1=5257a869e7eceb...
          </code>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Verification Example (Node.js)</h3>
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <pre className="p-4 text-sm overflow-x-auto"><code>{`import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const [timestamp, hash] = signature.split(',').map(p => p.split('=')[1]);
  
  // Check timestamp is recent (within 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    throw new Error('Timestamp too old');
  }
  
  // Compute expected signature
  const signedPayload = \`\${timestamp}.\${JSON.stringify(payload)}\`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  // Compare signatures
  if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected))) {
    throw new Error('Invalid signature');
  }
  
  return true;
}`}</code></pre>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Important
          </h4>
          <p className="text-sm text-muted-foreground">
            Never skip signature verification in production. An attacker could send fake events 
            to your endpoint.
          </p>
        </div>
      </section>

      {/* Retries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="retries">Retry Policy</h2>
        
        <p className="mb-4">
          If your endpoint returns an error or doesn't respond, Zovo retries the webhook:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <span className="text-sm font-mono">Retry 1</span>
            <span className="text-sm text-muted-foreground">→ 1 minute after failure</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <span className="text-sm font-mono">Retry 2</span>
            <span className="text-sm text-muted-foreground">→ 5 minutes after retry 1</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <span className="text-sm font-mono">Retry 3</span>
            <span className="text-sm text-muted-foreground">→ 30 minutes after retry 2</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <span className="text-sm font-mono">Retry 4</span>
            <span className="text-sm text-muted-foreground">→ 2 hours after retry 3</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <span className="text-sm font-mono">Retry 5</span>
            <span className="text-sm text-muted-foreground">→ 24 hours after retry 4 (final)</span>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Best practice
          </h4>
          <p className="text-sm text-muted-foreground">
            Respond quickly with 200 OK, then process the event asynchronously. Long processing 
            times can cause timeouts.
          </p>
        </div>
      </section>

      {/* Best practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="best-practices">Best Practices</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Handle duplicates</h4>
              <p className="text-sm text-muted-foreground">
                Use the event ID to deduplicate. The same event may be sent multiple times.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Use HTTPS</h4>
              <p className="text-sm text-muted-foreground">
                Your webhook endpoint must use HTTPS for security.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Return 200 quickly</h4>
              <p className="text-sm text-muted-foreground">
                Acknowledge receipt immediately, process asynchronously.
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
            { title: "API Introduction", href: "/docs/api" as Route },
            { title: "Invoices API", href: "/docs/api/invoices" as Route },
            { title: "Clients API", href: "/docs/api/clients" as Route },
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
