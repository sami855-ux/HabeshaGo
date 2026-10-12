import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Admin Command Center | HabeshaGo",
  description: "Operations and fleet management control center for HabeshaGo",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${inter.className} admin-font-scope antialiased min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
      style={{
        fontFamily: `${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      }}
    >
      <style>{`
        .admin-font-scope,
        .admin-font-scope *,
        .admin-font-scope [data-slot],
        .admin-font-scope button,
        .admin-font-scope input,
        .admin-font-scope select,
        .admin-font-scope textarea {
          font-family: ${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
      `}</style>
      {children}
    </div>
  )
}
