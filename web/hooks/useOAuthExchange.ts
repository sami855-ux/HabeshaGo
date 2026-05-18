"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { setAccessToken, fetchCurrentUser } from "@/store/slices/userSlice"
import { useAppDispatch } from "@/store/store"
import { axiosInstance } from "@/services/axiosInstance"

export const useOAuthExchange = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (code) {
      // OAuth redirect — exchange code for token then fetch user
      const exchange = async () => {
        try {
          const { data } = await axiosInstance.get("/auth/exchange", {
            params: { code },
            withCredentials: true,
          })

          dispatch(setAccessToken(data.accessToken))
          await dispatch(fetchCurrentUser())
          router.replace(window.location.pathname)
        } catch (err) {
          console.error("OAuth exchange error:", err)
          router.replace("/login?error=auth_failed")
        }
      }
      exchange()
    } else {
      // Normal page load — try to restore session via refresh token cookie
      dispatch(fetchCurrentUser())
    }
  }, []) // ✅ runs exactly once on mount
}
