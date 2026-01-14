import { axiosInstance } from "./axiosInstance"

export const fetchAllBuses = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/buses", { params })
    // response.data will have { success, message, data }
    return response.data
  } catch (error: any) {
    console.error("Error fetching buses:", error)

    return {
      success: false,
      message: "Failed to fetch buses",
      error: error.message,
    }
  }
}
