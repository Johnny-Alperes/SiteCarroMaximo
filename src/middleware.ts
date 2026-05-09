import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to dashboard if already logged in
  if ((pathname === "/login" || pathname === "/register" || pathname === "/") && session) {
    if (pathname !== "/") { // Landing page is allowed
       return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
