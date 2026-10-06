import { axiosInstance } from "./axiosInstance"

export interface StaffLoginPayload {
  email: string
  password: string
}

export interface StaffSetupData {
  qrCode: string
  secret: string
  otpauth_url: string
  recoveryPhrases: string[]
  instructions: string[]
}

export interface StaffLoginResponse {
  success: boolean
  message?: string
  data?: {
    mfaRequired: boolean
    mfaToken: string
    hasTotp?: boolean
    mfaMethod: "TOTP" | "SETUP_TOTP" | "TOTP_OR_EMAIL" | "EMAIL_OTP" | string
    expiresIn: number
    user: {
      id: string
      name: string | null
      email: string
      role: "DRIVER" | "ADMIN" | "EV_CHARGER_MANAGER" | "PARKING_MANAGER" | string
    }
    setupData?: StaffSetupData
    devOtp?: string
  }
}

export interface StaffVerifyMFAPayload {
  mfaToken: string
  code: string
}

export interface StaffAuthUser {
  id: string
  name: string | null
  email: string
  role: string
  avaterUrl?: string | null
  phone?: string | null
}

export interface StaffVerifyMFAResponse {
  success: boolean
  message?: string
  data?: {
    accessToken: string
    refreshToken: string
    user: StaffAuthUser
  }
}

export interface StaffTOTPSetupResponse {
  success: boolean
  message?: string
  data?: {
    qrCode: string
    secret: string
    otpauth_url: string
    recoveryPhrases: string[]
    instructions: string[]
  }
}

export interface StaffTOTPEnableResponse {
  success: boolean
  message?: string
  data?: {
    enabled: boolean
    notice: string
  }
}

/**
 * Step 1: Staff login with email and password
 */
export const staffLoginApi = async (
  payload: StaffLoginPayload,
): Promise<StaffLoginResponse> => {
  try {
    const res = await axiosInstance.post("/auth/staff/login", payload)
    return res.data
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Staff authentication failed"
    return {
      success: false,
      message,
    }
  }
}

/**
 * Step 2: Complete MFA verification with Authenticator Code, Recovery Phrase, or Email OTP
 */
export const staffVerifyMFAApi = async (
  payload: StaffVerifyMFAPayload,
): Promise<StaffVerifyMFAResponse> => {
  try {
    const res = await axiosInstance.post("/auth/staff/mfa/verify", payload)
    return res.data
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "MFA verification failed"
    return {
      success: false,
      message,
    }
  }
}

/**
 * Resend Email OTP code during MFA session
 */
export const staffResendMFAApi = async (mfaToken: string) => {
  try {
    const res = await axiosInstance.post("/auth/staff/mfa/resend", { mfaToken })
    return res.data
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to resend code"
    return {
      success: false,
      message,
    }
  }
}

/**
 * Fetch TOTP setup payload after completing email MFA.
 */
export const staffSetupTOTPApi = async (
  token?: string,
): Promise<StaffTOTPSetupResponse> => {
  try {
    const res = await axiosInstance.get("/auth/staff/totp/setup", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    return res.data
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to setup Google Authenticator"
    return {
      success: false,
      message,
    }
  }
}

/**
 * Confirm and enable TOTP with a full access token.
 */
export const staffEnableTOTPApi = async (
  code: string,
  token?: string,
): Promise<StaffTOTPEnableResponse> => {
  try {
    const res = await axiosInstance.post(
      "/auth/staff/totp/enable",
      { code },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    )
    return res.data
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to activate Google Authenticator"
    return {
      success: false,
      message,
    }
  }
}

/**
 * Regenerate or fetch TOTP setup payload during pending staff login (before full session)
 */
export const staffSetupPendingTOTPApi = async (
  mfaToken: string,
): Promise<StaffTOTPSetupResponse> => {
  try {
    const res = await axiosInstance.post("/auth/staff/totp/setup-pending", {
      mfaToken,
    })
    return res.data
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to setup authenticator app"
    return {
      success: false,
      message,
    }
  }
}

/**
 * Confirm and enable TOTP during pending staff login and retrieve authenticated tokens
 */
export const staffEnablePendingTOTPApi = async (
  mfaToken: string,
  code?: string,
): Promise<StaffVerifyMFAResponse> => {
  try {
    const res = await axiosInstance.post("/auth/staff/totp/enable-pending", {
      mfaToken,
      ...(code ? { code } : {}),
    })
    return res.data
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to activate authenticator app"
    return {
      success: false,
      message,
    }
  }
}

