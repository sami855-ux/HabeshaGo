"use client"
import { ReactNode, useEffect } from "react"
import {
  setUser,
  setAccessToken,
  clearUser,
  setLoading,
} from "@/store/slices/userSlice"
import { axiosInstance } from "@/services/axiosInstance"
import { fetchCurrentUser } from "@/store/slices/userSlice"
import { useAppDispatch } from "@/store/store"

export default function SessionProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const restoreSession = async () => {
      dispatch(setLoading(true))
      try {
        // 1. Load cached user for instant UI
        const cachedUser = localStorage.getItem("habeshagoUser")
        if (cachedUser) {
          dispatch(setUser({ user: JSON.parse(cachedUser) }))
        }

        // 2. Get fresh access token via refresh cookie
        const res = await axiosInstance.post(
          "/auth/refresh",
          {},
          {
            withCredentials: true,
          },
        )

        // 3. Store access token in Redux FIRST
        dispatch(setAccessToken(res.data.accessToken))

        // 4. NOW fetch full user profile (interceptor will attach the token)
        await dispatch(fetchCurrentUser(res.data.accessToken))
      } catch (error) {
        // Refresh failed — no valid session
        dispatch(clearUser())
        localStorage.removeItem("habeshagoUser")
        dispatch(setLoading(false))
      }
    }

    restoreSession()
  }, [dispatch])

  return children
}
