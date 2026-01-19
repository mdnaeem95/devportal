import Link from "next/link";
import { Metadata, Route } from "next";
import { Lock, ArrowRight, AlertCircle } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "API Reference",
  description: "Integrate Zovo into your workflow with our REST API. Authentication, endpoints, and webhooks.",
};

export default function ApiPage() {
  return (
    <DocsLayout pathname="/docs/api">
      <h1 className="text-3xl font-bold tracking-tight mb-4">API Reference</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Integrate Zovo into your workflow with our REST API. Available on Pro plans.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        <p className="mb-4">
          The Zovo API allows you to programmatically manage clients, projects, invoices, and more. 
          Use it to build custom integrations, automate workflows, or sync data with other tools.
        </p>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Pro plan required
          </h4>
          <p className="text-sm text-muted-foreground">
            API access is available on Pro plans ($39/month). Upgrade in Settings → Subscription to 
            enable API access.
          </p>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <h4 className="font-medium mb-2">Base URL</h4>
          <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">
            https://api.zovo.dev/v1
          </code>
        </div>
      </section>

      {/* Authentication */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="authentication">Authentication</h2>
        
        <p className="mb-4">
          All API requests require authentication using an API key. Include your key in the 
          <code className="mx-1 text-sm font-mono bg-secondary px-1.5 py-0.5 rounded">Authorization</code> header:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-[#1e1e1e] p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300">
{`curl https://api.zovo.dev/v1/clients \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
          </pre>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Getting your API key</h3>
        <ol className="mb-4 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Settings → API</strong></li>
          <li>Click <strong>"Generate API Key"</strong></li>
          <li>Copy your key immediately — it won't be shown again</li>
          <li>Store it securely (e.g., environment variable)</li>
        </ol>

        <div className="not-prose mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-destructive">
            <Lock className="h-4 w-4" />
            Keep your API key secret
          </h4>
          <p className="text-sm text-muted-foreground">
            Your API key has full access to your account. Never expose it in client-side code, 
            public repositories, or logs. If compromised, revoke it immediately in Settings.
          </p>
        </div>
      </section>

      {/* Rate limits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="rate-limits">Rate Limits</h2>
        
        <p className="mb-4">
          API requests are rate limited to ensure fair usage:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="font-medium">Pro plan</span>
              <span className="font-mono text-sm">1,000 requests/hour</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Burst limit</span>
              <span className="font-mono text-sm">100 requests/minute</span>
            </div>
          </div>
        </div>

        <p className="mb-4">
          Rate limit information is included in response headers:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <div className="space-y-1 text-sm font-mono">
            <div><span className="text-muted-foreground">X-RateLimit-Limit:</span> 1000</div>
            <div><span className="text-muted-foreground">X-RateLimit-Remaining:</span> 998</div>
            <div><span className="text-muted-foreground">X-RateLimit-Reset:</span> 1640995200</div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          If you exceed rate limits, you'll receive a <code className="mx-1 font-mono bg-secondary px-1 py-0.5 rounded">429 Too Many Requests</code> response.
        </p>
      </section>

      {/* Response format */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="responses">Response Format</h2>
        
        <p className="mb-4">
          All responses are JSON. Successful responses include a <code className="mx-1 font-mono bg-secondary px-1 py-0.5 rounded">data</code> field:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-[#1e1e1e] p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300">
{`{
  "data": {
    "id": "cli_abc123",
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}`}
          </pre>
        </div>

        <p className="mb-4">
          List endpoints return paginated results:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-[#1e1e1e] p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300">
{`{
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "perPage": 20,
    "totalPages": 3
  }
}`}
          </pre>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Error responses</h3>
        <p className="mb-4">
          Errors include a <code className="mx-1 font-mono bg-secondary px-1 py-0.5 rounded">message</code> and optional <code className="mx-1 font-mono bg-secondary px-1 py-0.5 rounded">errors</code> array:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-[#1e1e1e] p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300">
{`{
  "error": {
    "code": "validation_error",
    "message": "Invalid request body",
    "errors": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}`}
          </pre>
        </div>
      </section>

      {/* Available endpoints */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="endpoints">Available Endpoints</h2>
        
        <div className="not-prose space-y-4 mb-4">
          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono font-medium">GET</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium">POST</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs font-mono font-medium">PATCH</span>
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono font-medium">DELETE</span>
              <span className="font-medium ml-2">/clients</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your clients — create, read, update, delete.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono font-medium">GET</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium">POST</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs font-mono font-medium">PATCH</span>
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono font-medium">DELETE</span>
              <span className="font-medium ml-2">/projects</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage projects and milestones.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono font-medium">GET</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium">POST</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs font-mono font-medium">PATCH</span>
              <span className="font-medium ml-2">/invoices</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Create and manage invoices. Send invoices programmatically.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono font-medium">GET</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium">POST</span>
              <span className="font-medium ml-2">/time-entries</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Log time entries and retrieve time tracking data.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-mono font-medium">GET</span>
              <span className="font-medium ml-2">/webhooks</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure webhooks to receive real-time event notifications.
            </p>
          </div>
        </div>
      </section>

      {/* Example request */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="example">Example: Create a Client</h2>
        
        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-[#1e1e1e] p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300">
{`curl -X POST https://api.zovo.dev/v1/clients \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Acme Corporation",
    "email": "billing@acme.com",
    "company": "Acme Corp",
    "status": "active"
  }'`}
          </pre>
        </div>

        <p className="mb-4">Response:</p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-[#1e1e1e] p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300">
{`{
  "data": {
    "id": "cli_abc123",
    "name": "Acme Corporation",
    "email": "billing@acme.com",
    "company": "Acme Corp",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}`}
          </pre>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Clients API", href: "/docs/api/clients" as Route },
            { title: "Projects API", href: "/docs/api/projects" as Route },
            { title: "Invoices API", href: "/docs/api/invoices" as Route },
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
