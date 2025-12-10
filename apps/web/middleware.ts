import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of protected routes
const protectedRoutes = ["/user", "/profile", "/settings"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only run middleware on protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // Check for the session token cookie
    const token = req.cookies.get("better-auth.session_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Optionally: you could validate the token here if needed
    // but usually the NestJS API will validate it
  }

  return NextResponse.next()
}

// Apply middleware only to these routes
export const config = {
  matcher: ["/user/:path*", "/profile/:path*", "/settings/:path*"],
}
