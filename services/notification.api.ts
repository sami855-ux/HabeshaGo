import { axiosInstance } from "./axiosInstance"

export const fetchAllNotification = async (userId: string | undefined) => {
  try {
    const response = await axiosInstance.get(`/notification/${userId}`)

    console.log("Fetched Buses:", response.data)
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
