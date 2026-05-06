import { axiosInstance } from "@/services/axiosInstance"

export const fetchAllBuses = async () => {
  try {
    const res = await axiosInstance.get("/buses")

    return res.data.data
  } catch (error: any) {
    console.error("Error fetching buses:", error)
    return []
  }
}

export const searchBusesAPI = async (searchData) => {
  try {
    // Build query string
    const params = new URLSearchParams({
      origin: searchData.from,
      destination: searchData.to,
      date: searchData.date,
      time: searchData.time,
      passengers: searchData.passengers.toString(),
    })

    console.log(params)

    // Make API call
    const res = await axiosInstance.get(`/buses/search?${params.toString()}`)
    return res.data
  } catch (error) {
    console.error("Error searching buses:", error)
    return error?.response?.data || []
  }
}

export const updateBus = async (busId: string, updates: any) => {
  const busIdNumber = Number(busId)
  try {
    const res = await axiosInstance.put(`/buses/${busIdNumber}`, updates)
    return res.data
  } catch (error) {
    console.log("Error updating bus:", error)
    return { success: false, message: "Error updating bus" }
  }
}

export const getAllBuses = async (params?: {
  page?: number
  limit?: number
  routeId?: number
  status?: string
}) => {
  const res = await axiosInstance.get("/buses", { params })
  return res.data
}

export const getBusById = async (busId: string) => {
  const busIdNumber = Number(busId)
  try {
    const res = await axiosInstance.get(`/buses/${busIdNumber}`)
    return res.data.data
  } catch (error) {
    console.log("Error fetching bus by ID:", error)
    return {}
  }
}

export const getAllMidpoints = async () => {
  try {
    const res = await axiosInstance.get("/buses/midpoints")

    if (res.data.success) {
      return res.data.data
    } else {
      return []
    }
  } catch (error) {
    console.log("Error Fetching all the midpoints", error)
    return []
  }
}

export const getSeatAvailability = async (busId: number, date: string) => {
  const res = await axiosInstance.get(`/buses/${busId}/availability`, {
    params: { date },
  })
  return res.data
}

export const recordBusPosition = async (
  busId: number,
  latitude: number,
  longitude: number,
  timestamp?: string,
) => {
  const res = await axiosInstance.post(`/buses/${busId}/position`, {
    latitude,
    longitude,
    timestamp,
  })
  return res.data
}

export const submitRating = async (payload) => {
  try {
    const response = await axiosInstance.post("/buses/ratings", payload)
    return response.data
  } catch (error) {
    console.error("Submit rating error:", error)

    return {
      success: false,
      message: error.response?.data?.message || "Failed to submit rating",
    }
  }
}
