import { axiosInstance } from "./axiosInstance"
import { setAccessToken, clearUser } from "@/store/slices/userSlice"
import type { AppStore } from "@/store/store"

export const setupAxiosInterceptors = (store: AppStore) => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = store.getState().user.accessToken
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/auth/refresh")
      ) {
        originalRequest._retry = true

        try {
          const res = await axiosInstance.post("/auth/refresh")

          store.dispatch(setAccessToken(res.data.accessToken))

          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`

          return axiosInstance(originalRequest)
        } catch {
          store.dispatch(clearUser())
        }
      }

      return Promise.reject(error)
    }
  )
}
