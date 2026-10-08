import axios from "axios"
import { axiosInstance } from "./axiosInstance"
import { logoutAuthSession } from "./authSession"
import { User } from "@/types/user"

const apiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback
  }
  return error instanceof Error ? error.message : fallback
}

// Common API Response Type
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// Register
export interface RegisterPayload {
  email: string
}

export const register = async (
  payload: RegisterPayload,
): Promise<ApiResponse<unknown>> => {
  try {
    const res = await axiosInstance.post("/auth/register", payload)

    if (res.data.success) {
      return {
        success: true,
        data: res.data,
      }
    }
    return {
      success: false,
      message: res.data?.message || "Register failed",
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: apiErrorMessage(error, "Register failed"),
    }
  }
}
//    Verify OTP
export interface VerifyOTPPayload {
  email: string
  code: string
}
export interface VerifyOTPResponse {
  success: boolean
  data: {
    accessToken: string
    userId: string
  }
  message?: string
}

export const verifyOTP = async (
  payload: VerifyOTPPayload,
): Promise<VerifyOTPResponse> => {
  try {
    const { data } = await axiosInstance.post<{
      accessToken: string
      userId: string
    }>("/auth/verify-otp", payload)

    return {
      success: true,
      data: {
        accessToken: data.accessToken,
        userId: data.userId,
      },
    }
  } catch (error: unknown) {
    return {
      success: false,
      data: { accessToken: "", userId: "" },
      message: apiErrorMessage(error, "OTP verification failed"),
    }
  }
}

// Continue with apple
export const continueWithApple = async (idToken: string) => {
  try {
    await axiosInstance.post("/auth/apple", { idToken })
  } catch (error: unknown) {
    return {
      success: false,
      message: apiErrorMessage(error, "Failed"),
    }
  }
}

// Get User By ID
export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  try {
    const { data } = await axiosInstance.get<User>(`/users/${id}`)

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
    const res = await axiosInstance.get("/auth/me")

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
