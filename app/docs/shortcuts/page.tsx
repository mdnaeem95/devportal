import { Metadata } from "next";
import { Command, ArrowRight } from "lucide-react";
import { DocsLayout } from "@/components/docs/docs-layout";

export const metadata: Metadata = {
  title: "Keyboard Shortcuts",
  description: "Master Zovo with keyboard shortcuts for faster navigation and actions.",
};

const shortcuts = [
  {
    category: "Global",
    items: [
      { keys: ["⌘", "K"], action: "Open command palette", description: "Quick navigation and search" },
      { keys: ["⌘", "T"], action: "Start/stop timer", description: "Toggle time tracking" },
      { keys: ["Esc"], action: "Close dialogs", description: "Close modals and dropdowns" },
    ],
  },
  {
    category: "Navigation",
    items: [
      { keys: ["⌘", "K", "then", "d"], action: "Go to Dashboard", description: "Type 'd' after opening palette" },
      { keys: ["⌘", "K", "then", "p"], action: "Go to Projects", description: "Type 'p' after opening palette" },
      { keys: ["⌘", "K", "then", "c"], action: "Go to Clients", description: "Type 'c' after opening palette" },
      { keys: ["⌘", "K", "then", "i"], action: "Go to Invoices", description: "Type 'i' after opening palette" },
      { keys: ["⌘", "K", "then", "s"], action: "Go to Settings", description: "Type 's' after opening palette" },
    ],
  },
  {
    category: "Quick Actions",
    items: [
      { keys: ["⌘", "K", "then", "new project"], action: "Create project", description: "Type 'new project'" },
      { keys: ["⌘", "K", "then", "new client"], action: "Create client", description: "Type 'new client'" },
      { keys: ["⌘", "K", "then", "new invoice"], action: "Create invoice", description: "Type 'new invoice'" },
      { keys: ["⌘", "K", "then", "new contract"], action: "Create contract", description: "Type 'new contract'" },
    ],
  },
];

export default function ShortcutsPage() {
  return (
    <DocsLayout pathname="/docs/shortcuts">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Keyboard Shortcuts</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Navigate faster and work more efficiently with these keyboard shortcuts.
      </p>

      {/* Quick tip */}
      <div className="not-prose mb-12 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Command className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium">Pro tip: The Command Palette</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Press <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs mx-1">⌘K</kbd> 
              (or <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs mx-1">Ctrl+K</kbd> on Windows) 
              to open the command palette. From there, you can quickly navigate to any page, 
              create new items, or search your data.
            </p>
          </div>
        </div>
      </div>

      {/* Shortcuts by category */}
      {shortcuts.map((section) => (
        <section key={section.category} className="mb-12">
          <h2 className="text-2xl font-bold mb-4" id={section.category.toLowerCase()}>
            {section.category}
          </h2>

          <div className="not-prose rounded-lg border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-3 font-medium w-48">Shortcut</th>
                  <th className="text-left p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {section.items.map((shortcut, index) => (
                  <tr key={index} className="hover:bg-card/50">
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          key === "then" ? (
                            <ArrowRight key={keyIndex} className="h-3 w-3 text-muted-foreground mx-1" />
                          ) : (
                            <kbd 
                              key={keyIndex}
                              className="rounded border border-border bg-secondary px-2 py-1 text-xs font-mono"
                            >
                              {key}
                            </kbd>
                          )
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <span className="font-medium">{shortcut.action}</span>
                        <span className="text-sm text-muted-foreground ml-2">— {shortcut.description}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* Platform note */}
      <section className="not-prose">
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <h3 className="font-medium mb-2">Platform Notes</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• On Mac, use <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs">⌘</kbd> (Command)</li>
            <li>• On Windows/Linux, use <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs">Ctrl</kbd></li>
            <li>• Shortcuts work in all browsers</li>
          </ul>
        </div>
      </section>
    </DocsLayout>
  );
}
