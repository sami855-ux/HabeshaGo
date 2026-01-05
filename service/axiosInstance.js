import { store } from "@/store"
import axios from "axios"

export const axiosInstance = axios.create({
  baseURL: "https://addis-pulse-2.onrender.com/api",
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

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url.includes("/app/auth/refresh")
//     ) {
//       originalRequest._retry = true

//       try {
//         const res = await axiosInstance.post(
//           "/app/auth/refresh",
//           {},
//           { withCredentials: true }
//         )

//         // ✅ SAVE NEW ACCESS TOKEN
//         store.dispatch(setAccessToken({ accessToken: res.data.accessToken }))

//         // Retry original request with new token
//         originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`

//         return axiosInstance(originalRequest)
//       } catch (err) {
//         store.dispatch(clearUser())
//         return Promise.reject(err)
//       }
//     }

//     return Promise.reject(error)
//   }
// )
