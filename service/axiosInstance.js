import { logout, setAccessToken } from "@/store/slices/userSlice"
import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { store } from "../store"

// Create Axios instance
export const axiosInstance = axios.create({
  baseURL: "https://addis-pulse-3.onrender.com/api",
})

// Attach access token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    const state = store.getState()
    const token = state.user.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Prevent infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken")

        if (!refreshToken) {
          store.dispatch(logout())
          return Promise.reject(error)
        }

        const res = await axios.post(
          "https://addis-pulse-3.onrender.com/api/auth/refresh",
          { refreshToken }
        )

        const newAccessToken = res.data.accessToken

        // Save new access token
        store.dispatch(setAccessToken(newAccessToken))

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        await SecureStore.deleteItemAsync("refreshToken")
        store.dispatch(logout())
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
