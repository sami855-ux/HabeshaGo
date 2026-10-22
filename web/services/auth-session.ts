import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios"
import type { User } from "@/types/user"

const AUTH_USER_KEY = "habeshagoUser"
const AUTH_REFRESH_KEY = "habeshagoRefreshToken"
const AUTH_SYNC_CHANNEL = "habeshago_auth_channel"

const getAuthBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "/api"
  }
  const raw =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8080/api"
  return raw.includes("onrender.com") ? "http://localhost:8080/api" : raw
}

/**
 * Shared authenticated axios client used across all application API services
 */
export const axiosInstance = axios.create({
  baseURL: getAuthBaseUrl(),
  withCredentials: true,
  timeout: 15000,
})

/**
 * Dedicated internal client for session-only operations (avoids circular interceptor triggers)
 */
const sessionClient = axios.create({
  baseURL: getAuthBaseUrl(),
  withCredentials: true,
  timeout: 15000,
})

interface SessionBridge {
  onSessionEstablished: (accessToken: string, user: User) => void
  onAccessTokenChanged: (accessToken: string) => void
  onSessionCleared: () => void
  onRestoreStarted: () => void
  onRestoreFinished: () => void
}

interface BackendRefreshResponse {
  success?: boolean
  message?: string
  accessToken?: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
  data?: {
    accessToken?: string
    refreshToken?: string
  }
}

interface CurrentUserResponse {
  success?: boolean
  user?: User
  message?: string
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _authRetry?: boolean
}

interface JwtPayload {
  exp?: number
  sub?: string
  roles?: string[]
}

// ─────────────────────────────────────────────────────────────
// In-Memory State & Single-Flight Mutex
// ─────────────────────────────────────────────────────────────
let bridge: SessionBridge | null = null
let currentAccessToken: string | null = null
let refreshPromise: Promise<string> | null = null
let silentRefreshTimer: ReturnType<typeof setTimeout> | null = null
let interceptorsConfigured = false
let syncChannel: BroadcastChannel | null = null

// Initialize Cross-Tab Sync via BroadcastChannel
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    syncChannel = new BroadcastChannel(AUTH_SYNC_CHANNEL)
    syncChannel.onmessage = (event) => {
      const data = event.data
      if (!data || typeof data !== "object") return

      switch (data.type) {
        case "TOKEN_REFRESHED":
          if (typeof data.accessToken === "string") {
            currentAccessToken = data.accessToken
            bridge?.onAccessTokenChanged(data.accessToken)
            scheduleSilentRefresh(data.accessToken)
          }
          break

        case "SESSION_ESTABLISHED":
          if (data.accessToken && data.user) {
            currentAccessToken = data.accessToken
            cacheUser(data.user)
            bridge?.onSessionEstablished(data.accessToken, data.user)
            scheduleSilentRefresh(data.accessToken)
          }
          break

        case "LOGOUT":
          clearLocalSession(false)
          break
      }
    }
  } catch {
    // BroadcastChannel unsupported or restricted in sandbox
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const requireBridge = () => {
  if (!bridge) throw new Error("Auth session manager is not configured")
  return bridge
}

export const getAccessToken = () => currentAccessToken

export const hasAccessToken = () => Boolean(currentAccessToken)

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_REFRESH_KEY)
}

const cacheRefreshToken = (token: string) => {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem(AUTH_REFRESH_KEY, token)
  }
}

const clearCachedRefreshToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_REFRESH_KEY)
  }
}

const cacheUser = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  }
}

const clearCachedUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_USER_KEY)
  }
}

const isUsableToken = (value: unknown): value is string =>
  typeof value === "string" && value.length >= 32

/**
 * Safely parse JWT exp claim for proactive scheduling
 */
const parseJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Proactively refresh token ~1 minute before expiration
 * Prevents user API calls from ever encountering a 401 delay
 */
const scheduleSilentRefresh = (token: string) => {
  if (silentRefreshTimer) {
    clearTimeout(silentRefreshTimer)
    silentRefreshTimer = null
  }

  if (typeof window === "undefined") return

  const payload = parseJwtPayload(token)
  if (!payload?.exp) return

  const expiresAtMs = payload.exp * 1000
  const nowMs = Date.now()
  const timeUntilExpiry = expiresAtMs - nowMs

  // Refresh 60 seconds before expiration, minimum 10 seconds from now
  const refreshDelay = Math.max(timeUntilExpiry - 60_000, 10_000)

  // Only schedule if expiry is within a reasonable window (less than 2 hours)
  if (timeUntilExpiry > 0 && timeUntilExpiry < 2 * 60 * 60 * 1000) {
    silentRefreshTimer = setTimeout(async () => {
      try {
        await refreshAccessToken()
      } catch {
        // Silent refresh failure is handled gracefully; reactive 401 interceptor serves as fallback
      }
    }, refreshDelay)
  }
}

const setCurrentAccessToken = (token: string) => {
  if (!isUsableToken(token)) throw new Error("Invalid access token response")
  currentAccessToken = token
  requireBridge().onAccessTokenChanged(token)
  scheduleSilentRefresh(token)
}

const clearLocalSession = (broadcast = true) => {
  currentAccessToken = null
  if (silentRefreshTimer) {
    clearTimeout(silentRefreshTimer)
    silentRefreshTimer = null
  }
  clearCachedRefreshToken()
  clearCachedUser()
  bridge?.onSessionCleared()

  if (broadcast && syncChannel) {
    try {
      syncChannel.postMessage({ type: "LOGOUT" })
    } catch {
      // Ignore
    }
  }
}

const fetchCurrentUser = async (token?: string): Promise<User> => {
  const tokenToUse = token || currentAccessToken
  if (!tokenToUse) throw new Error("Access token is unavailable")

  const { data } = await sessionClient.get<CurrentUserResponse>("/v1/auth/me", {
    headers: { Authorization: `Bearer ${tokenToUse}` },
  })

  if (!data?.success || !data.user) {
    throw new Error(data?.message || "No authenticated user was returned")
  }
  return data.user
}

/**
 * Route-aware redirect on session expiration
 * Protects users by redirecting them to the correct login portal with redirect query
 */
const redirectAfterExpiry = () => {
  if (typeof window === "undefined") return
  const pathname = window.location.pathname

  // Do not redirect public or auth onboarding pages
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/staff/login" ||
    pathname.startsWith("/staff/accept-invite")
  ) {
    return
  }

  const encodedPath = encodeURIComponent(pathname)

  // Staff / Admin routes redirect to staff login
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/ev-charge-manager") ||
    pathname.startsWith("/parking-manager")
  ) {
    window.location.replace(`/staff/login?reason=session_expired&redirect=${encodedPath}`)
    return
  }

  // Passenger / generic protected routes redirect to passenger login
  window.location.replace(`/login?reason=session_expired&redirect=${encodedPath}`)
}

const isNonRefreshableAuthRequest = (url = "") =>
  [
    "refresh",
    "logout",
    "exchange",
    "register",
    "continue-with-email",
    "verify-otp",
    "resend-otp",
    "staff/login",
    "staff/verify-otp",
    "staff-invites/accept",
    "mfa/verify",
    "mfa/enroll",
    "mfa/recovery",
  ].some((path) => url.includes(path))

// ─────────────────────────────────────────────────────────────
// Core Token Refresh Engine (Single-Flight Mutex)
// ─────────────────────────────────────────────────────────────

/**
 * Refresh access token using HttpOnly cookie or stored refresh token
 * Guarantees single-flight execution so concurrent calls share the exact same refresh promise
 */
export const refreshAccessToken = async (): Promise<string> => {
  // If a refresh is already in-flight, return the existing promise
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const storedRefreshToken = getStoredRefreshToken()

      // The backend accepts refreshToken in the body or from the HttpOnly cookie
      const { data } = await sessionClient.post<BackendRefreshResponse>(
        "/v1/auth/refresh",
        storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
      )

      const rawAccessToken = data?.accessToken || data?.data?.accessToken
      const rawRefreshToken = data?.refreshToken || data?.data?.refreshToken

      if (!isUsableToken(rawAccessToken)) {
        throw new Error("Refresh response did not include a valid access token")
      }

      // If backend rotated the refresh token and returned it, update stored token
      if (rawRefreshToken && typeof rawRefreshToken === "string") {
        cacheRefreshToken(rawRefreshToken)
      }

      setCurrentAccessToken(rawAccessToken)

      // Broadcast new token to other browser tabs
      if (syncChannel) {
        try {
          syncChannel.postMessage({
            type: "TOKEN_REFRESHED",
            accessToken: rawAccessToken,
          })
        } catch {
          // Ignore
        }
      }

      return rawAccessToken
    } catch (error) {
      clearLocalSession(true)
      throw error
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Establish a full authenticated session with tokens and user details
 */
export const establishAuthSession = async (
  token: string,
  suppliedUser?: User,
  refreshToken?: string,
): Promise<User> => {
  setCurrentAccessToken(token)

  if (refreshToken) {
    cacheRefreshToken(refreshToken)
  }

  try {
    const user = suppliedUser || (await fetchCurrentUser(token))
    cacheUser(user)
    requireBridge().onSessionEstablished(token, user)

    if (syncChannel) {
      try {
        syncChannel.postMessage({
          type: "SESSION_ESTABLISHED",
          accessToken: token,
          user,
        })
      } catch {
        // Ignore
      }
    }

    return user
  } catch (error) {
    clearLocalSession(true)
    throw error
  }
}

/**
 * Restore authenticated session on page load / boot
 */
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

/**
 * Cleanly terminate authenticated session and revoke tokens
 */
export const logoutAuthSession = async () => {
  try {
    const storedRefreshToken = getStoredRefreshToken()
    await sessionClient.post(
      "/v1/auth/logout",
      storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
      {
        headers: currentAccessToken
          ? { Authorization: `Bearer ${currentAccessToken}` }
          : undefined,
      },
    )
  } catch {
    // Proceed with client cleanup even if network request fails
  } finally {
    clearLocalSession(true)
  }
}

// ─────────────────────────────────────────────────────────────
// Interceptor Configuration
// ─────────────────────────────────────────────────────────────
export const configureAuthSession = (sessionBridge: SessionBridge) => {
  bridge = sessionBridge
  if (interceptorsConfigured) return
  interceptorsConfigured = true

  // Request interceptor: Attach current access token
  axiosInstance.interceptors.request.use((config) => {
    if (currentAccessToken) {
      const headers = AxiosHeaders.from(config.headers)
      headers.set("Authorization", `Bearer ${currentAccessToken}`)
      config.headers = headers
    }
    return config
  })

  // Response interceptor: Automatic 401 token refresh and queue retry
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
        // Await single-flight refresh token mutex
        const freshToken = await refreshAccessToken()

        // Update headers with fresh access token and replay original request
        const headers = AxiosHeaders.from(originalRequest.headers)
        headers.set("Authorization", `Bearer ${freshToken}`)
        originalRequest.headers = headers

        return axiosInstance(originalRequest)
      } catch (refreshErr) {
        redirectAfterExpiry()
        throw refreshErr
      }
    },
  )
}
