import Link from "next/link";
import { Metadata, Route } from "next";
import { ArrowRight } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Clients API",
  description: "API endpoints for managing clients programmatically.",
};

export default function ClientsApiPage() {
  return (
    <DocsLayout pathname="/docs/api/clients">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Clients API</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Create, read, update, and delete clients programmatically using the Zovo API.
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
                <td className="p-3 font-mono text-xs">/api/clients</td>
                <td className="p-3 text-muted-foreground">List all clients</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-500/10 text-green-600">GET</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/clients/:id</td>
                <td className="p-3 text-muted-foreground">Get a single client</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600">POST</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/clients</td>
                <td className="p-3 text-muted-foreground">Create a client</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-500/10 text-yellow-600">PATCH</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/clients/:id</td>
                <td className="p-3 text-muted-foreground">Update a client</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/10 text-red-600">DELETE</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/clients/:id</td>
                <td className="p-3 text-muted-foreground">Delete a client</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Client object */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="object">The Client Object</h2>
        
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <div className="p-3 border-b border-border/50 bg-secondary/50">
            <span className="text-sm font-medium font-mono">Client</span>
          </div>
          <pre className="p-4 text-sm overflow-x-auto"><code>{`{
  "id": "cli_abc123",
  "name": "John Smith",
  "email": "john@example.com",
  "company": "Acme Corp",
  "phone": "+1 555 123 4567",
  "address": "123 Main St, City, ST 12345",
  "notes": "Referred by Jane Doe",
  "status": "active",
  "isStarred": false,
  "paymentBehavior": "excellent",
  "totalRevenue": 25000,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-18T14:22:00Z"
}`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Attributes</h3>
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
                <td className="p-3 font-mono text-xs">id</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">Unique identifier</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">name</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">Client's full name (required)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">email</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">Email address (required)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">company</td>
                <td className="p-3 text-muted-foreground">string | null</td>
                <td className="p-3">Company name</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">phone</td>
                <td className="p-3 text-muted-foreground">string | null</td>
                <td className="p-3">Phone number</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">status</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">lead, active, or inactive</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">paymentBehavior</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">excellent, good, slow, poor, or new</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* List clients */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="list">List Clients</h2>
        
        <div className="not-prose mb-4">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-500/10 text-green-600 mr-2">GET</span>
          <span className="font-mono text-sm">/api/clients</span>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Query Parameters</h3>
        <div className="not-prose rounded-lg border border-border/50 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="p-3 font-mono text-xs">status</td>
                <td className="p-3 text-muted-foreground">Filter by status (lead, active, inactive)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">starred</td>
                <td className="p-3 text-muted-foreground">Filter starred clients (true/false)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">limit</td>
                <td className="p-3 text-muted-foreground">Number of results (default: 50, max: 100)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">cursor</td>
                <td className="p-3 text-muted-foreground">Pagination cursor</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Example Request</h3>
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <pre className="p-4 text-sm overflow-x-auto"><code>{`curl https://api.zovo.dev/v1/clients \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json"`}</code></pre>
        </div>
      </section>

      {/* Create client */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="create">Create a Client</h2>
        
        <div className="not-prose mb-4">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600 mr-2">POST</span>
          <span className="font-mono text-sm">/api/clients</span>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Request Body</h3>
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <pre className="p-4 text-sm overflow-x-auto"><code>{`{
  "name": "John Smith",
  "email": "john@example.com",
  "company": "Acme Corp",
  "phone": "+1 555 123 4567",
  "status": "lead"
}`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Example Request</h3>
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <pre className="p-4 text-sm overflow-x-auto"><code>{`curl https://api.zovo.dev/v1/clients \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "company": "Acme Corp"
  }'`}</code></pre>
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
