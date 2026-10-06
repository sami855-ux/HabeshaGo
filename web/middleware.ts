import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("refreshToken")?.value
  const pathname = req.nextUrl.pathname

  // Protected staff routes
  const isStaffRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/ev-charge-manager")

  // Protected passenger routes
  const isPassengerRoute =
    pathname.startsWith("/user") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings")

  // Redirect unauthenticated requests with no refresh token cookie
  if (!token) {
    if (isStaffRoute) {
      return NextResponse.redirect(new URL("/staff-login", req.url))
    }
    if (isPassengerRoute) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/ev-charge-manager/:path*",
    "/user/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
}
