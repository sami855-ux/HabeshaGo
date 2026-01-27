import { User, UserByPhoneResponse } from "@/types/user"
import { axiosInstance } from "./axiosInstance"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

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
        error?.response?.data?.message || error.message || "Unknown error",
    }
  }
}

export const getAllUsers = async () => {
  try {
    const { data } = await axiosInstance.get("/users")

    if (data.success) {
      return data.users
    } else {
      console.error("Error fetching users:", data.message)
      return []
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export const deleteUser = async (userId: string) => {
  try {
    const response = await axiosInstance.delete(`/users/${userId}`)

    if (!response.data.success) {
      return {
        success: false,
        message: response.data.message || "Failed to delete user",
      }
    } else {
      return {
        success: true,
        message: "User deleted successfully",
      }
    }
  } catch (error) {
    console.error("Failed to delete user:", error)
    return {
      success: false,
      message:
        error?.response?.data?.message || error.message || "Unknown error",
    }
  }
}

export const updateMyProfileAPI = async (formData) => {
  try {
    const res = await axiosInstance.patch("/users/me/profile", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return res.data
  } catch (error) {
    console.error("Update profile API error:", error)
    return {
      message: "Not",
      success: false,
    }
  }
}

export const sendVerificationEmailAPI = async () => {
  try {
    const res = await axiosInstance.post("/users/me/send-otp", {
      channel: "email",
      type: "verification",
    })

    return {
      message: res.data.message,
      success: true,
      data: res.data,
    }
  } catch (error) {
    console.error("Send verification email API error:", error)
    return {
      message: "Not",
      success: false,
    }
  }
}

export const sendVerificationSMSAPI = async () => {
  try {
    const res = await axiosInstance.post("/users/me/send-verification-sms")

    return res.data
  } catch (error) {
    console.error("Send verification SMS API error:", error)
    return {
      message: "Not",
      success: false,
    }
  }
}

export const verifyCodeAPI = async (code: string, type: "email" | "phone") => {
  try {
    const res = await axiosInstance.post("/users/me/verify-otp", {
      code,
      channel: type === "email" ? "email" : "sms",
    })

    return {
      success: true,
      message: "Verification successful",
      data: res.data,
    }
  } catch (error) {
    console.error("Verify code API error:", error)
    return {
      message: "Not",
      success: false,
    }
  }
}

export const getUserByPhoneNumber = async (
  phoneNumber: string,
): Promise<ApiResponse<UserByPhoneResponse[]>> => {
  try {
    const res = await axiosInstance.get<{
      success: boolean
      data: UserByPhoneResponse[]
    }>("/users/by-phone", {
      params: { phone: phoneNumber },
    })

    return {
      success: true,
      data: res.data.users[0],
    }
  } catch (error: any) {
    console.error("Failed to fetch user by phone number:", error)

    return {
      success: false,
      message:
        error?.response?.data?.message || error.message || "Unknown error",
    }
  }
}
