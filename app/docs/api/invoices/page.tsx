import Link from "next/link";
import { Metadata, Route } from "next";
import { ArrowRight, AlertCircle } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Invoices API",
  description: "API endpoints for creating and managing invoices programmatically.",
};

export default function InvoicesApiPage() {
  return (
    <DocsLayout pathname="/docs/api/invoices">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Invoices API</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Create, send, and manage invoices programmatically using the Zovo API.
      </p>

      {/* Endpoints overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="endpoints">Endpoints</h2>
        
        <div className="not-prose rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-3 font-medium">Method</th>
                <th className="text-left p-3 font-medium">Endpoint</th>
                <th className="text-left p-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-500/10 text-green-600">GET</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/invoices</td>
                <td className="p-3 text-muted-foreground">List all invoices</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-500/10 text-green-600">GET</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/invoices/:id</td>
                <td className="p-3 text-muted-foreground">Get a single invoice</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600">POST</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/invoices</td>
                <td className="p-3 text-muted-foreground">Create an invoice</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-500/10 text-yellow-600">PATCH</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/invoices/:id</td>
                <td className="p-3 text-muted-foreground">Update an invoice</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600">POST</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/invoices/:id/send</td>
                <td className="p-3 text-muted-foreground">Send invoice to client</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600">POST</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/invoices/:id/remind</td>
                <td className="p-3 text-muted-foreground">Send payment reminder</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600">POST</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/invoices/:id/mark-paid</td>
                <td className="p-3 text-muted-foreground">Mark as paid (manual)</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/10 text-red-600">DELETE</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/invoices/:id</td>
                <td className="p-3 text-muted-foreground">Delete an invoice</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Invoice object */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="object">The Invoice Object</h2>
        
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <div className="p-3 border-b border-border/50 bg-secondary/50">
            <span className="text-sm font-medium font-mono">Invoice</span>
          </div>
          <pre className="p-4 text-sm overflow-x-auto"><code>{`{
  "id": "inv_abc123",
  "invoiceNumber": "INV-2026-001",
  "clientId": "cli_xyz789",
  "projectId": "prj_def456",
  "status": "sent",
  "currency": "USD",
  "lineItems": [
    {
      "description": "Homepage Design",
      "quantity": 1,
      "unitPrice": 2500,
      "amount": 2500
    },
    {
      "description": "Development Hours",
      "quantity": 20,
      "unitPrice": 150,
      "amount": 3000
    }
  ],
  "subtotal": 5500,
  "taxRate": 8.875,
  "taxAmount": 488.13,
  "total": 5988.13,
  "amountPaid": 0,
  "amountDue": 5988.13,
  "dueDate": "2026-02-15",
  "payToken": "pay_k8m2n4x7...",
  "paymentUrl": "https://zovo.dev/pay/pay_k8m2n4x7",
  "allowPartialPayments": true,
  "minimumPayment": 500,
  "sentAt": "2026-01-19T10:00:00Z",
  "paidAt": null,
  "createdAt": "2026-01-19T09:30:00Z",
  "updatedAt": "2026-01-19T10:00:00Z"
}`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Invoice Attributes</h3>
        <div className="not-prose rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-3 font-medium">Field</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="p-3 font-mono text-xs">status</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">draft, sent, viewed, partial, paid, overdue</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">currency</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">USD, EUR, GBP, CAD, AUD, SGD</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">lineItems</td>
                <td className="p-3 text-muted-foreground">array</td>
                <td className="p-3">Array of line item objects</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">paymentUrl</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">Client payment portal URL</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">allowPartialPayments</td>
                <td className="p-3 text-muted-foreground">boolean</td>
                <td className="p-3">Whether partial payments are enabled</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Create invoice */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="create">Create an Invoice</h2>
        
        <div className="not-prose mb-4">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600 mr-2">POST</span>
          <span className="font-mono text-sm">/api/invoices</span>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Request Body</h3>
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <pre className="p-4 text-sm overflow-x-auto"><code>{`{
  "clientId": "cli_xyz789",
  "projectId": "prj_def456",
  "currency": "USD",
  "dueDate": "2026-02-15",
  "lineItems": [
    {
      "description": "Homepage Design",
      "quantity": 1,
      "unitPrice": 2500
    }
  ],
  "taxRate": 8.875,
  "allowPartialPayments": true,
  "minimumPayment": 500
}`}</code></pre>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Note
          </h4>
          <p className="text-sm text-muted-foreground">
            Creating an invoice via API creates it in "draft" status. Use the <code className="text-xs">/send</code> endpoint 
            to send it to the client.
          </p>
        </div>
      </section>

      {/* Send invoice */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="send">Send an Invoice</h2>
        
        <div className="not-prose mb-4">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600 mr-2">POST</span>
          <span className="font-mono text-sm">/api/invoices/:id/send</span>
        </div>

        <p className="mb-4">
          Sends the invoice email to the client and updates status to "sent".
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Example Request</h3>
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <pre className="p-4 text-sm overflow-x-auto"><code>{`curl -X POST https://api.zovo.dev/v1/invoices/inv_abc123/send \\
  -H "Authorization: Bearer sk_live_..."`}</code></pre>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "API Introduction", href: "/docs/api" as Route },
            { title: "Projects API", href: "/docs/api/projects" as Route },
            { title: "Webhooks", href: "/docs/api/webhooks" as Route },
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
