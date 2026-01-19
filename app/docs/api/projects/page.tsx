import Link from "next/link";
import { Metadata, Route } from "next";
import { ArrowRight } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Projects API",
  description: "API endpoints for managing projects and milestones programmatically.",
};

export default function ProjectsApiPage() {
  return (
    <DocsLayout pathname="/docs/api/projects">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Projects API</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Create and manage projects with milestones programmatically using the Zovo API.
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
                <td className="p-3 font-mono text-xs">/api/projects</td>
                <td className="p-3 text-muted-foreground">List all projects</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-500/10 text-green-600">GET</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/projects/:id</td>
                <td className="p-3 text-muted-foreground">Get a single project</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600">POST</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/projects</td>
                <td className="p-3 text-muted-foreground">Create a project</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-500/10 text-yellow-600">PATCH</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/projects/:id</td>
                <td className="p-3 text-muted-foreground">Update a project</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/10 text-red-600">DELETE</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/projects/:id</td>
                <td className="p-3 text-muted-foreground">Delete a project</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Milestone Endpoints</h3>
        <div className="not-prose rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-green-500/10 text-green-600">GET</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/projects/:id/milestones</td>
                <td className="p-3 text-muted-foreground">List project milestones</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600">POST</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/projects/:id/milestones</td>
                <td className="p-3 text-muted-foreground">Add a milestone</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-yellow-500/10 text-yellow-600">PATCH</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/milestones/:id</td>
                <td className="p-3 text-muted-foreground">Update a milestone</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-red-500/10 text-red-600">DELETE</span>
                </td>
                <td className="p-3 font-mono text-xs">/api/milestones/:id</td>
                <td className="p-3 text-muted-foreground">Delete a milestone</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Project object */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="object">The Project Object</h2>
        
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <div className="p-3 border-b border-border/50 bg-secondary/50">
            <span className="text-sm font-medium font-mono">Project</span>
          </div>
          <pre className="p-4 text-sm overflow-x-auto"><code>{`{
  "id": "prj_abc123",
  "clientId": "cli_xyz789",
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "status": "active",
  "publicId": "p_k8m2n4",
  "startDate": "2026-01-15",
  "endDate": "2026-04-15",
  "totalAmount": 15000,
  "milestones": [
    {
      "id": "mls_001",
      "name": "Discovery",
      "amount": 3000,
      "status": "completed",
      "dueDate": "2026-01-31",
      "order": 1
    },
    {
      "id": "mls_002",
      "name": "Design",
      "amount": 5000,
      "status": "in_progress",
      "dueDate": "2026-02-28",
      "order": 2
    }
  ],
  "createdAt": "2026-01-10T09:00:00Z",
  "updatedAt": "2026-01-18T16:30:00Z"
}`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Project Attributes</h3>
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
                <td className="p-3 font-mono text-xs">clientId</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">Associated client ID (required)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">name</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">Project name (required)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">status</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">draft, active, on_hold, completed, cancelled</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">publicId</td>
                <td className="p-3 text-muted-foreground">string</td>
                <td className="p-3">Public portal ID (auto-generated)</td>
              </tr>
              <tr>
                <td className="p-3 font-mono text-xs">totalAmount</td>
                <td className="p-3 text-muted-foreground">number</td>
                <td className="p-3">Sum of all milestone amounts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Create project */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="create">Create a Project</h2>
        
        <div className="not-prose mb-4">
          <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600 mr-2">POST</span>
          <span className="font-mono text-sm">/api/projects</span>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Request Body</h3>
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <pre className="p-4 text-sm overflow-x-auto"><code>{`{
  "clientId": "cli_xyz789",
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "status": "active",
  "startDate": "2026-01-15",
  "endDate": "2026-04-15",
  "milestones": [
    {
      "name": "Discovery",
      "amount": 3000,
      "dueDate": "2026-01-31"
    },
    {
      "name": "Design",
      "amount": 5000,
      "dueDate": "2026-02-28"
    },
    {
      "name": "Development",
      "amount": 7000,
      "dueDate": "2026-04-01"
    }
  ]
}`}</code></pre>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Example Request</h3>
        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
          <pre className="p-4 text-sm overflow-x-auto"><code>{`curl https://api.zovo.dev/v1/projects \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "clientId": "cli_xyz789",
    "name": "Website Redesign",
    "status": "active",
    "milestones": [...]
  }'`}</code></pre>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "API Introduction", href: "/docs/api" as Route },
            { title: "Clients API", href: "/docs/api/clients" as Route },
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
