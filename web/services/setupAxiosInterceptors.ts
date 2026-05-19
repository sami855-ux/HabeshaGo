import { axiosInstance } from "./axiosInstance"
import { setAccessToken, clearUser } from "@/store/slices/userSlice"
import type { AppStore } from "@/store/store"

export const setupAxiosInterceptors = (store: AppStore) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = store.getState().user.accessToken
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

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
          const res = await axiosInstance.post(
            "/auth/refresh",
            {},
            {
              withCredentials: true, // ✅ send refresh token cookie
            },
          )
          const newToken = res.data.accessToken
          store.dispatch(setAccessToken(newToken))
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axiosInstance(originalRequest)
        } catch {
          store.dispatch(clearUser())
          // ✅ reset isReady so useRequireRole can redirect cleanly
          window.location.replace("/login?error=axios")
        }
      }

      return Promise.reject(error)
    },
  )
}
