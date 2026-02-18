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
        const res = await axiosInstance.post("/auth/refresh", {
          withCredentials: true,
        })

        dispatch(setUser({ user: res.data.user }))
        dispatch(setAccessToken({ accessToken: res.data.accessToken }))
      } catch (error) {
        dispatch(clearUser())
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [dispatch])

  return children
}
