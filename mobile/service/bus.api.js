import { axiosInstance } from "@/service/axiosInstance"

export const fetchAllBuses = async () => {
  try {
    const res = await axiosInstance.get("/buses")

    return res.data.data
  } catch (error) {
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

export const updateBus = async (busId, updates) => {
  const busIdNumber = Number(busId)
  try {
    const res = await axiosInstance.put(`/buses/${busIdNumber}`, updates)
    return res.data
  } catch (error) {
    console.log("Error updating bus:", error)
    return { success: false, message: "Error updating bus" }
  }
}

export const getAllBuses = async (params) => {
  const res = await axiosInstance.get("/buses", { params })
  return res.data
}

export const getBusById = async (busId) => {
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

export const getSeatAvailability = async (busId, date) => {
  const res = await axiosInstance.get(`/buses/${busId}/availability`, {
    params: { date },
  })
  return res.data
}

export const recordBusPosition = async (
  busId,
  latitude,
  longitude,
  timestamp,
) => {
  const res = await axiosInstance.post(`/buses/${busId}/position`, {
    latitude,
    longitude,
    timestamp,
  })
  return res.data
}
