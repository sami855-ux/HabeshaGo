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
