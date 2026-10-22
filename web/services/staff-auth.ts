import axios from "axios"
import { axiosInstance } from "./auth-session"
import type { UserRole } from "@/types/user"

// Base URL resolution: In browser, use same-origin /api (rewritten by Next.js to API gateway)
// This guarantees first-party HttpOnly cookies and eliminates cross-origin cookie omission.
const getStaffAuthBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "/api"
  }
  const raw =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:8080/api"
  return raw.includes("onrender.com") ? "http://localhost:8080/api" : raw
}

const authClient = axios.create({
  baseURL: getStaffAuthBaseUrl(),
  withCredentials: true,
  timeout: 15000,
})

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ error?: { message?: string; code?: string }; message?: string }>(err)) {
    return (
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      fallback
    )
  }
  return err instanceof Error ? err.message : fallback
}

export interface StaffLoginRequest {
  email: string
}

export interface StaffLoginResponse {
  success: boolean
  message: string
  email: string
  expiresIn: number
  devOtp?: string
  data?: {
    email: string
    expiresIn: number
  }
}

export interface StaffVerifyOtpRequest {
  email: string
  code: string
}

export interface StaffVerifyOtpResponse {
  success: boolean
  mfaRequired: boolean
  mfaSetupRequired: boolean
  mfaToken: string
  mfaMethod?: "TOTP" | "SETUP_TOTP"
  secret?: string
  otpauthUri?: string
  recoveryCodes?: string[]
  expiresIn?: number
  message: string
}

export interface StaffMfaVerifyRequest {
  mfaToken: string
  code: string
}

export interface StaffMfaEnrollVerifyRequest {
  mfaToken: string
  code: string
}

export interface StaffMfaRecoveryRequest {
  mfaToken: string
  recoveryCode: string
}

export interface StaffAuthSessionResponse {
  accessToken: string
  refreshToken?: string
  user: {
    id: string
    name: string | null
    email: string
    phone?: string | null
    primaryRole: UserRole
    defaultRedirect?: string
    roles?: string[]
    status?: string
    [key: string]: unknown
  }
  recoveryCodes?: string[]
  recoveryCodeUsed?: boolean
  remainingRecoveryCodes?: number
  message?: string
}

export interface StaffInviteAcceptResponse {
  success: boolean
  message: string
  data?: {
    email: string
    role: UserRole | string
    requiresMfaSetup: boolean
    nextStep?: string
  }
}

export interface StaffApiError {
  code: string
  message: string
  statusCode: number
}

// Single official demo account for evaluation
export const DEMO_STAFF_ACCOUNT = {
  email: "admin@habeshago.et",
  name: "Abebe Kebede",
  role: "ADMIN" as UserRole,
  roleTitle: "Systems Administrator",
  hasExistingMfa: true,
}

export const DEMO_STAFF_ACCOUNTS = [DEMO_STAFF_ACCOUNT]

/**
 * Step 1: Request staff login OTP
 * POST /api/v1/auth/staff/login
 */
export async function requestStaffLogin(email: string): Promise<StaffLoginResponse> {
  const normalizedEmail = email.trim().toLowerCase()

  try {
    const res = await authClient.post<StaffLoginResponse>("/v1/auth/staff/login", {
      email: normalizedEmail,
    })
    return res.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      const errorData = err.response.data.error
      const customErr = new Error(errorData.message || "Staff authorization failed") as Error & {
        code?: string
      }
      customErr.code = errorData.code
      throw customErr
    }
    throw new Error(getErrorMessage(err, "Staff authorization failed"))
  }
}

/**
 * Step 2: Verify staff OTP
 * POST /api/v1/auth/staff/verify-otp
 */
export async function verifyStaffOtp(
  email: string,
  code: string
): Promise<StaffVerifyOtpResponse> {
  const normalizedEmail = email.trim().toLowerCase()
  const cleanCode = code.trim()

  try {
    const res = await authClient.post<StaffVerifyOtpResponse>(
      "/v1/auth/staff/verify-otp",
      {
        email: normalizedEmail,
        code: cleanCode,
      }
    )

    const raw = res.data as any
    const dataObj = raw.data || {}

    return {
      success: raw.success ?? true,
      mfaRequired: raw.mfaRequired ?? dataObj.mfaRequired ?? true,
      mfaSetupRequired: raw.mfaSetupRequired ?? dataObj.mfaSetupRequired ?? false,
      mfaToken: raw.mfaToken || dataObj.mfaToken || "",
      mfaMethod: raw.mfaMethod || dataObj.mfaMethod || "TOTP",
      secret: raw.secret || dataObj.secret,
      otpauthUri: raw.otpauthUri || dataObj.otpauthUri,
      recoveryCodes: raw.recoveryCodes || dataObj.recoveryCodes,
      expiresIn: raw.expiresIn || dataObj.expiresIn || 300,
      message: raw.message || "Email OTP verified",
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      const errorData = err.response.data.error
      const customErr = new Error(errorData.message || "OTP verification failed") as Error & {
        code?: string
      }
      customErr.code = errorData.code
      throw customErr
    }
    throw new Error(getErrorMessage(err, "OTP verification failed"))
  }
}

/**
 * Step 3A: Confirm first-time TOTP setup
 * POST /api/v1/auth/mfa/enroll/verify
 */
export async function verifyStaffMfaEnroll(
  mfaToken: string,
  code: string
): Promise<StaffAuthSessionResponse> {
  try {
    const res = await authClient.post<{
      success: boolean
      accessToken?: string
      refreshToken?: string
      user?: any
      recoveryCodes?: string[]
      message?: string
      data?: any
      error?: { code?: string; message?: string }
    }>("/v1/auth/mfa/enroll/verify", {
      mfaToken,
      code: code.trim(),
    })

    const raw = res.data
    const rawUser = raw.user || raw.data?.user || {}

    return {
      accessToken: raw.accessToken || raw.data?.accessToken || "",
      refreshToken: raw.refreshToken || raw.data?.refreshToken,
      recoveryCodes: raw.recoveryCodes || raw.data?.recoveryCodes,
      user: {
        id: rawUser.id,
        name: rawUser.name || (rawUser.email ? rawUser.email.split("@")[0] : "Staff Member"),
        email: rawUser.email,
        phone: rawUser.phone,
        primaryRole: rawUser.primaryRole || rawUser.role || "ADMIN",
        defaultRedirect: rawUser.defaultRedirect || "/admin",
        roles: rawUser.roles || [rawUser.primaryRole || "ADMIN"],
        status: rawUser.status || "ACTIVE",
      },
      message: raw.message || "MFA enrollment confirmed successfully.",
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      const errorData = err.response.data.error
      const customErr = new Error(errorData.message || "TOTP setup verification failed") as Error & {
        code?: string
      }
      customErr.code = errorData.code
      throw customErr
    }
    throw new Error(getErrorMessage(err, "TOTP setup verification failed"))
  }
}

/**
 * Step 3B: Verify existing MFA TOTP code
 * POST /api/v1/auth/mfa/verify
 */
export async function verifyStaffMfaChallenge(
  mfaToken: string,
  code: string
): Promise<StaffAuthSessionResponse> {
  try {
    const res = await authClient.post<{
      success: boolean
      accessToken?: string
      refreshToken?: string
      user?: any
      message?: string
      data?: any
      error?: { code?: string; message?: string }
    }>("/v1/auth/mfa/verify", {
      mfaToken,
      code: code.trim(),
    })

    const raw = res.data
    const rawUser = raw.user || raw.data?.user || {}

    return {
      accessToken: raw.accessToken || raw.data?.accessToken || "",
      refreshToken: raw.refreshToken || raw.data?.refreshToken,
      user: {
        id: rawUser.id,
        name: rawUser.name || (rawUser.email ? rawUser.email.split("@")[0] : "Staff Member"),
        email: rawUser.email,
        phone: rawUser.phone,
        primaryRole: rawUser.primaryRole || rawUser.role || "ADMIN",
        defaultRedirect: rawUser.defaultRedirect || "/admin",
        roles: rawUser.roles || [rawUser.primaryRole || "ADMIN"],
        status: rawUser.status || "ACTIVE",
      },
      message: raw.message || "Staff authentication successful.",
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      const errorData = err.response.data.error
      const customErr = new Error(errorData.message || "Authenticator verification failed") as Error & {
        code?: string
      }
      customErr.code = errorData.code
      throw customErr
    }
    throw new Error(getErrorMessage(err, "Authenticator verification failed"))
  }
}

/**
 * Step 3C: Emergency Recovery Code fallback
 * POST /api/v1/auth/mfa/recovery
 */
export async function verifyStaffMfaRecovery(
  mfaToken: string,
  recoveryCode: string
): Promise<StaffAuthSessionResponse> {
  try {
    const res = await authClient.post<{
      success: boolean
      accessToken?: string
      refreshToken?: string
      user?: any
      recoveryCodeUsed?: boolean
      remainingRecoveryCodes?: number
      message?: string
      data?: any
      error?: { code?: string; message?: string }
    }>("/v1/auth/mfa/recovery", {
      mfaToken,
      recoveryCode: recoveryCode.trim(),
    })

    const raw = res.data
    const rawUser = raw.user || raw.data?.user || {}

    return {
      accessToken: raw.accessToken || raw.data?.accessToken || "",
      refreshToken: raw.refreshToken || raw.data?.refreshToken,
      recoveryCodeUsed: raw.recoveryCodeUsed ?? true,
      remainingRecoveryCodes: raw.remainingRecoveryCodes,
      user: {
        id: rawUser.id,
        name: rawUser.name || (rawUser.email ? rawUser.email.split("@")[0] : "Staff Member"),
        email: rawUser.email,
        phone: rawUser.phone,
        primaryRole: rawUser.primaryRole || rawUser.role || "ADMIN",
        defaultRedirect: rawUser.defaultRedirect || "/admin",
        roles: rawUser.roles || [rawUser.primaryRole || "ADMIN"],
        status: rawUser.status || "ACTIVE",
      },
      message: raw.message || "Emergency recovery code verified. Session established.",
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      const errorData = err.response.data.error
      const customErr = new Error(errorData.message || "Recovery code invalid") as Error & {
        code?: string
      }
      customErr.code = errorData.code
      throw customErr
    }
    throw new Error(getErrorMessage(err, "Recovery code invalid"))
  }
}

/**
 * Accept staff invitation token
 * POST /api/v1/auth/staff-invites/accept
 */
export async function acceptStaffInvite(
  token: string
): Promise<StaffInviteAcceptResponse> {
  const cleanToken = token.trim()
  if (!cleanToken) {
    throw new Error("Invitation token is required")
  }

  try {
    const res = await authClient.post<StaffInviteAcceptResponse>(
      "/v1/auth/staff-invites/accept",
      { token: cleanToken }
    )
    return res.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      const errObj = err.response.data.error
      const customErr = new Error(errObj.message || "Invitation acceptance failed") as Error & {
        code?: string
      }
      customErr.code = errObj.code
      throw customErr
    }
    throw new Error(getErrorMessage(err, "Invitation acceptance failed"))
  }
}

// ─────────────────────────────────────────────────────────────
// Admin Staff Invite Management (Requires Admin Session)
// ─────────────────────────────────────────────────────────────

export interface CreateStaffInvitePayload {
  email: string
  role: string
}

export interface StaffInviteItem {
  id: string
  email: string
  role: string
  status: "pending" | "accepted" | "expired" | string
  expiresAt: string
  acceptedAt?: string | null
  createdAt: string
  inviteUrl?: string
  token?: string
}

export interface CreateStaffInviteResponse {
  success: boolean
  message: string
  invite: StaffInviteItem
}

/**
 * Admin: Issue a new staff invite
 * POST /api/v1/admin/staff-invites
 */
export async function createStaffInviteApi(
  payload: CreateStaffInvitePayload
): Promise<CreateStaffInviteResponse> {
  try {
    const res = await axiosInstance.post<CreateStaffInviteResponse>(
      "/v1/admin/staff-invites",
      payload
    )
    return res.data
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Failed to create staff invite"))
  }
}

/**
 * Admin: List staff invites
 * GET /api/v1/admin/staff-invites
 */
export async function listStaffInvitesApi(params?: {
  status?: string
  role?: string
  cursor?: string
  limit?: number
}): Promise<{ success: boolean; data: StaffInviteItem[] }> {
  try {
    const res = await axiosInstance.get<{ success: boolean; data: StaffInviteItem[] }>(
      "/v1/admin/staff-invites",
      { params }
    )
    return res.data
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Failed to list staff invites"))
  }
}

/**
 * Admin: Cancel a staff invite
 * DELETE /api/v1/admin/staff-invites/:inviteId
 */
export async function cancelStaffInviteApi(
  inviteId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await axiosInstance.delete<{ success: boolean; message: string }>(
      `/v1/admin/staff-invites/${inviteId}`
    )
    return res.data
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, "Failed to cancel staff invite"))
  }
}
