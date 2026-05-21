"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { markReady, setAccessToken } from "@/store/slices/userSlice"
import { fetchCurrentUser } from "@/store/slices/userSlice"
import { clearUser } from "@/store/slices/userSlice"
import { useAppDispatch } from "@/store/store"
import { axiosInstance } from "@/services/axiosInstance"

export const useOAuthExchange = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (!code) return

    const exchange = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/exchange", {
          params: { code },
          withCredentials: true,
        })

        // Set token first
        dispatch(setAccessToken(data.accessToken))

        // Fetch user with token passed directly — bypasses interceptor timing
        await dispatch(fetchCurrentUser(data.accessToken))

        // Clean URL after everything is ready
        router.replace(window.location.pathname)
      } catch (err) {
        console.error("OAuth exchange error:", err)
        dispatch(clearUser())
        dispatch(markReady())
        router.replace("/login?error=auth_failed")
      }
    }

    exchange()
  }, [])
}
