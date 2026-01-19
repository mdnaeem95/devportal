import Link from "next/link";
import { Metadata, Route } from "next";
import { Users, Star, AlertCircle, Zap, ArrowRight, Mail, Building2, Phone, FileText, Clock, CreditCard, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Managing Clients",
  description: "Learn how to add, organize, and track your clients in Zovo.",
};

export default function ClientsPage() {
  return (
    <DocsLayout pathname="/docs/clients">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Managing Clients</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Keep all your client information organized in one place. Track contact details, payment 
        behavior, and project history.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        <p className="mb-4">
          The Clients section is your central hub for managing client relationships. For each client, 
          Zovo tracks:
        </p>
        <ul className="mb-4 space-y-2">
          <li>• Contact information (email, phone, company, address)</li>
          <li>• All associated projects and their status</li>
          <li>• Invoice history and payment behavior</li>
          <li>• Contract status</li>
          <li>• Private notes and follow-up reminders</li>
        </ul>
      </section>

      {/* Adding clients */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="adding">Adding a Client</h2>
        
        <p className="mb-4">
          Navigate to <strong>Clients → New Client</strong> or use the command palette 
          (<kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary text-xs">⌘K</kbd> → "New client").
        </p>

        <div className="not-prose mb-6 rounded-lg border border-border/50 bg-card/50 p-5">
          <h3 className="font-semibold mb-4">Client fields</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Name <span className="text-destructive">*</span></h4>
                <p className="text-sm text-muted-foreground">Your client's full name. Required field.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Email <span className="text-destructive">*</span></h4>
                <p className="text-sm text-muted-foreground">
                  Where invoices and contracts are sent. Must be a valid email. Required field.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Company</h4>
                <p className="text-sm text-muted-foreground">
                  Client's company name. Appears on invoices and contracts if set.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Phone</h4>
                <p className="text-sm text-muted-foreground">Contact phone number.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Notes</h4>
                <p className="text-sm text-muted-foreground">
                  Private notes about this client. Only visible to you, never shared with the client.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="status">Client Status</h2>
        
        <p className="mb-4">
          Organize your clients by their current relationship status:
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div>
              <span className="font-medium">Lead</span>
              <span className="text-sm text-muted-foreground ml-2">— Potential client, not yet started work</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <div>
              <span className="font-medium">Active</span>
              <span className="text-sm text-muted-foreground ml-2">— Currently working together</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <div className="h-3 w-3 rounded-full bg-muted-foreground" />
            <div>
              <span className="font-medium">Inactive</span>
              <span className="text-sm text-muted-foreground ml-2">— No current projects</span>
            </div>
          </div>
        </div>

        <p>
          Filter your client list by status using the tabs at the top of the Clients page.
        </p>
      </section>

      {/* Starring clients */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="starring">Starring Important Clients</h2>
        
        <p className="mb-4">
          Star your most important clients to keep them at the top of your list:
        </p>

        <div className="not-prose mb-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <div>
              <h4 className="font-medium">Starred clients</h4>
              <p className="text-sm text-muted-foreground">
                Always appear at the top of your client list, regardless of sorting. Click the star 
                icon on any client to toggle.
              </p>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Use starring for
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Your highest-value clients</li>
            <li>• Clients with active urgent projects</li>
            <li>• Clients you communicate with frequently</li>
            <li>• Retainer clients with ongoing work</li>
          </ul>
        </div>
      </section>

      {/* Payment behavior */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="payment-behavior">Payment Behavior Tracking</h2>
        
        <p className="mb-4">
          Zovo automatically tracks how quickly each client pays their invoices. This helps you 
          identify reliable clients and those who may need payment reminders.
        </p>

        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/5">
            <TrendingUp className="h-5 w-5 text-success" />
            <div>
              <span className="font-medium text-success">Excellent</span>
              <span className="text-sm text-muted-foreground ml-2">— Pays within 7 days on average</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-500/50 bg-blue-500/5">
            <Minus className="h-5 w-5 text-blue-500" />
            <div>
              <span className="font-medium text-blue-500">Good</span>
              <span className="text-sm text-muted-foreground ml-2">— Pays within 14 days on average</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <span className="font-medium text-yellow-600 dark:text-yellow-500">Slow</span>
              <span className="text-sm text-muted-foreground ml-2">— Takes 15-30 days to pay</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border border-destructive/50 bg-destructive/5">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <div>
              <span className="font-medium text-destructive">Poor</span>
              <span className="text-sm text-muted-foreground ml-2">— Often pays after 30+ days</span>
            </div>
          </div>
        </div>

        <p className="mb-4">
          Payment behavior is calculated from all paid invoices for that client. New clients with no 
          payment history show as "New".
        </p>

        <p className="text-sm text-muted-foreground">
          <Link href="/docs/clients/payment-behavior" className="text-primary hover:underline">
            Learn more about payment behavior tracking →
          </Link>
        </p>
      </section>

      {/* Client detail */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="detail">Client Detail View</h2>
        
        <p className="mb-4">
          Click on any client to see their full profile, including:
        </p>

        <div className="not-prose grid gap-4 sm:grid-cols-2 mb-4">
          {[
            {
              icon: CreditCard,
              title: "Revenue summary",
              description: "Total paid, pending, and lifetime value",
            },
            {
              icon: FileText,
              title: "Project history",
              description: "All projects with this client",
            },
            {
              icon: CreditCard,
              title: "Invoice history",
              description: "All invoices and payment status",
            },
            {
              icon: Clock,
              title: "Activity timeline",
              description: "Recent actions and communications",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-border/50 bg-card/50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium text-sm">{item.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editing and deleting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="editing">Editing and Deleting Clients</h2>
        
        <h3 className="text-lg font-semibold mt-6 mb-3">Editing</h3>
        <p className="mb-4">
          To edit a client, go to their detail page and click <strong>"Edit"</strong>. You can update 
          any field except their email if they have associated invoices or contracts (to preserve 
          delivery records).
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Deleting</h3>
        <p className="mb-4">
          To delete a client, go to their detail page, click <strong>"Edit"</strong>, then 
          <strong>"Delete Client"</strong>.
        </p>

        <div className="not-prose mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            Important
          </h4>
          <p className="text-sm text-muted-foreground">
            You cannot delete a client who has projects, invoices, or contracts associated with them. 
            You must delete or reassign those items first. This prevents accidental data loss.
          </p>
        </div>
      </section>

      {/* Related topics */}
      <section className="not-prose">
        <h2 className="text-2xl font-bold mb-4">Related Topics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { title: "Client status tracking", href: "/docs/clients/status" as Route },
            { title: "Payment behavior details", href: "/docs/clients/payment-behavior" as Route },
            { title: "Follow-up reminders", href: "/docs/clients/reminders" as Route },
            { title: "Creating projects", href: "/docs/projects" as Route },
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
