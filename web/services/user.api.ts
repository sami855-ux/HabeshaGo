import { User, UserByPhoneResponse } from "@/types/user"
import { axiosInstance } from "./axiosInstance"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}
// Define the response types
export interface RevenueOverview {
  totalRevenue: number
  totalCommission: number
  adminWalletBalance: number
}

export interface DailyRevenue {
  date: string
  revenue: number
}

export interface ProviderRevenue {
  providerId: string
  providerName: string
  totalRevenue: number
  totalCommission: number
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
export interface TransportStats {
  totalBusTrips: number
  busTrend: string
  activeReservations: number
  reservationMessage: string
  walletBalance: number
  currency: string
}

export const getTransportStats = async (): Promise<TransportStats | null> => {
  try {
    const response = await axiosInstance.get("/users/transport-stats")

    return response.data
  } catch (error) {
    console.error("Error fetching transport stats:", error)
    return null
  }
}

export const getFormattedUsers = async () => {
  console.log("hi")
  try {
    const res = await axiosInstance.get("/users/formatted-users")

    console.log(res.data)
    return res.data.data
  } catch (error) {
    console.error("Error fetching formatted drivers:", error)

    throw (
      error?.response?.data || {
        message: "Failed to fetch drivers",
      }
    )
  }
}

export const getRevenueOverviewAPI = async (): Promise<RevenueOverview> => {
  try {
    const res = await axiosInstance.get<{ data: RevenueOverview }>(
      "/admin/finance/revenue-overview",
    )
    return res.data.data
  } catch (err) {
    console.error("Error fetching revenue overview:", err)
    throw err
  }
}

export const getDailyRevenueAPI = async (
  days = 30,
): Promise<DailyRevenue[]> => {
  try {
    const res = await axiosInstance.get<{ data: DailyRevenue[] }>(
      "/admin/finance/revenue-overview/daily",
      {
        params: { days },
      },
    )
    return res.data.data
  } catch (err) {
    console.error("Error fetching daily revenue:", err)
    throw err
  }
}

export const getProviderRevenueAPI = async (): Promise<ProviderRevenue[]> => {
  try {
    const res = await axiosInstance.get<{ data: ProviderRevenue[] }>(
      "/admin/finance/revenue-overview/providers",
    )
    return res.data.data
  } catch (err) {
    console.error("Error fetching provider revenue:", err)
    throw err
  }
}
