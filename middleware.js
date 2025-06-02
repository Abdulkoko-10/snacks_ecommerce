import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Ensure all routes are public for now.
  // Authentication will be triggered by specific actions (e.g., pre-order)
  // within the component logic.
  publicRoutes: ['/(.*)'],
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
