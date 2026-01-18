import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/p/(.*)",
  "/sign/(.*)",
  "/pay/(.*)",
  "/api/webhooks/clerk",      // Explicit path
  "/api/webhooks/:path*",     // Or catch-all for any webhook
]);

export default clerkMiddleware(async (auth, req) => {
  // Debug: log webhook requests
  if (req.nextUrl.pathname.startsWith("/api/webhooks")) {
    console.log("Webhook request:", req.method, req.nextUrl.pathname);
  }
  
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};