import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Passenger Commute Portal | HabeshaGo",
  description: "Book corridor minibuses, city taxis, and intercity buses across Addis Ababa",
}

export default function PassengerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${inter.className} passenger-font-scope antialiased min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
      style={{
        fontFamily: `${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      }}
    >
      <style>{`
        .passenger-font-scope,
        .passenger-font-scope *,
        .passenger-font-scope [data-slot],
        .passenger-font-scope button,
        .passenger-font-scope input,
        .passenger-font-scope select,
        .passenger-font-scope textarea {
          font-family: ${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
      `}</style>
      {children}
    </div>
  )
}
