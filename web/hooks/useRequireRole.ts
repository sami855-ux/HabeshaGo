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
    if (!isReady) return

    // Clear any pending redirect if state updates before timer fires
    if (redirectTimer.current) clearTimeout(redirectTimer.current)

    if (!isAuthenticated || !user) {
      // Small delay to allow state to fully settle before redirecting
      redirectTimer.current = setTimeout(() => {
        router.replace("/login?error=require")
      }, 100)
      return
    }

    if (!allowedRoles.includes(user.role)) {
      redirectTimer.current = setTimeout(() => {
        if (user.role === "PASSENGER") router.replace("/user")
        else if (user.role === "DRIVER") router.replace("/driver")
        else if (user.role === "ADMIN") router.replace("/admin")
        else router.replace("/login?error=login")
      }, 100)
    }

    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current)
    }
  }, [isReady, isAuthenticated, user, allowedRoles, router])
}
