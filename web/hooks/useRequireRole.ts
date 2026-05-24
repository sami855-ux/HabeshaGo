"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { RootState } from "@/store"
import { useAppSelector } from "@/store/store"

export const useRequireRole = (allowedRoles: string[]) => {
  const router = useRouter()
  const { user, isAuthenticated, isReady } = useAppSelector(
    (state: RootState) => state.user,
  )

  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    // skip OAuth callback
    if (code) return
    if (!isReady) return

    // ✅ global small delay BEFORE running any auth logic
    const timer = setTimeout(() => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current)

      if (!isAuthenticated || !user) {
        router.replace("/login?error=require")
        return
      }

      if (!allowedRoles.includes(user.role)) {
        if (user.role === "PASSENGER") router.replace("/user")
        else if (user.role === "DRIVER") router.replace("/driver")
        else if (user.role === "ADMIN") router.replace("/admin")
        else router.replace("/login?error=login")
      }
    }, 400) // 👈 adjust delay here (300–600ms is ideal)

    return () => clearTimeout(timer)
  }, [isReady, isAuthenticated, user, allowedRoles, router])
}
