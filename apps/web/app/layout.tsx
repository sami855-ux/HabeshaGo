import type { Metadata } from "next"
import Provider from "./Provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Smart Mobility Hub for addis",
  description: "Transportaion means for addis abeba city, Ethiopia,",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
