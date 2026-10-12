import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Staff Sign In | HabeshaGo Operations",
  description: "Enterprise Operations and Fleet Management Staff Portal",
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${inter.className} min-h-screen bg-white text-slate-900 antialiased font-inter`}
      style={{
        fontFamily: `${inter.style.fontFamily}, sans-serif`,
      }}
    >
      <style>{`
        body,
        button,
        input,
        select,
        textarea,
        code,
        kbd,
        samp,
        pre {
          font-family: ${inter.style.fontFamily}, sans-serif !important;
        }
      `}</style>
      {children}
    </div>
  )
}
