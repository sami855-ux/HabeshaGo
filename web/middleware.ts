import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // Client-side authentication and role-based access control are enforced by
  // SessionProvider and useRequireRole in each dashboard layout.
  // Next.js middleware cannot access backend-scoped HttpOnly refresh cookies across origins.

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
