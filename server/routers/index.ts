import { router } from "../trpc";
import { clientRouter } from "./client";
import { projectRouter } from "./project";
import { dashboardRouter } from "./dashboard";
import { invoiceRouter } from "./invoice";
import { templateRouter } from "./template";
import { contractRouter } from "./contract";
import { deliverableRouter } from "./deliverable";
import { stripeRouter } from "./stripe";
import { settingsRouter } from "./settings";
import { timeTrackingRouter } from "./time-tracking";
import { milestoneRouter } from "./milestones";

export const appRouter = router({
  clients: clientRouter,
  project: projectRouter,
  dashboard: dashboardRouter,
  invoice: invoiceRouter,
  template: templateRouter,
  contract: contractRouter,
  deliverable: deliverableRouter,
  stripe: stripeRouter,
  settings: settingsRouter,
  timeTracking: timeTrackingRouter,
  milestones: milestoneRouter,
});

export type AppRouter = typeof appRouter;
