import { getRefreshToken } from "@/lib/refreshToken"
import { store } from "@/store"
import { clearUser, setAccessToken } from "@/store/slices/userSlice"
import axios from "axios"
import * as SecureStore from "expo-secure-store"

const API_URL = "https://habeshago-v1.onrender.com/api"

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

//  Attach access token (Redux)
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

// Refresh token handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/app/auth/refresh")
    ) {
      originalRequest._retry = true

      try {
        // Get refresh token from secure storage
        const refreshToken = await getRefreshToken()

        if (!refreshToken) {
          throw new Error("No refresh token found")
        }

        // 🔄 Request new access token
        const res = await axios.post(`${API_URL}/app/auth/refresh`, {
          refreshToken,
        })

        const newAccessToken = res.data.accessToken

        // ✅ Save access token in Redux
        store.dispatch(setAccessToken({ newAccessToken }))

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return axiosInstance(originalRequest)
      } catch (err) {
        // ❌ Refresh failed → logout completely
        await SecureStore.deleteItemAsync("refreshToken")
        store.dispatch(clearUser())
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)
