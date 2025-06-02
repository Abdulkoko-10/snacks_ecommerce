import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // Ensure all routes are public for now.
  // Authentication will be triggered by specific actions (e.g., pre-order)
  // within the component logic.
  publicRoutes: ['/(.*)'],
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
