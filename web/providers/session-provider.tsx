"use client"

import { restoreAuthSession } from "@/services"
import { useEffect, ReactNode } from "react"

export function SessionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    restoreAuthSession().catch(() => {
      // Unauthenticated visitor is normal on public pages
    })
  }, [])

}
