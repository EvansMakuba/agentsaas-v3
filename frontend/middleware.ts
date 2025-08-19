// authMiddleware is a helper from Clerk that does all the heavy listing  of checking the user's session.
// publicRoutes: This is our "guest list". Any route listed here can be visisted by the public. We've allowd /sign-in and /sign-up. All other routes will now require a user to be looged in.

// The import name has been changed from authMiddleware to clerkMiddleware
import { clerkMiddleware } from "@clerk/nextjs/server";

// The function call has also been changed to match
export default clerkMiddleware({
  // Define the routes that can be accessed by anyone, even if they are not signed in.
  // We need to make our sign-in and sign-up pages public.
  publicRoutes: ["/sign-in", "/sign-up"],
});

export const config = {
  // This part remains exactly the same.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};