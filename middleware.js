import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Ensure that this matches your Clerk dashboard configuration.
  // By default, all routes are protected and require authentication.
  // We will make all routes public by default and protect them on a case-by-case basis.
  // Or, more simply for this use case, we can define all routes as public
  // because authentication is only checked explicitly when the user tries to pre-order.
  publicRoutes: [
    "/",
    "/product/(.*)",
    "/api/(.*)", // Allowing API routes, though Clerk might handle API auth differently if needed later
    "/success", // Assuming this is a public page
    // Add any other public routes here if necessary
  ],
});

export const config = {
  matcher: ['/((?!.+\.[\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
