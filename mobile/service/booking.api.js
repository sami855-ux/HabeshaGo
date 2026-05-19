import { axiosInstance } from "@/service/axiosInstance"

export const createNewBooking = async (data) => {
  try {
    const res = await axiosInstance.post("/booking", data)

    if (res.data.success) {
      return res.data.data
    } else {
      return {}
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return {}
  }
}

export const getBooking = async (bookingId) => {
  try {
    const res = await axiosInstance.get(`/booking/${bookingId}`)

    if (res.data.success) {
      return res.data.data
    } else {
      return {}
    }
  } catch (error) {
    console.error("Error getting a single booking:", error)
    return {}
  }
}

export const getUserBookings = async () => {
  try {
    const res = await axiosInstance.get("/booking")
    if (res.data.success) {
      return res.data.data
    } else {
      return []
    }
  } catch (error) {
    console.error("Error getting a user's bookings:", error)
    return []
  }
}

export const shareBookingRequest = async (
  bookingId,
  targetUserId,
  ticketIds,
) => {
  try {
    const res = await axiosInstance.patch(
      `/booking/${bookingId}/share/request`,
      {
        targetUserId,
        ticketIds,
      },
    )
    return res.data
  } catch (error) {
    console.error("Error sharing a ticket:", error)
    return {
      success: false,
      message: error.response?.data.message || "Failed",
    }
  }
}
