import { axiosInstance } from "./axiosInstance"

export const getEVStations = async () => {
  try {
    const response = await axiosInstance.get("/ev/station")
    return response.data.data
  } catch (error) {
    console.error("Error fetching EV stations:", error)
    return []
  }
}

export const getEVStationById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/ev/station/${id}`)

    if (response.data.success) {
      return response.data.data
    } else {
      return {
        message: "EV station not found",
        success: false,
      }
    }
  } catch (error) {
    console.error("Error fetching EV station by ID:", error)
    return {
      message: "Error fetching EV station by ID",
      success: false,
    }
  }
}

export const createEVStation = async (evStationData: any) => {
  try {
    const response = await axiosInstance.post("/ev/station", evStationData)

    if (response.data.success) {
      return response.data.data
    } else {
      return {
        message: "Error creating EV station",
        success: false,
      }
    }
  } catch (error) {
    console.error("Error creating EV station:", error)
    return {
      message: "Error creating EV station",
      success: false,
    }
  }
}
