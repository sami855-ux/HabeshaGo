import { axiosInstance } from "./axiosInstance"
import { User } from "@/types/user"

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

export const register = async (payload: RegisterPayload) => {
  try {
    const res = await axiosInstance.post("/auth/register", payload)

    if (res.data.success) {
      return {
        success: true,
        data: res.data,
      }
    }
  } catch (error: any) {
    console.error("Register failed:", error)
    return {
      success: false,
      message:
        error?.response?.data?.message || error.message || "Register failed",
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
    }>("/auth/verify-otp", payload)

    return {
      success: true,
      data: {
        accessToken: data.accessToken,
        userId: data.userId,
      },
    }
  } catch (error: any) {
    console.error("OTP verification failed:", error)

    return {
      success: false,
      data: { accessToken: "", userId: "" },
      message:
        error?.response?.data?.message ||
        error?.message ||
        "OTP verification failed",
    }
  }
}

// Continue with apple
export const continueWithApple = async (idToken: string) => {
  try {
    await axiosInstance.post("/auth/apple", { idToken })
  } catch (error: any) {
    console.error("Register failed:", error)
    return {
      success: false,
      message: error?.response?.data?.message || error.message || "Failed",
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
  } catch (error: any) {
    console.error("Failed to fetch user:", error)
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Failed to fetch user",
    }
  }
}

export const getMe = async (accessToken?: string) => {
  try {
    const res = await axiosInstance.get("/auth/me", {
      withCredentials: true,
      ...(accessToken && {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    })

    if (res.data.success) {
      return res.data
    } else {
      return {
        success: false,
      }
    }
  } catch (error) {
    console.error("Failed to fetch user:", error)
    return { success: false }
  }
}

export const logoutUser = async () => {
  try {
    const res = await axiosInstance.post(
      "/auth/logout",
      {},
      { withCredentials: true },
    )
    return res.data
  } catch (err) {
    console.error("Logout failed:", err)
    throw err
  }
}
