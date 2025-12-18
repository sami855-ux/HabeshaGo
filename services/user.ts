import { User } from "@/types/user"
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
