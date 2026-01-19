import Link from "next/link";
import { Metadata, Route } from "next";
import { FileText, CheckCircle2, Zap, ArrowRight, Eye } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Contract Templates",
  description: "Create reusable contract templates with dynamic variables for faster contract creation.",
};

export default function ContractTemplatesPage() {
  return (
    <DocsLayout pathname="/docs/contracts/templates">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Contract Templates & Variables</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Create reusable contract templates with dynamic variables. When you create a contract, 
        variables are automatically replaced with real client and project data.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        
        <p className="mb-4">
          Templates save you time by letting you define contract structure once and reuse it for 
          every client. Variables like <code className="px-1.5 py-0.5 rounded bg-secondary text-sm font-mono">{"{{clientName}}"}</code> are 
          replaced with actual values when you create a contract.
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <div className="p-3 bg-secondary/30 border-b border-border/50 flex items-center justify-between">
            <span className="text-sm font-medium">Template Preview</span>
            <span className="text-xs text-muted-foreground">Variables highlighted</span>
          </div>
          <div className="p-4 text-sm">
            <p className="mb-2">
              This Agreement is entered into between{" "}
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs">{"{{businessName}}"}</span>
              {" "}("Developer") and{" "}
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs">{"{{clientName}}"}</span>
              {" "}("Client").
            </p>
            <p className="mb-2">
              <strong>Project:</strong>{" "}
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs">{"{{projectName}}"}</span>
            </p>
            <p>
              <strong>Total Amount:</strong>{" "}
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs">{"{{totalAmount}}"}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Available variables */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="variables">Available Variables</h2>
        
        <p className="mb-4">
          Use these variables in your templates. They're automatically replaced when creating a contract:
        </p>

        <div className="not-prose mb-6">
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-3 font-medium">Variable</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{clientName}}"}</td>
                  <td className="p-3 text-muted-foreground">Client's full name</td>
                  <td className="p-3">John Smith</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{clientEmail}}"}</td>
                  <td className="p-3 text-muted-foreground">Client's email address</td>
                  <td className="p-3">john@example.com</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{clientCompany}}"}</td>
                  <td className="p-3 text-muted-foreground">Client's company name</td>
                  <td className="p-3">Acme Corp</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{projectName}}"}</td>
                  <td className="p-3 text-muted-foreground">Name of the project</td>
                  <td className="p-3">Website Redesign</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{totalAmount}}"}</td>
                  <td className="p-3 text-muted-foreground">Sum of all milestones</td>
                  <td className="p-3">$15,000.00</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{milestones}}"}</td>
                  <td className="p-3 text-muted-foreground">Formatted list of milestones</td>
                  <td className="p-3">1. Design - $5,000...</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{businessName}}"}</td>
                  <td className="p-3 text-muted-foreground">Your business name</td>
                  <td className="p-3">Smith Development LLC</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{businessAddress}}"}</td>
                  <td className="p-3 text-muted-foreground">Your business address</td>
                  <td className="p-3">123 Main St, City</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{date}}"}</td>
                  <td className="p-3 text-muted-foreground">Current date</td>
                  <td className="p-3">January 19, 2026</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{startDate}}"}</td>
                  <td className="p-3 text-muted-foreground">Project start date</td>
                  <td className="p-3">February 1, 2026</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">{"{{endDate}}"}</td>
                  <td className="p-3 text-muted-foreground">Project end date</td>
                  <td className="p-3">April 30, 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Variables are case-sensitive. Use exactly as shown above, including the double curly braces.
          </p>
        </div>
      </section>

      {/* Creating templates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="creating">Creating a Template</h2>
        
        <p className="mb-4">
          To create a new contract template:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Templates</strong> in the sidebar</li>
          <li>Click <strong>New Template</strong></li>
          <li>Select <strong>Contract</strong> as the template type</li>
          <li>Enter a name (e.g., "Web Development Agreement")</li>
          <li>Write your contract content using variables</li>
          <li>Click <strong>Save Template</strong></li>
        </ol>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-secondary/30 p-4">
          <h4 className="font-medium mb-2">Template structure tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Start with parties and definitions</li>
            <li>• Include scope of work (use {"{{projectName}}"} and {"{{milestones}}"})</li>
            <li>• Define payment terms (reference {"{{totalAmount}}"})</li>
            <li>• Add intellectual property clauses</li>
            <li>• Include termination conditions</li>
            <li>• End with signature blocks</li>
          </ul>
        </div>
      </section>

      {/* System templates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="system-templates">System Templates</h2>
        
        <p className="mb-4">
          Zovo includes pre-built templates to get you started:
        </p>

        <div className="not-prose space-y-3 mb-6">
          {[
            { name: "Web Development Agreement", desc: "For website and web app projects" },
            { name: "Mobile App Development Agreement", desc: "iOS/Android development projects" },
            { name: "API/Backend Development Agreement", desc: "API and backend services" },
            { name: "Maintenance & Support Retainer", desc: "Ongoing support contracts" },
            { name: "Consulting Agreement", desc: "Advisory and consulting work" },
          ].map((template) => (
            <div key={template.name} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
              <FileText className="h-5 w-5 text-purple-500 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">{template.name}</h4>
                <p className="text-xs text-muted-foreground">{template.desc}</p>
              </div>
              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-500">System</span>
            </div>
          ))}
        </div>

        <p className="mb-4">
          System templates can't be edited, but you can <strong>duplicate</strong> them to create 
          your own customized version.
        </p>
      </section>

      {/* Duplicating templates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="duplicating">Duplicating Templates</h2>
        
        <p className="mb-4">
          To customize a system template or create a variation of your own:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Templates</strong></li>
          <li>Find the template you want to duplicate</li>
          <li>Click the <strong>⋯</strong> menu</li>
          <li>Select <strong>Duplicate</strong></li>
          <li>Edit the duplicated template</li>
          <li>Save with a new name</li>
        </ol>
      </section>

      {/* Live preview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="preview">Live Preview</h2>
        
        <p className="mb-4">
          When editing a template, use the <strong>Preview</strong> tab to see how variables will 
          be rendered with sample data:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Preview mode</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The preview shows your template with placeholder values like "Sample Client" and 
            "$10,000.00" so you can verify formatting before saving.
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
              <h4 className="font-medium">Have a lawyer review your templates</h4>
              <p className="text-sm text-muted-foreground">
                While Zovo provides starting templates, have a legal professional review contracts 
                for your specific jurisdiction and business needs.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Create templates for different project types</h4>
              <p className="text-sm text-muted-foreground">
                A web development contract may differ from a consulting agreement. Create specific 
                templates for each type of work you do.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Test with real data</h4>
              <p className="text-sm text-muted-foreground">
                Before using a template, create a test contract to verify all variables render 
                correctly with actual client and project data.
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
            { title: "Creating contracts", href: "/docs/contracts" as Route },
            { title: "E-signatures", href: "/docs/contracts/signatures" as Route },
            { title: "Sequential signing", href: "/docs/contracts/sequential" as Route },
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
