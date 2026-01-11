import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { contracts, clients, projects, templates, users, milestones } from "../db/schema";
import { eq, desc, and, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const contractRouter = router({
  // List all contracts for the current user
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        clientId: z.string().optional(),
        status: z.enum(["draft", "sent", "viewed", "signed", "declined", "expired"]).optional(),
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

      const results = await ctx.db.query.contracts.findMany({
        where: and(...conditions),
        with: {
          client: true,
          project: true,
        },
        orderBy: [desc(contracts.createdAt)],
      });

      return results;
    }),

  // Get a single contract by ID
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      if (contract.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this contract",
        });
      }

      return contract;
    }),

  // Create a new contract
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        clientId: z.string(),
        projectId: z.string().optional(),
        templateId: z.string().optional(),
        content: z.string().min(1, "Content is required"),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify client belongs to user
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });

      if (!client || client.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Verify project if provided
      if (input.projectId) {
        const project = await ctx.db.query.projects.findFirst({
          where: eq(projects.id, input.projectId),
        });

        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }
      }

      const [contract] = await ctx.db
        .insert(contracts)
        .values({
          userId: ctx.user.id,
          clientId: input.clientId,
          projectId: input.projectId,
          templateId: input.templateId,
          name: input.name,
          content: input.content,
          expiresAt: input.expiresAt,
        })
        .returning();

      return contract;
    }),

  // Create contract from template with variable substitution
  createFromTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        clientId: z.string(),
        projectId: z.string().optional(),
        name: z.string(),
        variables: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get template
      const template = await ctx.db.query.templates.findFirst({
        where: eq(templates.id, input.templateId),
      });

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      // Verify client
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });

      if (!client || client.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Get project if provided
      let project = null;
      let projectMilestones: Array<{ name: string; amount: number; dueDate: Date | null }> = [];
      let milestonesText = "";
      
      if (input.projectId) {
        project = await ctx.db.query.projects.findFirst({
          where: eq(projects.id, input.projectId),
        });

        if (project) {
          // Fetch milestones separately
          projectMilestones = await ctx.db.query.milestones.findMany({
            where: eq(milestones.projectId, project.id),
            orderBy: [asc(milestones.order)],
          });

          milestonesText = projectMilestones
            .map((m, i) => `${i + 1}. **${m.name}** - $${(m.amount / 100).toFixed(2)}${m.dueDate ? ` (Due: ${new Date(m.dueDate).toLocaleDateString()})` : ""}`)
            .join("\n");
        }
      }

      // Get user info
      const user = ctx.user;

      // Substitute variables
      let content = template.content;
      const defaultVariables: Record<string, string> = {
        date: new Date().toLocaleDateString(),
        client_name: client.name,
        client_company: client.company || "",
        client_email: client.email,
        developer_name: user.businessName || user.name || "",
        developer_email: user.email || "",
        project_name: project?.name || input.name,
        start_date: project?.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD",
        end_date: project?.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD",
        total_amount: project?.totalAmount ? `$${(project.totalAmount / 100).toFixed(2)}` : "TBD",
        milestones: milestonesText || "To be defined",
        scope_description: project?.description || "To be defined",
        ...input.variables,
      };

      // Replace all {{variable}} patterns
      Object.entries(defaultVariables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
        content = content.replace(regex, value);
      });

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
        })
        .returning();

      return contract;
    }),

  // Update contract (only drafts)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        content: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.id, id),
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      if (existing.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft contracts can be edited",
        });
      }

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
        with: { client: true },
      });

      if (!contract || contract.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      if (contract.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contract has already been sent",
        });
      }

      // Set expiry to 30 days from now if not set
      const expiresAt = contract.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const [updated] = await ctx.db
        .update(contracts)
        .set({
          status: "sent",
          sentAt: new Date(),
          expiresAt,
        })
        .where(eq(contracts.id, input.id))
        .returning();

      // TODO: Send email to client with sign link
      // const signUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${contract.signToken}`;

      return updated;
    }),

  // Developer pre-sign
  developerSign: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        signature: z.string(), // Base64 signature or typed name
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.id, input.id),
      });

      if (!contract || contract.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      const [updated] = await ctx.db
        .update(contracts)
        .set({
          developerSignature: input.signature,
          developerSignedAt: new Date(),
        })
        .where(eq(contracts.id, input.id))
        .returning();

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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      // Don't allow deleting signed contracts
      if (existing.status === "signed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete signed contracts",
        });
      }

      await ctx.db.delete(contracts).where(eq(contracts.id, input.id));

      return { success: true };
    }),

  // ============ PUBLIC ENDPOINTS ============

  // Get contract by sign token (public)
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      // Check if expired
      if (contract.expiresAt && new Date(contract.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This contract has expired",
        });
      }

      // Check if already signed
      if (contract.status === "signed") {
        // Return limited info for already signed contracts
        return {
          id: contract.id,
          name: contract.name,
          status: contract.status as "signed",
          signedAt: contract.signedAt,
          alreadySigned: true as const,
        };
      }

      // Mark as viewed if not already
      if (contract.status === "sent" && !contract.viewedAt) {
        await ctx.db
          .update(contracts)
          .set({ viewedAt: new Date(), status: "viewed" })
          .where(eq(contracts.id, contract.id));
      }

      // Get user/business info
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, contract.userId),
      });

      return {
        id: contract.id,
        name: contract.name,
        content: contract.content,
        status: contract.status,
        expiresAt: contract.expiresAt,
        developerSignature: contract.developerSignature,
        developerSignedAt: contract.developerSignedAt,
        signedAt: contract.signedAt,
        client: contract.client ? {
          name: contract.client.name,
          email: contract.client.email,
          company: contract.client.company,
        } : null,
        project: contract.project ? {
          name: contract.project.name,
        } : null,
        business: user ? {
          name: user.businessName || user.name,
          email: user.email,
        } : null,
        alreadySigned: false as const,
      };
    }),

  // Sign contract (public)
  sign: publicProcedure
    .input(
      z.object({
        token: z.string(),
        signature: z.string(), // Base64 signature image or typed name
        signedName: z.string(),
        signedEmail: z.string().email(),
        agreedToTerms: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.agreedToTerms) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must agree to the terms",
        });
      }

      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.signToken, input.token),
      });

      if (!contract) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      if (contract.status === "signed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contract has already been signed",
        });
      }

      if (contract.expiresAt && new Date(contract.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contract has expired",
        });
      }

      // Get IP and user agent from headers (would need to pass through context)
      const clientIp = "127.0.0.1"; // TODO: Get from request
      const clientUserAgent = "Unknown"; // TODO: Get from request

      const [updated] = await ctx.db
        .update(contracts)
        .set({
          status: "signed",
          signedAt: new Date(),
          clientSignature: input.signature,
          clientSignedName: input.signedName,
          clientSignedEmail: input.signedEmail,
          clientIp,
          clientUserAgent,
        })
        .where(eq(contracts.id, contract.id))
        .returning();

      // TODO: Generate PDF
      // TODO: Send confirmation emails to both parties

      return { success: true, signedAt: updated.signedAt };
    }),

  // Decline contract (public)
  decline: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const contract = await ctx.db.query.contracts.findFirst({
        where: eq(contracts.signToken, input.token),
      });

      if (!contract) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contract not found",
        });
      }

      if (contract.status === "signed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contract has already been signed",
        });
      }

      await ctx.db
        .update(contracts)
        .set({
          status: "declined",
          declinedAt: new Date(),
        })
        .where(eq(contracts.id, contract.id));

      // TODO: Notify developer

      return { success: true };
    }),
});