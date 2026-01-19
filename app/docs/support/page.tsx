import Link from "next/link";
import { Metadata, Route } from "next";
import { Mail, Twitter, MessageCircle, Clock, HelpCircle, BookOpen, ArrowRight } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Contact Support",
  description: "Get help from the Zovo team. Contact support via email or Twitter.",
};

export default function SupportPage() {
  return (
    <DocsLayout pathname="/docs/support">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Contact Support</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Need help? We're here for you. Reach out through any of the channels below.
      </p>

      {/* Contact options */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6" id="contact">Get in Touch</h2>

        <div className="not-prose grid gap-4 sm:grid-cols-2">
          {/* Email */}
          <a
            href="mailto:support@zovo.dev"
            className="flex items-start gap-4 p-5 rounded-lg border border-border/50 bg-card/50 hover:border-border hover:bg-card transition-colors group"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Email Support
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-primary font-medium mt-1">support@zovo.dev</p>
              <p className="text-sm text-muted-foreground mt-1">
                We typically respond within 24 hours
              </p>
            </div>
          </a>

          {/* Twitter */}
          <a
            href="https://twitter.com/zabordev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 rounded-lg border border-border/50 bg-card/50 hover:border-border hover:bg-card transition-colors group"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1DA1F2]/10">
              <Twitter className="h-6 w-6 text-[#1DA1F2]" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Twitter / X
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-[#1DA1F2] font-medium mt-1">@zabordev</p>
              <p className="text-sm text-muted-foreground mt-1">
                Quick questions and updates
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* Response times */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="response-times">Response Times</h2>

        <div className="not-prose rounded-lg border border-border/50 bg-card/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-3 font-medium">Priority</th>
                <th className="text-left p-3 font-medium">Response Time</th>
                <th className="text-left p-3 font-medium">Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3">
                  <span className="text-red-600 font-medium">Critical</span>
                </td>
                <td className="p-3 text-muted-foreground">Within 4 hours</td>
                <td className="p-3 text-sm text-muted-foreground">Payment issues, data loss, security</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="text-yellow-600 font-medium">High</span>
                </td>
                <td className="p-3 text-muted-foreground">Within 24 hours</td>
                <td className="p-3 text-sm text-muted-foreground">Feature not working, urgent questions</td>
              </tr>
              <tr>
                <td className="p-3">
                  <span className="text-blue-600 font-medium">Normal</span>
                </td>
                <td className="p-3 text-muted-foreground">Within 48 hours</td>
                <td className="p-3 text-sm text-muted-foreground">General questions, feedback</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          <Clock className="h-4 w-4 inline mr-1" />
          Support hours: Monday–Friday, 9am–6pm EST. Urgent issues are monitored on weekends.
        </p>
      </section>

      {/* Before contacting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="before-contacting">Before Contacting Support</h2>
        <p className="mb-4">
          Many questions can be answered quickly by checking these resources:
        </p>

        <div className="not-prose grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: HelpCircle,
              title: "FAQ",
              description: "Common questions answered",
              href: "/docs/faq" as Route,
            },
            {
              icon: BookOpen,
              title: "Documentation",
              description: "Guides for all features",
              href: "/docs" as Route,
            },
          ].map((resource) => (
            <Link
              key={resource.title}
              href={resource.href}
              className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-border hover:bg-card/50 transition-colors group"
            >
              <resource.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">{resource.title}</h3>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
            </Link>
          ))}
        </div>
      </section>

      {/* What to include */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4" id="what-to-include">What to Include in Your Message</h2>
        <p className="mb-4">
          Help us help you faster by including:
        </p>

        <div className="not-prose space-y-3">
          {[
            "Your account email",
            "What you were trying to do",
            "What happened instead (include error messages if any)",
            "Steps to reproduce the issue",
            "Screenshots if helpful",
            "Browser and device information",
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {index + 1}
              </div>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature requests */}
      <section className="not-prose">
        <div className="rounded-lg border border-border/50 bg-card/50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
              <MessageCircle className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Feature Requests & Feedback</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Have an idea for Zovo? We'd love to hear it! Send feature requests to{" "}
                <a href="mailto:feedback@zovo.dev" className="text-primary hover:underline">
                  feedback@zovo.dev
                </a>{" "}
                or use the thumbs up/down buttons in the app.
              </p>
              <p className="text-sm text-muted-foreground">
                We read every piece of feedback and use it to prioritize our roadmap.
              </p>
            </div>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
