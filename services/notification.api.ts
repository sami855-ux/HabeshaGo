import { axiosInstance } from "./axiosInstance"

export const fetchAllNotification = async () => {
  try {
    const response = await axiosInstance.get(`/notification/me`)

    console.log(response.data.success, response.data.notifications)
    if (response.data.success) {
      return response.data.notifications
    } else {
      return []
    }
  } catch (error: any) {
    console.error("Error fetching Notifications:", error)

    return {
      success: false,
      message: "Failed to fetch buses",
      error: error.message,
    }
  }
}
