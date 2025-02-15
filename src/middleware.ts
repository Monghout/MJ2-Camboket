import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  "/", // Homepage is public
  "/sign-in(.*)", // Allow sign-in pages
  "/sign-up(.*)", // Allow sign-up pages
  "/api/webhooks/clerk", // Allow Clerk webhooks to work without auth
]);

export default clerkMiddleware({
  publicRoutes: isPublicRoute, // Ensure public routes work properly
  ignoredRoutes: ["/api/webhooks/clerk"], // Webhooks should not require authentication
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // Apply Clerk auth globally except for assets
    "/api/(.*)", // Ensure all API routes run through middleware
  ],
};
