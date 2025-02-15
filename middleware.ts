import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  if (isAuthPage) {
    if (token) {
      // If user is authenticated and tries to access auth pages, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Allow access to auth pages for non-authenticated users
    return NextResponse.next();
  }

  // For non-auth pages, check if user is authenticated
  if (!token) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
