import "./globals.css"
import type { Metadata } from "next"
import { AppProvider } from "@/providers"

import {
  Mozilla_Headline,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google"

// 🔹 Plus Jakarta Sans (Primary Clean Modern Sans Font Family)
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
})

// 🔹 Mozilla Headline
const mozilla = Mozilla_Headline({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-mozilla",
  display: "swap",
})

// 🔹 Space Grotesk
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-grotesk",
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
      className={`${jakarta.variable} ${grotesk.variable} ${mozilla.variable} font-sans`}
    >
      <body className="font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
