import { clerkMiddleware } from "@clerk/nextjs/server";

// This is the recommended way to configure the middleware
export default clerkMiddleware({
  // Add all public routes here. These can be visited by anyone.
  publicRoutes: [
    "/", // The homepage
    "/api/webhooks/clerk", // The webhook for Clerk to talk to our app
  ],
  
  // Add routes that should be ignored by the middleware entirely.
  // This is useful for static assets or API routes that have their own auth.
  ignoredRoutes: [
    // You can add routes here if needed in the future
  ],
});

export const config = {
  // This matcher ensures the middleware runs on all routes except for
  // internal Next.js routes and static files.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};