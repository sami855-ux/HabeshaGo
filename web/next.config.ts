import type { NextConfig } from "next"

/**
 * The browser must talk to the API through this origin.  Access tokens are
 * deliberately kept in memory, so restoring a page after a reload depends on
 * the HttpOnly refresh-token cookie.  Calling the Render API directly makes
 * that cookie third-party for the Vercel site, which modern browsers can omit.
 */
const configuredApiUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api"
const backendApiUrl = configuredApiUrl.replace(/\/$/, "")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
