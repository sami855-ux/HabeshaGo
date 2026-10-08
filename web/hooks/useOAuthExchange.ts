"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/services/axiosInstance"
import {
  establishAuthSession,
  logoutAuthSession,
} from "@/services/authSession"

export const useOAuthExchange = () => {
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

        await establishAuthSession(data.accessToken)

        // Clean URL after everything is ready
        router.replace(window.location.pathname)
      } catch {
        await logoutAuthSession().catch(() => undefined)
        router.replace("/login?error=auth_failed")
      }
    }

    exchange()
  }, [router])
}
