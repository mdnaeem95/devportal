import { router } from "../trpc";
import { clientRouter } from "./client";
import { projectRouter } from "./project";
import { dashboardRouter } from "./dashboard";
import { invoiceRouter } from "./invoice";
import { templateRouter } from "./template";
import { contractRouter } from "./contract";

export const appRouter = router({
  client: clientRouter,
  project: projectRouter,
  dashboard: dashboardRouter,
  invoice: invoiceRouter,
  template: templateRouter,
  contract: contractRouter,
  // TODO: Add more routers as we build them
  // deliverable: deliverableRouter,
});

export type AppRouter = typeof appRouter;
