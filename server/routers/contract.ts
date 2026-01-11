import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { contracts, clients, projects, users, templates, milestones } from "../db/schema";
import { eq, desc, and, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { sendContractEmail, sendContractSignedEmails, sendContractDeclinedEmail } from "@/lib/emails";

const contractStatusSchema = z.enum([
  "draft",
  "sent",
  "viewed",
  "signed",
  "declined",
  "expired",
]);

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export const contractRouter = router({
  // List contracts for user
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        clientId: z.string().optional(),
        status: contractStatusSchema.optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(contracts.userId, ctx.user.id)];

      if (input?.projectId) {
        conditions.push(eq(contracts.projectId, input.projectId));
      }
      if (input?.clientId) {
        conditions.push(eq(contracts.clientId, input.clientId));
      }
      if (input?.status) {
        conditions.push(eq(contracts.status, input.status));
      }

      return ctx.db.query.contracts.findMany({
        where: and(...conditions),
        with: {
          client: true,
          project: true,
        },
        orderBy: [desc(contracts.createdAt)],
      });
    }),

  // Get single contract
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.id, input.id),
        with: {
          client: true,
          project: true,
          template: true,
        },
      });

      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      if (contract.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return contract;
    }),

  // Create contract from template
  createFromTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        clientId: z.string(),
        projectId: z.string().optional(),
        name: z.string().min(1),
        variables: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify client
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });

      if (!client || client.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }

      // Get template
      const template = await ctx.db.query.templates.findFirst({
        where: eq(templates.id, input.templateId),
      });

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      // Get user info for variables
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      // Get project if provided
      let project = null;
      let projectMilestones: Array<{ name: string; amount: number; dueDate: Date | null }> = [];
      if (input.projectId) {
        project = await ctx.db.query.projects.findFirst({
          where: eq(projects.id, input.projectId),
        });

        if (project) {
          projectMilestones = await ctx.db.query.milestones.findMany({
            where: eq(milestones.projectId, project.id),
            orderBy: [asc(milestones.order)],
          });
        }
      }

      // Build variables for template
      const variables: Record<string, string> = {
        ...input.variables,
        clientName: client.name,
        clientEmail: client.email,
        clientCompany: client.company || "",
        developerName: user?.name || "",
        developerEmail: user?.email || "",
        businessName: user?.businessName || user?.name || "",
        projectName: project?.name || "",
        projectDescription: project?.description || "",
        totalAmount: project?.totalAmount
          ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(project.totalAmount / 100)
          : "",
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        milestones: projectMilestones.length > 0
          ? projectMilestones
              .map((m, i) => `${i + 1}. ${m.name} - $${(m.amount / 100).toFixed(2)}`)
              .join("\n")
          : "To be determined",
      };

      // Replace variables in template content
      let content = template.content;
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
      }

      // Create contract
      const [contract] = await ctx.db
        .insert(contracts)
        .values({
          userId: ctx.user.id,
          clientId: input.clientId,
          projectId: input.projectId,
          templateId: input.templateId,
          name: input.name,
          content,
          status: "draft",
        })
        .returning();

      return contract;
    }),

  // Create blank contract
  create: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        projectId: z.string().optional(),
        name: z.string().min(1),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify client
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });

      if (!client || client.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }

      const [contract] = await ctx.db
        .insert(contracts)
        .values({
          userId: ctx.user.id,
          clientId: input.clientId,
          projectId: input.projectId,
          name: input.name,
          content: input.content,
          status: "draft",
        })
        .returning();

      return contract;
    }),

  // Update contract
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.id, input.id),
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      if (existing.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only edit draft contracts",
        });
      }

      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(contracts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(contracts.id, id))
        .returning();

      return updated;
    }),

  // Send contract for signature
  send: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.id, input.id),
        with: {
          client: true,
          project: true,
        },
      });

      if (!contract || contract.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      if (contract.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contract has already been sent",
        });
      }

      // Get user/business info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      // Generate sign token
      const signToken = nanoid(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days to sign

      // Update contract
      const [updated] = await ctx.db
        .update(contracts)
        .set({
          status: "sent",
          signToken,
          sentAt: new Date(),
          expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, input.id))
        .returning();

      // Send email to client
      const signUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign/${signToken}`;
      
      await sendContractEmail({
        clientEmail: contract.client.email,
        clientName: contract.client.name,
        contractName: contract.name,
        projectName: contract.project?.name,
        developerName: user?.name || "Developer",
        developerEmail: user?.email || "",
        signUrl,
        expiresAt: formatDate(expiresAt),
        businessName: user?.businessName || "",
        businessLogo: user?.logoUrl ?? undefined,
      });

      return updated;
    }),

  // Delete contract
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.id, input.id),
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      await ctx.db.delete(contracts).where(eq(contracts.id, input.id));
      return { success: true };
    }),

  // ============ PUBLIC ENDPOINTS ============

  // Get contract by sign token (for signing page)
  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.signToken, input.token),
        with: {
          client: true,
          project: true,
        },
      });

      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      // Check if expired
      if (contract.expiresAt && new Date() > contract.expiresAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Contract has expired" });
      }

      // Mark as viewed if first time
      if (contract.status === "sent") {
        await ctx.db
          .update(contracts)
          .set({ status: "viewed", viewedAt: new Date() })
          .where(eq(contracts.id, contract.id));
      }

      // Get business info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, contract.userId),
      });

      return {
        id: contract.id,
        name: contract.name,
        content: contract.content,
        status: contract.status,
        signedAt: contract.signedAt,
        clientSignature: contract.clientSignature,
        client: {
          name: contract.client.name,
          email: contract.client.email,
        },
        project: contract.project
          ? { name: contract.project.name }
          : null,
        business: user
          ? {
              name: user.businessName || user.name,
              email: user.email,
              logoUrl: user.logoUrl,
            }
          : null,
      };
    }),

  // Sign contract
  sign: publicProcedure
    .input(
      z.object({
        token: z.string(),
        signature: z.string().min(1),
        signatureType: z.enum(["drawn", "typed"]),
        clientIp: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.signToken, input.token),
        with: {
          client: true,
          project: true,
        },
      });

      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      if (contract.status === "signed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Contract already signed" });
      }

      if (contract.status === "declined") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Contract was declined" });
      }

      if (contract.expiresAt && new Date() > contract.expiresAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Contract has expired" });
      }

      const signedAt = new Date();

      // Update contract
      const [updated] = await ctx.db
        .update(contracts)
        .set({
          status: "signed",
          clientSignature: input.signature,
          clientIp: input.clientIp,
          signedAt,
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, contract.id))
        .returning();

      // Get developer info for emails
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, contract.userId),
      });

      // Send confirmation emails
      const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign/${input.token}`;
      
      await sendContractSignedEmails({
        clientEmail: contract.client.email,
        clientName: contract.client.name,
        developerEmail: user?.email || "",
        developerName: user?.name || "Developer",
        contractName: contract.name,
        projectName: contract.project?.name,
        signedAt: formatDate(signedAt),
        viewUrl,
        businessName: user?.businessName || "",
        businessLogo: user?.logoUrl ?? undefined,
      });

      return updated;
    }),

  // Decline contract
  decline: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.signToken, input.token),
        with: {
          client: true,
          project: true,
        },
      });

      if (!contract) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      }

      if (contract.status === "signed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Contract already signed" });
      }

      const [updated] = await ctx.db
        .update(contracts)
        .set({
          status: "declined",
          updatedAt: new Date(),
        })
        .where(eq(contracts.id, contract.id))
        .returning();

      // Get developer info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, contract.userId),
      });

      // Notify developer
      const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/contracts/${contract.id}`;
      
      await sendContractDeclinedEmail({
        developerEmail: user?.email || "",
        developerName: user?.name || "Developer",
        clientEmail: contract.client.email,
        clientName: contract.client.name,
        contractName: contract.name,
        projectName: contract.project?.name,
        viewUrl,
      });

      return updated;
    }),
});