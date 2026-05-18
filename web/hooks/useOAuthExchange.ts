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

    if (!code) return

    const exchange = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/exchange", {
          params: { code },
          withCredentials: true,
        })

        // Store access token in Redux (memory only)
        dispatch(setAccessToken(data.accessToken))

        // Fetch full user profile now that we're authenticated
        dispatch(fetchCurrentUser())

        // Clean the code from the URL
        router.replace(window.location.pathname)
      } catch (err) {
        console.error("OAuth exchange error:", err)
        router.replace("/login?error=auth_failed")
      }
    }

    exchange()
  }, [])
}
