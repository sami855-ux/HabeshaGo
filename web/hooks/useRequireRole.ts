"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
// import { AppDispatch, RootState } from "@/store/store"

// ✅ NO fetchCurrentUser here — useOAuthExchange owns that
export const useRequireRole = (allowedRoles: string[]) => {
  const router = useRouter()
  const { user, isAuthenticated, isReady } = useSelector(
    (state: RootState) => state.user,
  )

  useEffect(() => {
    // ✅ Wait until auth is fully resolved before making any decisions
    if (!isReady) return

    // Not authenticated — send to login
    if (!isAuthenticated || !user) {
      router.replace("/login")
      return
    }

    // Authenticated but wrong role
    if (!allowedRoles.includes(user.role)) {
      if (user.role === "PASSENGER") router.replace("/user")
      else if (user.role === "DRIVER") router.replace("/driver")
      else if (user.role === "ADMIN") router.replace("/admin")
      else router.replace("/login")
    }
  }, [isReady, isAuthenticated, user, allowedRoles, router])
}
