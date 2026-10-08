"use client"
import { ReactNode, useEffect } from "react"
import { restoreAuthSession } from "@/services/authSession"

export default function SessionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const restoreSession = async () => {
      const params = new URLSearchParams(window.location.search)
      if (params.get("code")) return

      try {
        await restoreAuthSession()
      } catch {
        // The session manager clears stale state. Public auth pages remain usable.
      }
    }

    restoreSession()
  }, [])

  return children
}
