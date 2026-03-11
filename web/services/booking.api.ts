import { axiosInstance } from "@/services/axiosInstance"

export const bookingService = {
  // Create a new booking
  createBooking: async (data: {
    userId: string
    busId: number
    seatNumbers: number[]
    payNow?: boolean
  }) => {
    const res = await axiosInstance.post("/api/bookings", data)
    return res.data
  },

  // Get bookings for a user
  getUserBookings: async (userId: string) => {
    const res = await axiosInstance.get(`/api/bookings/user/${userId}`)
    return res.data
  },
}
export interface BookingRequest {
  busId: number
  date: string // ISO string
  boardingStop?: string
  alightingStop?: string

  totalAmount: number
  discount?: number
  promoCode?: string

  pointsUsed?: number
  pointsConversionRate?: number
  isPointUsed?: boolean
  currency?: string
  scheduleStartTime: string
  seats: number
}

export interface BookingResponse {
  booking: any
  payment: any
}

export const createNewBooking = async (
  data: BookingRequest,
): Promise<BookingResponse | {}> => {
  try {
    const res = await axiosInstance.post("/booking", data)

    if (res.data.success) {
      return res.data.data as BookingResponse
    } else {
      return {}
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return {}
  }
}

export const getBooking = async (bookingId: string) => {
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
  bookingId: string,
  targetUserId: string,
) => {
  try {
    const res = await axiosInstance.patch(
      `/booking/${bookingId}/share/request`,
      {
        targetUserId,
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

export const getSharedTicketsAPI = async () => {
  const response = await axiosInstance.get("/booking/shared-tickets")
  return response.data.data
}
