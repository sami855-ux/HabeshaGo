import axios from "axios"
import * as SecureStore from "expo-secure-store"

export const BASE_URL = "https://addis-pulse-2.onrender.com"

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// ✅ Attach token automatically on every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("auth_token")

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log("🔐 Token attached to request")
      } else {
        console.log("⚠️ No token found in SecureStore")
      }
    } catch (err) {
      console.log("❌ SecureStore read failed:", err)
    }

    return config
  },
  (error) => Promise.reject(error)
)

export default api
