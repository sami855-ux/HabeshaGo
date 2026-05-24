"use client"
import { ReactNode, useEffect } from "react"
import {
  setUser,
  setAccessToken,
  clearUser,
  setLoading,
  markReady,
} from "@/store/slices/userSlice"
import { fetchCurrentUser } from "@/store/slices/userSlice"
import { axiosInstance } from "@/services/axiosInstance"
import { useAppDispatch } from "@/store/store"

export default function SessionProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const restoreSession = async () => {
      dispatch(setLoading(true))

      try {
        const params = new URLSearchParams(window.location.search)
        if (params.get("code")) {
          dispatch(setLoading(false))
          dispatch(markReady())
          return
        }

        const cachedUser = localStorage.getItem("habeshagoUser")

        if (cachedUser) {
          dispatch(setUser({ user: JSON.parse(cachedUser) }))
        }

        const res = await axiosInstance.post(
          "/auth/refresh",
          {},
          { withCredentials: true },
        )

        dispatch(setAccessToken(res.data.accessToken))

        const user = await dispatch(
          fetchCurrentUser(res.data.accessToken),
        ).unwrap()

        // IMPORTANT: persist again after refresh
        localStorage.setItem("habeshagoUser", JSON.stringify(user))

        // ✅ ADD THIS SMALL BUFFER (critical fix)
        await new Promise((resolve) => setTimeout(resolve, 0))

        dispatch(markReady())
      } catch (error) {
        dispatch(clearUser())
        localStorage.removeItem("habeshagoUser")
        dispatch(markReady())
      } finally {
        dispatch(setLoading(false))
      }
    }

    restoreSession()
  }, [dispatch])

  return children
}
