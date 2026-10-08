import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios"
import type { User } from "@/types/user"

// Keep requests same-origin. Next.js proxies /api to BACKEND_URL, allowing the
// HttpOnly refresh cookie to remain first-party and survive a full page reload.
const API_BASE_URL = "/api"

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Refresh requests deliberately use a client without the response interceptor.
const sessionClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

interface SessionBridge {
  onSessionEstablished: (accessToken: string, user: User) => void
  onAccessTokenChanged: (accessToken: string) => void
  onSessionCleared: () => void
  onRestoreStarted: () => void
  onRestoreFinished: () => void
}

interface RefreshResponse {
  accessToken?: unknown
}

interface CurrentUserResponse {
  success?: boolean
  user?: User
  message?: string
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean
}

let bridge: SessionBridge | null = null
let accessToken: string | null = null
let refreshPromise: Promise<string> | null = null
let interceptorsConfigured = false

const AUTH_CACHE_KEY = "habeshagoUser"

const requireBridge = () => {
  if (!bridge) throw new Error("Auth session manager is not configured")
  return bridge
}

const isUsableToken = (value: unknown): value is string =>
  typeof value === "string" && value.length >= 32

const cacheUser = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(user))
  }
}

const clearCachedUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_CACHE_KEY)
  }
}

const setCurrentAccessToken = (token: string) => {
  if (!isUsableToken(token)) throw new Error("Invalid access token response")
  accessToken = token
  requireBridge().onAccessTokenChanged(token)
}

const clearLocalSession = () => {
  accessToken = null
  clearCachedUser()
  bridge?.onSessionCleared()
}

const fetchCurrentUser = async (): Promise<User> => {
  if (!accessToken) throw new Error("Access token is unavailable")
  const { data } = await sessionClient.get<CurrentUserResponse>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!data?.success || !data.user) {
    throw new Error(data?.message || "No authenticated user was returned")
  }
  return data.user
}

const redirectAfterExpiry = () => {
  if (typeof window === "undefined") return

  const pathname = window.location.pathname
  const isStaffRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/ev-charge-manager") ||
    pathname.startsWith("/staff")
  const isPassengerRoute = pathname.startsWith("/user")

  if (isStaffRoute && pathname !== "/staff-login") {
    window.location.replace("/staff-login?reason=session_expired")
  } else if (isPassengerRoute && pathname !== "/login") {
    window.location.replace("/login?reason=session_expired")
  }
}

const isNonRefreshableAuthRequest = (url = "") =>
  [
    "/auth/refresh",
    "/auth/logout",
    "/auth/exchange",
    "/auth/register",
    "/auth/verify-otp",
    "/auth/staff/login",
    "/auth/staff/mfa/verify",
    "/auth/staff/mfa/resend",
    "/auth/staff/totp/setup-pending",
    "/auth/staff/totp/enable-pending",
  ].some((path) => url.includes(path))

export const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const { data } = await sessionClient.post<RefreshResponse>(
        "/auth/refresh",
        {},
      )
      if (!isUsableToken(data?.accessToken)) {
        throw new Error("Refresh response did not include a valid access token")
      }
      setCurrentAccessToken(data.accessToken)
      return data.accessToken
    } catch (error) {
      clearLocalSession()
      throw error
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export const establishAuthSession = async (
  token: string,
  suppliedUser?: User,
): Promise<User> => {
  setCurrentAccessToken(token)
  try {
    const user = suppliedUser || (await fetchCurrentUser())
    cacheUser(user)
    requireBridge().onSessionEstablished(token, user)
    return user
  } catch (error) {
    clearLocalSession()
    throw error
  }
}

export const restoreAuthSession = async (): Promise<User> => {
  const sessionBridge = requireBridge()
  sessionBridge.onRestoreStarted()
  try {
    const token = await refreshAccessToken()
    return await establishAuthSession(token)
  } finally {
    sessionBridge.onRestoreFinished()
  }
}

export const logoutAuthSession = async () => {
  try {
    await sessionClient.post(
      "/auth/logout",
      {},
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    )
  } finally {
    clearLocalSession()
  }
}

export const configureAuthSession = (sessionBridge: SessionBridge) => {
  bridge = sessionBridge
  if (interceptorsConfigured) return
  interceptorsConfigured = true

  axiosInstance.interceptors.request.use((config) => {
    if (accessToken) {
      const headers = AxiosHeaders.from(config.headers)
      headers.set("Authorization", `Bearer ${accessToken}`)
      config.headers = headers
    }
    return config
  })

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined
      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._authRetry ||
        isNonRefreshableAuthRequest(originalRequest.url)
      ) {
        throw error
      }

      originalRequest._authRetry = true
      try {
        const token = await refreshAccessToken()
        const headers = AxiosHeaders.from(originalRequest.headers)
        headers.set("Authorization", `Bearer ${token}`)
        originalRequest.headers = headers
        return axiosInstance(originalRequest)
      } catch {
        redirectAfterExpiry()
        throw error
      }
    },
  )
}

export const hasAccessToken = () => Boolean(accessToken)
