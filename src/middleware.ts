import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// This middleware runs for every request that matches the matcher patterns
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Debug - log the token and path
    console.log(`Middleware checking path: ${pathname}`);
    console.log("Token data:", JSON.stringify({
      exists: !!token,
      role: token?.role,
    }, null, 2));

    // Check if the user is authenticated
    if (!token) {
      console.log("No token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin route protection
    if (pathname.startsWith("/dashboard/admin")) {
      console.log(`User role: ${token.role}, checking access to admin path`);
      
      if (token.role !== "admin") {
        console.log("Non-admin user trying to access admin area, redirecting");
        // Redirect non-admin users who try to access admin routes
        return NextResponse.redirect(new URL("/dashboard/user", req.url));
      } else {
        console.log("Admin user confirmed, allowing access");
      }
    }

    // Allow the request to continue
    console.log("Allowing request to proceed");
    return NextResponse.next();
  },
  {
    callbacks: {
      // The authorized callback is called before middleware to check if the user is allowed to access the page
      authorized: ({ token }) => {
        const isAuthorized = !!token;
        console.log("Authorization check:", isAuthorized ? "passed" : "failed");
        return isAuthorized;
      },
    },
  }
);

// Configure which paths this middleware is applied to
export const config = {
  matcher: [
    // Protect dashboard route and all sub-routes under it
    "/dashboard", 
    "/dashboard/:path*"
  ],
};