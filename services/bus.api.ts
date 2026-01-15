import { axiosInstance } from "./axiosInstance"

export const fetchAllBuses = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/bus", { params })

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

export const createBus = async (busData: any) => {
  try {
    const response = await axiosInstance.post("/api/buses", busData)
    return response.data
  } catch (error: any) {
    console.error("Error creating bus:", error)
    return {
      success: false,
      message: "Failed to create bus",
      error: error.message,
    }
  }
}
