import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {
  const token = req.cookies.get("refreshToken")?.value
  // const pathname = req.nextUrl.pathname

  // // Protected routes
  // const protectedRoutes = ["/admin", "/user", "/ev-charge-manager"]

  // const isProtectedRoute = protectedRoutes.some((route) =>
  //   pathname.startsWith(route),
  // )

  // // Redirect unauthenticated users
  // if (isProtectedRoute && !token) {
  //   return NextResponse.redirect(new URL("/login", req.url))
  // }

  // // Prevent logged-in users from visiting login/register
  // if (
  //   token &&
  //   (pathname.startsWith("/login") || pathname.startsWith("/phone"))
  // ) {
  //   return NextResponse.redirect(new URL("/", req.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/user/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
}
