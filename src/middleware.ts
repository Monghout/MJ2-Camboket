import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  "/", // Homepage is public
  "/sign-in(.*)", // Allow sign-in pages
  "/sign-up(.*)", // Allow sign-up pages
  "/api/webhooks/clerk", // Allow Clerk webhooks to work without auth
  "/api/user",
  "/api/livestreams",
  "/api/live/streams",
  "/api/liveGuest/(.*)",
  "/api/mux",
  "/sellerGuest/stream/(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Check if the route is not public
  if (!isPublicRoute(request)) {
    if (request.url.startsWith("/api")) {
      // Redirect all /api requests (except /api/webhooks/clerk) to homepage
      return Response.redirect("/", 302);
    }
    await auth.protect(); // Protect other routes (not /api)
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // Apply Clerk auth globally except for assets
    "/api/(.*)", // Ensure all API routes run through middleware
  ],
};
