"use client"
import { ReactNode, useEffect } from "react"
import { useDispatch } from "react-redux"
import {
  setUser,
  setAccessToken,
  clearUser,
  setLoading,
} from "@/store/slices/userSlice"
import { fetchCurrentUser } from "@/store/slices/userSlice"
import { axiosInstance } from "@/services/axiosInstance"
import { useAppDispatch } from "@/store/store"

export default function SessionProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const restoreSession = async () => {
      dispatch(setLoading(true))

      // ✅ If this is an OAuth redirect (?code=), skip restore
      // useOAuthExchange will handle it
      const params = new URLSearchParams(window.location.search)
      if (params.get("code")) {
        dispatch(setLoading(false))
        return
      }

      try {
        // Load cached user for instant UI
        const cachedUser = localStorage.getItem("habeshagoUser")
        if (cachedUser) {
          dispatch(setUser({ user: JSON.parse(cachedUser) }))
        }

        // Get fresh access token via refresh cookie
        const res = await axiosInstance.post(
          "/auth/refresh",
          {},
          {
            withCredentials: true,
          },
        )

        // Set token first
        dispatch(setAccessToken(res.data.accessToken))

        // Then fetch full user with token passed directly
        await dispatch(fetchCurrentUser(res.data.accessToken))
      } catch (error: any) {
        // ✅ clearUser now sets isReady=true so useRequireRole unblocks
        dispatch(clearUser())
        localStorage.removeItem("habeshagoUser")
      }
    }

    restoreSession()
  }, [dispatch])

  return children
}
