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
        const isPassengerOnly =
          allowedRoles.includes("PASSENGER") && allowedRoles.length === 1
        router.replace(isPassengerOnly ? "/login" : "/staff-login")
        return
      }

      if (!allowedRoles.includes(user.role)) {
        if (user.role === "PASSENGER") router.replace("/user")
        else if (user.role === "EV_CHARGER_MANAGER")
          router.replace("/ev-charge-manager")
        else if (user.role === "PARKING_MANAGER")
          router.replace("/admin/manage-parking")
        else router.replace("/admin") // default fallback for staff & admin
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [isReady, isAuthenticated, user, allowedRoles, router])
}
