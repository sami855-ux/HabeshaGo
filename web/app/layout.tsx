import "./globals.css"
import type { Metadata } from "next"
import { AppProvider } from "@/providers"

import { Plus_Jakarta_Sans } from "next/font/google"

// 🔹 Single Unified Font Family across entire application
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HabeshaGo | Ethiopia's Smart Bus Travel & Ticket Booking Platform",
  description:
    "Search intercity bus routes across Ethiopia, select your seat in real-time, pay with Telebirr & CBE Birr, and travel with digital QR boarding passes.",
  keywords: [
    "HabeshaGo",
    "Ethiopia bus booking",
    "Addis Ababa bus ticket",
    "Telebirr bus payment",
    "CBE Birr",
    "Hawassa bus",
    "Bahir Dar bus",
    "Gondar bus",
    "Ethiopian transit",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
  session?: any
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} font-sans`}
    >
      <body className="font-sans antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
