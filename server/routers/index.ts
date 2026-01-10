import { router } from "../trpc";
import { clientRouter } from "./client";
import { projectRouter } from "./project";
import { dashboardRouter } from "./dashboard";

export const appRouter = router({
  client: clientRouter,
  project: projectRouter,
  dashboard: dashboardRouter,
  // TODO: Add more routers as we build them
  // invoice: invoiceRouter,
  // contract: contractRouter,
  // deliverable: deliverableRouter,
});

export type AppRouter = typeof appRouter;
