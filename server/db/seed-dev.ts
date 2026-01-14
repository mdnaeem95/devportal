import dotenv from "dotenv";
import path from "path";

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "./index";
import {
  users,
  clients,
  projects,
  milestones,
  invoices,
  templates,
  timeTrackingSettings,
} from "./schema";
import { createId } from "@paralleldrive/cuid2";
import { nanoid } from "nanoid";

// ============================================
// CONFIGURATION - Update these as needed
// ============================================

const DEV_USER = {
  email: "naeemsani95@gmail.com",
  name: "Naeem Sani",
  // IMPORTANT: Replace with your actual Clerk user ID after first sign-in
  // You can find this in Clerk dashboard or by logging ctx.auth.userId
  clerkId: "user_dev_placeholder",
  businessName: "Sani Development",
  businessAddress: "123 Developer Lane\nSingapore 123456",
  currency: "SGD",
};

// ============================================
// SEED DATA
// ============================================

async function seedDevData() {
  console.log("🌱 Starting development seed...\n");

  // Check if user already exists
  let user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, DEV_USER.email),
  });

  if (user) {
    console.log(`✓ User already exists: ${user.email} (ID: ${user.id})`);
    console.log(`  Clerk ID: ${user.clerkId}`);
  } else {
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: createId(),
        clerkId: DEV_USER.clerkId,
        email: DEV_USER.email,
        name: DEV_USER.name,
        businessName: DEV_USER.businessName,
        businessAddress: DEV_USER.businessAddress,
        currency: DEV_USER.currency,
        stripeConnected: false,
      })
      .returning();

    user = newUser;
    console.log(`✓ Created user: ${user.email} (ID: ${user.id})`);
  }

  const userId = user.id;

  // ============================================
  // SEED CLIENTS
  // ============================================

  console.log("\n📧 Seeding clients...");

  const clientsData = [
    {
      name: "Alex Chen",
      email: "alex@techstartup.io",
      company: "TechStartup Inc",
      phone: "+1 555-0101",
      address: "456 Startup Ave, San Francisco, CA 94102",
      notes: "CTO, prefers Slack for communication. Budget flexible for quality work.",
    },
    {
      name: "Sarah Johnson",
      email: "sarah@designagency.co",
      company: "Creative Design Agency",
      phone: "+1 555-0102",
      address: "789 Design District, New York, NY 10001",
      notes: "Marketing director. Has multiple projects in pipeline.",
    },
    {
      name: "Michael Park",
      email: "michael@fintech.com",
      company: "FinTech Solutions",
      phone: "+65 9123 4567",
      address: "1 Raffles Place, Singapore 048616",
      notes: "VP Engineering. Strict deadlines, pays on time.",
    },
    {
      name: "Emma Williams",
      email: "emma@ecommerce.shop",
      company: "E-Commerce Plus",
      phone: "+44 20 7123 4567",
      address: "10 Oxford Street, London W1D 1BS",
      notes: "Founder. Looking for long-term development partner.",
    },
  ];

  const createdClients: Array<{ id: string; name: string }> = [];

  for (const clientData of clientsData) {
    const existing = await db.query.clients.findFirst({
      where: (c, { and, eq }) =>
        and(eq(c.userId, userId), eq(c.email, clientData.email)),
    });

    if (existing) {
      console.log(`  ✓ Client exists: ${clientData.name}`);
      createdClients.push({ id: existing.id, name: existing.name });
    } else {
      const [client] = await db
        .insert(clients)
        .values({
          userId,
          ...clientData,
        })
        .returning();

      console.log(`  ✓ Created client: ${client.name}`);
      createdClients.push({ id: client.id, name: client.name });
    }
  }

  // ============================================
  // SEED PROJECTS
  // ============================================

  console.log("\n📁 Seeding projects...");

  const projectsData = [
    {
      clientIndex: 0, // Alex Chen
      name: "TechStartup Mobile App",
      description:
        "Full-stack mobile app development for iOS and Android. React Native frontend with Node.js backend.",
      status: "active" as const,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-03-31"),
      milestones: [
        { name: "UI/UX Design", amount: 250000, status: "completed" as const },
        { name: "Core Features", amount: 400000, status: "in_progress" as const },
        { name: "API Integration", amount: 300000, status: "pending" as const },
        { name: "Testing & Launch", amount: 150000, status: "pending" as const },
      ],
    },
    {
      clientIndex: 1, // Sarah Johnson
      name: "Agency Website Redesign",
      description:
        "Complete website redesign with Next.js, headless CMS, and animations.",
      status: "active" as const,
      startDate: new Date("2026-01-10"),
      endDate: new Date("2026-02-28"),
      milestones: [
        { name: "Design System", amount: 150000, status: "completed" as const },
        { name: "Frontend Development", amount: 250000, status: "in_progress" as const },
        { name: "CMS Integration", amount: 100000, status: "pending" as const },
      ],
    },
    {
      clientIndex: 2, // Michael Park
      name: "FinTech Dashboard",
      description:
        "Real-time financial dashboard with charts, reports, and data visualization.",
      status: "completed" as const,
      startDate: new Date("2025-10-01"),
      endDate: new Date("2025-12-15"),
      milestones: [
        { name: "Architecture & Setup", amount: 200000, status: "paid" as const },
        { name: "Core Dashboard", amount: 350000, status: "paid" as const },
        { name: "Reports Module", amount: 250000, status: "paid" as const },
      ],
    },
    {
      clientIndex: 3, // Emma Williams
      name: "E-Commerce Platform",
      description:
        "Custom Shopify app with inventory management and analytics.",
      status: "draft" as const,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-05-31"),
      milestones: [
        { name: "Discovery & Planning", amount: 100000, status: "pending" as const },
        { name: "Core App Development", amount: 400000, status: "pending" as const },
        { name: "Shopify Integration", amount: 300000, status: "pending" as const },
        { name: "Launch & Support", amount: 100000, status: "pending" as const },
      ],
    },
  ];

  const createdProjects: Array<{
    id: string;
    name: string;
    clientId: string;
    milestoneIds: string[];
  }> = [];

  for (const projectData of projectsData) {
    const clientId = createdClients[projectData.clientIndex].id;
    const totalAmount = projectData.milestones.reduce((sum, m) => sum + m.amount, 0);

    const existing = await db.query.projects.findFirst({
      where: (p, { and, eq }) =>
        and(eq(p.userId, userId), eq(p.name, projectData.name)),
    });

    if (existing) {
      console.log(`  ✓ Project exists: ${projectData.name}`);

      // Get existing milestones
      const existingMilestones = await db.query.milestones.findMany({
        where: (m, { eq }) => eq(m.projectId, existing.id),
      });

      createdProjects.push({
        id: existing.id,
        name: existing.name,
        clientId,
        milestoneIds: existingMilestones.map((m) => m.id),
      });
    } else {
      const [project] = await db
        .insert(projects)
        .values({
          userId,
          clientId,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          publicId: nanoid(10),
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          totalAmount,
        })
        .returning();

      console.log(`  ✓ Created project: ${project.name}`);

      // Create milestones
      const milestoneIds: string[] = [];
      for (let i = 0; i < projectData.milestones.length; i++) {
        const m = projectData.milestones[i];
        const dueDate = new Date(projectData.startDate);
        dueDate.setDate(
          dueDate.getDate() +
            Math.floor(
              ((projectData.endDate.getTime() - projectData.startDate.getTime()) /
                projectData.milestones.length /
                (1000 * 60 * 60 * 24)) *
                (i + 1)
            )
        );

        const [milestone] = await db
          .insert(milestones)
          .values({
            projectId: project.id,
            name: m.name,
            amount: m.amount,
            status: m.status,
            dueDate,
            order: i,
            completedAt: m.status === "completed" || m.status === "paid" ? new Date() : null,
          })
          .returning();

        milestoneIds.push(milestone.id);
        console.log(`    → Milestone: ${m.name} (${m.status})`);
      }

      createdProjects.push({
        id: project.id,
        name: project.name,
        clientId,
        milestoneIds,
      });
    }
  }

  // ============================================
  // SEED INVOICES
  // ============================================

  console.log("\n💰 Seeding invoices...");

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `INV-${year}${month}-${random}`;
  };

  const invoicesData = [
    {
      projectIndex: 2, // FinTech Dashboard (completed)
      milestoneIndex: 0,
      status: "paid" as const,
      paidAt: new Date("2025-10-20"),
    },
    {
      projectIndex: 2,
      milestoneIndex: 1,
      status: "paid" as const,
      paidAt: new Date("2025-11-15"),
    },
    {
      projectIndex: 2,
      milestoneIndex: 2,
      status: "paid" as const,
      paidAt: new Date("2025-12-20"),
    },
    {
      projectIndex: 0, // TechStartup Mobile App
      milestoneIndex: 0,
      status: "paid" as const,
      paidAt: new Date("2026-01-15"),
    },
    {
      projectIndex: 1, // Agency Website
      milestoneIndex: 0,
      status: "sent" as const,
    },
    {
      projectIndex: 0,
      milestoneIndex: 1,
      status: "draft" as const,
    },
  ];

  for (const invoiceData of invoicesData) {
    const project = createdProjects[invoiceData.projectIndex];
    const milestoneId = project.milestoneIds[invoiceData.milestoneIndex];

    // Get milestone details
    const milestone = await db.query.milestones.findFirst({
      where: (m, { eq }) => eq(m.id, milestoneId),
    });

    if (!milestone) continue;

    // Check if invoice exists for this milestone
    const existing = await db.query.invoices.findFirst({
      where: (i, { and, eq }) =>
        and(eq(i.userId, userId), eq(i.milestoneId, milestoneId)),
    });

    if (existing) {
      console.log(`  ✓ Invoice exists for: ${project.name} - ${milestone.name}`);
      continue;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const lineItems = [
      {
        id: createId(),
        description: `${project.name}: ${milestone.name}`,
        quantity: 1,
        unitPrice: milestone.amount,
        amount: milestone.amount,
      },
    ];

    const [invoice] = await db
      .insert(invoices)
      .values({
        userId,
        clientId: project.clientId,
        projectId: project.id,
        milestoneId,
        invoiceNumber: generateInvoiceNumber(),
        status: invoiceData.status,
        lineItems,
        subtotal: milestone.amount,
        tax: 0,
        total: milestone.amount,
        currency: "SGD",
        dueDate,
        payToken: invoiceData.status !== "draft" ? nanoid(32) : null,
        sentAt: invoiceData.status !== "draft" ? new Date() : null,
        paidAt: invoiceData.paidAt || null,
        paidAmount: invoiceData.paidAt ? milestone.amount : null,
        paymentMethod: invoiceData.paidAt ? "card" : null,
      })
      .returning();

    console.log(
      `  ✓ Created invoice: ${invoice.invoiceNumber} (${invoiceData.status})`
    );
  }

  // ============================================
  // SEED TIME TRACKING SETTINGS
  // ============================================

  console.log("\n⏱️ Seeding time tracking settings...");

  const existingSettings = await db.query.timeTrackingSettings.findFirst({
    where: (s, { eq }) => eq(s.userId, userId),
  });

  if (existingSettings) {
    console.log("  ✓ Time tracking settings already exist");
  } else {
    await db.insert(timeTrackingSettings).values({
      userId,
      defaultHourlyRate: 15000, // $150/hr in cents
      maxRetroactiveDays: 7,
      dailyHourWarning: 720, // 12 hours
      idleTimeoutMinutes: 30,
      roundToMinutes: 15,
      minimumEntryMinutes: 5,
      allowOverlapping: false,
      clientVisibleLogs: true,
      requireDescription: false,
      autoStopAtMidnight: true,
    });
    console.log("  ✓ Created time tracking settings");
  }

  // ============================================
  // SEED SYSTEM TEMPLATES (if not already done)
  // ============================================

  console.log("\n📝 Checking system templates...");

  const existingTemplates = await db.query.templates.findFirst({
    where: (t, { eq }) => eq(t.isSystem, true),
  });

  if (existingTemplates) {
    console.log("  ✓ System templates already exist");
  } else {
    console.log("  ⚠ No system templates found. Run seed-templates.ts to add them.");
  }

  // ============================================
  // SUMMARY
  // ============================================

  console.log("\n" + "=".repeat(50));
  console.log("✅ Development seed complete!");
  console.log("=".repeat(50));
  console.log(`
📊 Summary:
   • User: ${user.email}
   • Clients: ${createdClients.length}
   • Projects: ${createdProjects.length}
   • Invoices: ${invoicesData.length}

⚠️  IMPORTANT: After signing in with Clerk, update the clerkId:

   1. Sign in to the app with ${DEV_USER.email}
   2. Check Clerk dashboard or logs for your actual user ID
   3. Run this SQL to update:

      UPDATE users 
      SET clerk_id = 'user_ACTUAL_ID_HERE' 
      WHERE email = '${DEV_USER.email}';

   Or re-run this script with the correct clerkId in DEV_USER.
`);
}

// Run the seed
seedDevData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });