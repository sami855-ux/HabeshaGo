import { getRefreshToken } from "@/lib/refreshToken"
import { store } from "@/store"
import { clearUser, setAccessToken } from "@/store/slices/userSlice"
import axios from "axios"
import * as SecureStore from "expo-secure-store"

export const axiosInstance = axios.create({
  baseURL: "https://habeshago-pro-v1.onrender.com/api",
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
  (error) => Promise.reject(error),
)

// List of endpoints that don't require authentication
const publicEndpoints = [
  "/auth/app/register/phone/verify",
  "/auth/login",
  "/auth/register",
  "/auth/send-otp",
  "/auth/refresh",
]

// Check if endpoint is public (no auth needed)
const isPublicEndpoint = (url) => {
  if (!url) return false
  return publicEndpoints.some((endpoint) => url.includes(endpoint))
}

// Refresh token handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Log the error for debugging
    console.log("🔴 API Error:", {
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method,
    }, error.response)

    // Skip refresh for:
    // 1. Non-401 errors
    // 2. Already retried requests
    // 3. Public endpoints that don't need auth
    // 4. Refresh token endpoint itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isPublicEndpoint(originalRequest.url) ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      console.log("⏭️ Skipping token refresh:", {
        is401: error.response?.status === 401,
        isRetry: originalRequest._retry,
        isPublic: isPublicEndpoint(originalRequest.url),
        isRefresh: originalRequest.url?.includes("/auth/refresh"),
      })
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      console.log("🔄 Attempting to refresh token...")

      // Get refresh token from secure storage
      const refreshToken = await getRefreshToken()
      console.log("📱 Refresh token found:", !!refreshToken)

      if (!refreshToken) {
        console.log("❌ No refresh token found - logging out")
        await SecureStore.deleteItemAsync("refreshToken")
        store.dispatch(clearUser())
        return Promise.reject(new Error("No refresh token found"))
      }

      // 🔄 Request new access token
      console.log("📡 Calling refresh endpoint...")
      const res = await axios.post(
        `https://habeshago-pro-v1.onrender.com/api/app/auth/refresh`,
        {
          refreshToken,
        },
      )

      console.log("✅ Refresh response:", {
        status: res.status,
        hasAccessToken: !!res.data?.accessToken,
      })

      const newAccessToken = res.data.accessToken || res.data.data?.accessToken

      if (!newAccessToken) {
        throw new Error("No access token in refresh response")
      }

      // ✅ Save access token in Redux
      store.dispatch(setAccessToken(newAccessToken))
      console.log("✅ New access token saved to Redux")

      // Update the original request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      // Retry original request
      return axiosInstance(originalRequest)
    } catch (err) {
      console.error("❌ Refresh token failed:", err)
      // ❌ Refresh failed → logout completely
      await SecureStore.deleteItemAsync("refreshToken")
      store.dispatch(clearUser())
      return Promise.reject(err)
    }
  },
)
