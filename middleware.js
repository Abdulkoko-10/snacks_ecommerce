import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Ensure all routes are public for now.
  // Authentication will be triggered by specific actions (e.g., pre-order)
  // within the component logic.
  publicRoutes: ['/(.*)'],
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
