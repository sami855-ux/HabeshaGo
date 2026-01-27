import { axiosInstance } from "@/services/axiosInstance"

export const fetchAllBuses = async () => {
  try {
    const res = await axiosInstance.get("/buses")

    return res.data
  } catch (error: any) {
    console.error("Error fetching buses:", error)

    // normalize error so frontend can handle it easily
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch buses",
      }
    )
  }
}

export const searchBuses = async (start: string, end: string) => {
  const res = await axiosInstance.get("/buses/search", {
    params: { start, end },
  })
  return res.data.data
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

export const getBusById = async (busId: number) => {
  const res = await axiosInstance.get(`/buses/${busId}`)
  return res.data
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
  timestamp?: string
) => {
  const res = await axiosInstance.post(`/buses/${busId}/position`, {
    latitude,
    longitude,
    timestamp,
  })
  return res.data
}
