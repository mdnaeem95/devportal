import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import superjson from "superjson";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

/**
 * Context creation
 */
export const createTRPCContext = async () => {
  const { userId: clerkId } = await auth();

  return {
    db,
    clerkId,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * tRPC initialization
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Reusable middleware
 */
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.clerkId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  // Get or create user in our database
  let user = await ctx.db.query.users.findFirst({
    where: eq(users.clerkId, ctx.clerkId),
  });

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not found. Please complete onboarding.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      clerkId: ctx.clerkId,
      user,
    },
  });
});

/**
 * Exports
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
