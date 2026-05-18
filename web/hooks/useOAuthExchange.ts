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

    if (!code) {
      // No OAuth redirect — still need to resolve auth via cookie
      dispatch(fetchCurrentUser())
      return
    }

    const exchange = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/exchange", {
          params: { code },
          withCredentials: true,
        })

        dispatch(setAccessToken(data.accessToken))

        // await this so isReady flips before anything else renders
        await dispatch(fetchCurrentUser())

        router.replace(window.location.pathname)
      } catch (err) {
        console.error("OAuth exchange error:", err)
        router.replace("/login?error=auth_failed")
      }
    }

    exchange()
  }, [])
}
