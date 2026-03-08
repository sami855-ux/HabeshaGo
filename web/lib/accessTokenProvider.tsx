"use client"

import { ReactNode, useEffect } from "react"
import { useDispatch } from "react-redux"
import {
  setUser,
  setAccessToken,
  clearUser,
  setLoading,
} from "@/store/slices/userSlice"
import { axiosInstance } from "@/services/axiosInstance"

export default function SessionProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const restoreSession = async () => {
      dispatch(setLoading(true))

      try {
        // 1. Load cached user from localStorage
        const cachedUser = localStorage.getItem("habeshagoUser")
        if (cachedUser) {
          dispatch(setUser({ user: JSON.parse(cachedUser) }))
        }

        // 2. Refresh session from backend
        const res = await axiosInstance.post("/auth/refresh", {
          withCredentials: true,
        })

        const backendUser = res.data.user

        // 3. Compare with cached user
        if (!cachedUser || JSON.stringify(backendUser) !== cachedUser) {
          dispatch(setUser({ user: backendUser }))
          localStorage.setItem("habeshagoUser", JSON.stringify(backendUser))
        }

        dispatch(setAccessToken({ accessToken: res.data.accessToken }))
      } catch (error) {
        dispatch(clearUser())
        localStorage.removeItem("habeshagoUser")
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [dispatch])

  return children
}
