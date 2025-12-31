import axios from "axios"
import { setAccessToken, clearUser } from "@/store/slices/userSlice"
import { store } from "@/store"

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
})

// Attach access token from Redux to every request
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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true

      try {
        const res = await axiosInstance.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        )

        // ✅ SAVE NEW ACCESS TOKEN
        store.dispatch(setAccessToken({ accessToken: res.data.accessToken }))

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`

        return axiosInstance(originalRequest)
      } catch (err) {
        store.dispatch(clearUser())
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)
