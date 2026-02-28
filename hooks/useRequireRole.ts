"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store"
import { fetchCurrentUser } from "@/store/slices/userSlice"

export const useRequireRole = (allowedRoles: string[]) => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.user
  )

  console.log("user" + user, "isAuthenticated" + isAuthenticated)

  useEffect(() => {
    // Fetch user if not loaded yet
    if (!user && !loading) {
      dispatch(fetchCurrentUser())
      return
    }

    // While loading, do nothing
    if (loading) return

    // Not logged in
    if (!isAuthenticated || !user) {
      router.replace("/login")
      return
    }

    // Logged in but role not allowed
    if (!allowedRoles.includes(user.role)) {
      if (user.role === "PASSENGER") {
        router.replace("/user") 
      } else if (user.role === "DRIVER") {
        router.replace("/login")
      } else if (user.role === "ADMIN") {
        router.replace("/admin")
      }
    }
  }, [isAuthenticated, allowedRoles, dispatch])
}
