import Link from "next/link";
import { Metadata, Route } from "next";
import { Bell, Mail, CheckCircle2, Zap, ArrowRight, Receipt, FileText, Download } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Notification Settings",
  description: "Configure which email notifications you receive from Zovo.",
};

export default function NotificationSettingsPage() {
  return (
    <DocsLayout pathname="/docs/settings/notifications">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Notification Settings</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Control which email notifications you receive. Stay informed about important events 
        without inbox overload.
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="overview">Overview</h2>
        
        <p className="mb-4">
          Zovo sends email notifications for important events like payments, signatures, and 
          downloads. Each notification type can be enabled or disabled independently.
        </p>

        <p className="mb-4">
          To manage notifications:
        </p>

        <ol className="mb-6 space-y-2 list-decimal list-inside">
          <li>Go to <strong>Settings</strong></li>
          <li>Find the <strong>Notifications</strong> section</li>
          <li>Toggle each notification type on or off</li>
        </ol>
      </section>

      {/* Invoice notifications */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="invoices">Invoice Notifications</h2>
        
        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex items-start gap-3">
              <Receipt className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium">Invoice paid</h4>
                <p className="text-sm text-muted-foreground">
                  Receive an email when a client pays an invoice
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Default: On</span>
              <div className="h-6 w-10 rounded-full bg-success/20 flex items-center justify-end pr-1">
                <div className="h-4 w-4 rounded-full bg-success" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Invoice viewed</h4>
                <p className="text-sm text-muted-foreground">
                  Receive an email when a client views an invoice
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Default: Off</span>
              <div className="h-6 w-10 rounded-full bg-secondary flex items-center pl-1">
                <div className="h-4 w-4 rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="not-prose mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            Pro tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Keep "Invoice paid" enabled — it's important to know when you've been paid. "Invoice 
            viewed" can create noise if clients check invoices multiple times.
          </p>
        </div>
      </section>

      {/* Contract notifications */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="contracts">Contract Notifications</h2>
        
        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h4 className="font-medium">Contract signed</h4>
                <p className="text-sm text-muted-foreground">
                  Receive an email when a client signs a contract
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Default: On</span>
              <div className="h-6 w-10 rounded-full bg-success/20 flex items-center justify-end pr-1">
                <div className="h-4 w-4 rounded-full bg-success" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium">Contract declined</h4>
                <p className="text-sm text-muted-foreground">
                  Receive an email when a client declines a contract
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Default: On</span>
              <div className="h-6 w-10 rounded-full bg-success/20 flex items-center justify-end pr-1">
                <div className="h-4 w-4 rounded-full bg-success" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Contract viewed</h4>
                <p className="text-sm text-muted-foreground">
                  Receive an email when a client views a contract
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Default: Off</span>
              <div className="h-6 w-10 rounded-full bg-secondary flex items-center pl-1">
                <div className="h-4 w-4 rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverable notifications */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="deliverables">Deliverable Notifications</h2>
        
        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">File downloaded</h4>
                <p className="text-sm text-muted-foreground">
                  Receive an email when a client downloads a deliverable
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Default: Off</span>
              <div className="h-6 w-10 rounded-full bg-secondary flex items-center pl-1">
                <div className="h-4 w-4 rounded-full bg-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Download notifications can be useful for important deliverables where you want 
          confirmation that the client received the files.
        </p>
      </section>

      {/* Reminder notifications */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="reminders">Reminder Notifications</h2>
        
        <div className="not-prose space-y-3 mb-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Client follow-up reminders</h4>
                <p className="text-sm text-muted-foreground">
                  Receive email reminders for follow-ups you've scheduled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Default: On</span>
              <div className="h-6 w-10 rounded-full bg-success/20 flex items-center justify-end pr-1">
                <div className="h-4 w-4 rounded-full bg-success" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Milestone due date reminders</h4>
                <p className="text-sm text-muted-foreground">
                  Receive reminders before milestone due dates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Default: On</span>
              <div className="h-6 w-10 rounded-full bg-success/20 flex items-center justify-end pr-1">
                <div className="h-4 w-4 rounded-full bg-success" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email format */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="format">Email Format</h2>
        
        <p className="mb-4">
          All notification emails:
        </p>

        <ul className="mb-4 space-y-2">
          <li>• Include your logo and business name in the header</li>
          <li>• Have clear subject lines describing the event</li>
          <li>• Contain direct links to the relevant item in Zovo</li>
          <li>• Are sent from <code className="px-1.5 py-0.5 rounded bg-secondary text-sm">noreply@zovo.dev</code></li>
          <li>• Include reply-to headers so responses go to your email</li>
        </ul>
      </section>

      {/* Best practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="best-practices">Best Practices</h2>
        
        <div className="not-prose space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Keep payment notifications on</h4>
              <p className="text-sm text-muted-foreground">
                Always know when you've been paid — this is critical for cash flow management.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Enable contract signed/declined</h4>
              <p className="text-sm text-muted-foreground">
                Know immediately when contracts are signed so you can start work, or declined 
                so you can follow up.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium">Consider disabling "viewed" notifications</h4>
              <p className="text-sm text-muted-foreground">
                These can create noise if clients check documents multiple times. Enable them 
                only if you need to track engagement closely.
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
            { title: "Account setup", href: "/docs/account-setup" as Route },
            { title: "Payment reminders", href: "/docs/invoices/reminders" as Route },
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
