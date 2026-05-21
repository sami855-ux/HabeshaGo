import { axiosInstance } from "./axiosInstance"

export const checkInPassenger = async (qrCode) => {
  try {
    const response = await axiosInstance.post("/drivers/check-in", {
      qrCode: JSON.stringify(qrCode),
    })
    return response.data.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const getDriverTripHistory = async () => {
  try {
    const response = await axiosInstance.get("/drivers/trips/history")
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const startTrip = async (driverUserId, { busId, scheduleId }) => {
  try {
    const response = await axiosInstance.post("/drivers/start", {
      busId,
      scheduleId,
    })

    console.log("start trip", response.data)

    // Return standardized response
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    }
  } catch (error) {
    // Handle different error types
    const errorMessage = error.response?.data?.message || error.message
    console.log("start trip", error.response.data)
    // Return standardized error
    return {
      success: false,
      message: errorMessage,
      statusCode: error.response?.status || 500,
      data: null,
    }
  }
}

export const getDriverBusWithSchedules = async (driverUserId) => {
  try {
    const response = await axiosInstance.get(`/drivers/bus-with-schedules`, {
      params: { driverUserId },
    })

    console.log(response)
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

// Usage with error handling
// const result = await startTrip("driver_user_id_123", {
//   busId: 123,
//   scheduleId: 456
// })

// if (result.success) {
//   // Handle success
//   console.log("Trip started:", result.data)
// } else {
//   // Handle error
//   console.error("Error:", result.error)
//   Alert.alert("Error", result.error)
// }

export const getTripDetails = async (busId, scheduleId) => {
  try {
    const response = await axiosInstance.get("/drivers/trips/details", {
      params: {
        busId: busId,
        scheduleId: scheduleId,
      },
    })

    return response.data
  } catch (error) {
    console.error(
      "Error fetching trip details:",
      error.response?.data || error.message,
    )
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch trip details",
      statusCode: error.response?.status || 500,
      data: null,
    }
  }
}
