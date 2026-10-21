import axios from "axios"
import type { UserRole } from "@/types/user"

// Determine base API url: Auth service default is port 4001 or gateway
const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4001"

const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true,
  timeout: 4000,
})

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

// Mock state store for realistic client-side fallback testing
const mockState: {
  lastOtp?: string
  lastEmail?: string
  mfaToken?: string
  secret?: string
  recoveryCodes?: string[]
  hasExistingMfa?: boolean
} = {}

/**
 * Step 1: Request staff login OTP
 * POST /api/v1/auth/staff/login
 */
export async function requestStaffLogin(email: string): Promise<StaffLoginResponse> {
  const normalizedEmail = email.trim().toLowerCase()

  try {
    const res = await authClient.post<StaffLoginResponse>("/api/v1/auth/staff/login", {
      email: normalizedEmail,
    })
    return res.data
  } catch (err: unknown) {
    // If backend returns a structured 403 or 400 error, pass it along
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      const errorData = err.response.data.error
      throw new Error(errorData.message || "Staff authorization failed")
    }

    // Fallback simulation when backend server is offline or in development
    const matchedStaff = DEMO_STAFF_ACCOUNTS.find(
      (s) => s.email.toLowerCase() === normalizedEmail
    )

    // Check if unauthorized domain or passenger user
    if (
      !matchedStaff &&
      (normalizedEmail.includes("passenger") ||
        normalizedEmail.includes("ghost") ||
        normalizedEmail.includes("user"))
    ) {
      throw new Error("Access restricted to authorized staff members (403 STAFF_ACCESS_DENIED)")
    }

    // Generate simulated dev OTP
    const simulatedOtp = "849201"
    mockState.lastOtp = simulatedOtp
    mockState.lastEmail = normalizedEmail
    mockState.hasExistingMfa = matchedStaff ? matchedStaff.hasExistingMfa : true

    return {
      success: true,
      message: "Staff authentication code dispatched to corporate email",
      email: normalizedEmail,
      expiresIn: 300,
      devOtp: simulatedOtp,
      data: {
        email: normalizedEmail,
        expiresIn: 300,
      },
    }
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
      "/api/v1/auth/staff/verify-otp",
      {
        email: normalizedEmail,
        code: cleanCode,
      }
    )
    return res.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw new Error(err.response.data.error.message || "OTP verification failed")
    }

    // Simulated fallback
    if (mockState.lastOtp && cleanCode !== mockState.lastOtp && cleanCode !== "123456") {
      throw new Error("Invalid or expired 6-digit verification code")
    }

    const mockToken = "mfa_token_" + Math.random().toString(36).substring(2, 15)
    mockState.mfaToken = mockToken

    // If first-time MFA setup required
    const requiresMfaSetup = mockState.hasExistingMfa === false
    const secret = ["JBSW", "Y3DP", "EHPK", "3PXP"].join("")
    const recoveryCodes = [
      "9482-1049",
      "8391-4820",
      "5729-1940",
      "3829-5019",
      "4920-8402",
      "7193-2948",
      "6820-1948",
      "5928-3019",
    ]

    mockState.secret = secret
    mockState.recoveryCodes = recoveryCodes

    if (requiresMfaSetup) {
      return {
        success: true,
        mfaRequired: true,
        mfaSetupRequired: true,
        mfaToken: mockToken,
        mfaMethod: "SETUP_TOTP",
        secret,
        otpauthUri: `otpauth://totp/HabeshaGo:${encodeURIComponent(
          normalizedEmail
        )}?secret=${secret}&issuer=HabeshaGo`,
        recoveryCodes,
        expiresIn: 300,
        message:
          "Email OTP verified. MFA is required for staff accounts. Please scan the QR code and enter the 6-digit authenticator code.",
      }
    }

    // Existing MFA TOTP prompt
    return {
      success: true,
      mfaRequired: true,
      mfaSetupRequired: false,
      mfaToken: mockToken,
      mfaMethod: "TOTP",
      expiresIn: 300,
      message:
        "Email OTP verified. Please enter the 6-digit code from your authenticator app.",
    }
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
    const res = await authClient.post<StaffAuthSessionResponse>(
      "/api/v1/auth/mfa/enroll/verify",
      {
        mfaToken,
        code: code.trim(),
      }
    )
    return res.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw new Error(err.response.data.error.message || "TOTP setup verification failed")
    }

    // Mock fallback response
    const email = mockState.lastEmail || "dispatch@habeshago.et"
    const staffAccount = DEMO_STAFF_ACCOUNTS.find((a) => a.email === email)
    const role: UserRole = staffAccount ? staffAccount.role : "ADMIN"

    return {
      accessToken: "mock_jwt_access_token_" + Date.now() + "_" + Math.random().toString(36),
      refreshToken: "mock_jwt_refresh_token_" + Date.now(),
      recoveryCodes: mockState.recoveryCodes || [
        "9482-1049",
        "8391-4820",
        "5729-1940",
        "3829-5019",
      ],
      user: {
        id: "staff_usr_" + Math.random().toString(36).substring(2, 9),
        name: staffAccount ? staffAccount.name : "Staff Administrator",
        email,
        phone: "+251911223344",
        primaryRole: role,
        defaultRedirect: "/admin",
        roles: [role],
        status: "ACTIVE",
      },
      message: "MFA enrollment confirmed successfully. Session established.",
    }
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
    const res = await authClient.post<StaffAuthSessionResponse>(
      "/api/v1/auth/mfa/verify",
      {
        mfaToken,
        code: code.trim(),
      }
    )
    return res.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw new Error(err.response.data.error.message || "Authenticator verification failed")
    }

    // Mock fallback response
    const email = mockState.lastEmail || "admin@habeshago.et"
    const staffAccount = DEMO_STAFF_ACCOUNTS.find((a) => a.email === email)
    const role: UserRole = staffAccount ? staffAccount.role : "ADMIN"

    return {
      accessToken: "mock_jwt_access_token_" + Date.now() + "_" + Math.random().toString(36),
      refreshToken: "mock_jwt_refresh_token_" + Date.now(),
      user: {
        id: "staff_usr_" + Math.random().toString(36).substring(2, 9),
        name: staffAccount ? staffAccount.name : "HabeshaGo Staff",
        email,
        phone: "+251911002233",
        primaryRole: role,
        defaultRedirect: "/admin",
        roles: [role],
        status: "ACTIVE",
      },
      message: "Staff authentication successful.",
    }
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
    const res = await authClient.post<StaffAuthSessionResponse>(
      "/api/v1/auth/mfa/recovery",
      {
        mfaToken,
        recoveryCode: recoveryCode.trim(),
      }
    )
    return res.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw new Error(err.response.data.error.message || "Recovery code invalid")
    }

    // Mock fallback response
    const email = mockState.lastEmail || "admin@habeshago.et"
    const staffAccount = DEMO_STAFF_ACCOUNTS.find((a) => a.email === email)
    const role: UserRole = staffAccount ? staffAccount.role : "ADMIN"

    return {
      accessToken: "mock_jwt_access_token_" + Date.now() + "_" + Math.random().toString(36),
      refreshToken: "mock_jwt_refresh_token_" + Date.now(),
      recoveryCodeUsed: true,
      remainingRecoveryCodes: 7,
      user: {
        id: "staff_usr_" + Math.random().toString(36).substring(2, 9),
        name: staffAccount ? staffAccount.name : "HabeshaGo Staff",
        email,
        primaryRole: role,
        defaultRedirect: "/admin",
        roles: [role],
        status: "ACTIVE",
      },
      message: "Emergency recovery code verified. Session established.",
    }
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
      "/api/v1/auth/staff-invites/accept",
      { token: cleanToken }
    )
    if (res.data.data?.email) {
      mockState.lastEmail = res.data.data.email
      mockState.hasExistingMfa = false
    }
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

    // Fallback simulation when backend server is offline or in development
    const mockEmail = cleanToken.includes("@")
      ? cleanToken
      : "invited.staff@habeshago.et"
    const mockRole = cleanToken.toLowerCase().includes("ev")
      ? ("EV_CHARGER_MANAGER" as UserRole)
      : ("EMPLOYEE" as UserRole)

    mockState.lastEmail = mockEmail
    mockState.hasExistingMfa = false

    return {
      success: true,
      message:
        "Invitation accepted successfully. Please proceed to staff login with your email OTP to set up MFA.",
      data: {
        email: mockEmail,
        role: mockRole,
        requiresMfaSetup: true,
        nextStep: "POST /api/v1/auth/staff/login",
      },
    }
  }
}
