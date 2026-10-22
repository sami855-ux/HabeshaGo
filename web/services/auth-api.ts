import axios from "axios"
import { axiosInstance, logoutAuthSession } from "./auth-session"
import type { User } from "@/types/user"

const apiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string; error?: { message?: string } }>(error)) {
    return (
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      fallback
    )
  }
  return error instanceof Error ? error.message : fallback
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
}

export interface ContinueWithEmailPayload {
  email: string
  name?: string
}

export interface ContinueWithEmailResult {
  email: string
  isNewUser: boolean
  expiresIn: number
  devOtp?: string
}

/**
 * Step 1: Initiate Passenger Login / Registration with Email OTP
 * POST /api/v1/auth/continue-with-email
 */
export const continueWithEmail = async (
  payload: ContinueWithEmailPayload,
): Promise<ApiResponse<ContinueWithEmailResult>> => {
  try {
    const res = await axiosInstance.post<{
      success: boolean
      message?: string
      email?: string
      isNewUser?: boolean
      expiresIn?: number
      devOtp?: string
      data?: {
        email?: string
        isNewUser?: boolean
        expiresIn?: number
      }
      error?: { code?: string; message?: string }
    }>("/v1/auth/continue-with-email", {
      email: payload.email.trim().toLowerCase(),
      name: payload.name?.trim(),
    })

    if (res.data?.success) {
      return {
        success: true,
        message: res.data.message || "OTP code sent to email",
        data: {
          email: res.data.email || res.data.data?.email || payload.email,
          isNewUser: res.data.isNewUser ?? res.data.data?.isNewUser ?? false,
          expiresIn: res.data.expiresIn || res.data.data?.expiresIn || 300,
          devOtp: res.data.devOtp,
        },
      }
    }

    return {
      success: false,
      message:
        res.data?.error?.message ||
        res.data?.message ||
        "Failed to send verification code",
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: apiErrorMessage(error, "Failed to send verification code"),
    }
  }
}

// Retain register export for backward compatibility
export const register = continueWithEmail

export interface ResendOtpPayload {
  email: string
}

export interface ResendOtpResult {
  email: string
  expiresIn: number
  devOtp?: string
}

/**
 * Resend OTP Code for Passenger
 * POST /api/v1/auth/resend-otp
 */
export const resendOtp = async (
  payload: ResendOtpPayload,
): Promise<ApiResponse<ResendOtpResult>> => {
  try {
    const res = await axiosInstance.post<{
      success: boolean
      message?: string
      email?: string
      expiresIn?: number
      devOtp?: string
      error?: { code?: string; message?: string }
    }>("/v1/auth/resend-otp", {
      email: payload.email.trim().toLowerCase(),
    })

    if (res.data?.success) {
      return {
        success: true,
        message: res.data.message || "Verification code resent to email",
        data: {
          email: res.data.email || payload.email,
          expiresIn: res.data.expiresIn || 300,
          devOtp: res.data.devOtp,
        },
      }
    }

    return {
      success: false,
      message:
        res.data?.error?.message ||
        res.data?.message ||
        "Failed to resend verification code",
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: apiErrorMessage(error, "Failed to resend verification code"),
    }
  }
}

export interface VerifyOTPPayload {
  email: string
  code: string
}

export interface VerifyOTPResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken?: string
    userId: string
    user?: User
  }
  user?: User
  message?: string
  mfaRequired?: boolean
  mfaToken?: string
}

/**
 * Step 2: Verify OTP Code and establish Passenger Session
 * POST /api/v1/auth/verify-otp
 */
export const verifyOTP = async (
  payload: VerifyOTPPayload,
): Promise<VerifyOTPResponse> => {
  try {
    const res = await axiosInstance.post<{
      success: boolean
      accessToken?: string
      refreshToken?: string
      userId?: string
      user?: User
      mfaRequired?: boolean
      mfaToken?: string
      message?: string
      data?: {
        accessToken?: string
        refreshToken?: string
        userId?: string
        user?: User
      }
      error?: { code?: string; message?: string }
    }>("/v1/auth/verify-otp", {
      email: payload.email.trim().toLowerCase(),
      code: payload.code.trim(),
    })

    const raw = res.data
    if (raw?.success) {
      const accessToken = raw.accessToken || raw.data?.accessToken || ""
      const refreshToken = raw.refreshToken || raw.data?.refreshToken
      const userId = raw.userId || raw.data?.userId || raw.user?.id || ""
      const user = raw.user || raw.data?.user

      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
          userId,
          user,
        },
        user,
        mfaRequired: raw.mfaRequired,
        mfaToken: raw.mfaToken,
        message: raw.message || "Authentication successful",
      }
    }

    return {
      success: false,
      data: { accessToken: "", userId: "" },
      message: raw?.error?.message || raw?.message || "OTP verification failed",
    }
  } catch (error: unknown) {
    return {
      success: false,
      data: { accessToken: "", userId: "" },
      message: apiErrorMessage(error, "OTP verification failed"),
    }
  }
}

export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  try {
    const { data } = await axiosInstance.get<User>(`/v1/admin/users/${id}`)
    return {
      success: true,
      data,
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: apiErrorMessage(error, "Failed to fetch user"),
    }
  }
}

export const getMe = async () => {
  try {
    const res = await axiosInstance.get<{
      success: boolean
      user?: User
      message?: string
    }>("/v1/auth/me")
    if (res.data?.success && res.data?.user) {
      return res.data
    }
    throw new Error(res.data?.message || "Failed to fetch user")
  } catch (error: unknown) {
    throw new Error(apiErrorMessage(error, "Failed to fetch user"))
  }
}

export const logoutUser = async () => {
  await logoutAuthSession()
}
