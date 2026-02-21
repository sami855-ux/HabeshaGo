import { axiosInstance } from "./axiosInstance"

export const fetchAllNotification = async () => {
  try {
    const response = await axiosInstance.get(`/notification/me`)

    if (response.success) {
      return response.data.notifications
    } else {
      return []
    }
  } catch (error) {
    console.error("Error fetching Notifications:", error)

    return {
      success: false,
      message: "Failed to fetch buses",
      error: error.message,
    }
  }
}
