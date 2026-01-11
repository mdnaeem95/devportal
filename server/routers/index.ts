import { router } from "../trpc";
import { clientRouter } from "./client";
import { projectRouter } from "./project";
import { dashboardRouter } from "./dashboard";
import { invoiceRouter } from "./invoice";
import { templateRouter } from "./template";
import { contractRouter } from "./contract";
import { deliverableRouter } from "./deliverable";
import { stripeRouter } from "./stripe";

export const appRouter = router({
  client: clientRouter,
  project: projectRouter,
  dashboard: dashboardRouter,
  invoice: invoiceRouter,
  template: templateRouter,
  contract: contractRouter,
  deliverable: deliverableRouter,
  stripe: stripeRouter,
});

export type AppRouter = typeof appRouter;
