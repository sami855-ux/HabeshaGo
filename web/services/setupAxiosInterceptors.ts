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

      const isNonRefreshableAuthUrl =
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/logout") ||
        originalRequest.url?.includes("/auth/staff/login") ||
        originalRequest.url?.includes("/auth/staff/mfa/verify") ||
        originalRequest.url?.includes("/auth/register") ||
        originalRequest.url?.includes("/auth/verify-otp")

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isNonRefreshableAuthUrl
      ) {
        originalRequest._retry = true
        try {
          const res = await axiosInstance.post(
            "/auth/refresh",
            {},
            { withCredentials: true },
          )
          const newToken = res.data.accessToken

          store.dispatch(setAccessToken(newToken))

          originalRequest.headers.Authorization = `Bearer ${newToken}`

          return axiosInstance(originalRequest)
        } catch (err) {
          store.dispatch(clearUser())
          if (typeof window !== "undefined") {
            localStorage.removeItem("habeshagoUser")
            const pathname = window.location.pathname
            const isStaffRoute =
              pathname.startsWith("/admin") ||
              pathname.startsWith("/ev-charge-manager") ||
              pathname.startsWith("/staff")
            if (isStaffRoute) {
              if (pathname !== "/staff-login") {
                window.location.replace("/staff-login")
              }
            } else if (pathname.startsWith("/user")) {
              window.location.replace("/login")
            }
          }
        }
      }

      return Promise.reject(error)
    },
  )
}
