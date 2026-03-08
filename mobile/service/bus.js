import { axiosInstance } from "./axiosInstance.js"

export const searchBuses = async (start, end) => {
  try {
    const res = await axiosInstance.get("/bus/search", {
      params: {
        start,
        end,
      },
    })

    console.log(res.data)
    return {
      success: true,
      data: res.data.data,
    }
  } catch (error) {
    console.error("Failed to search buses:", error)
    return {
      success: false,
      data: null,
    }
  }
}

export const getBusDetails = async (busId) => {
  try {
    const res = await axiosInstance.get(`/buses/${busId}`)

    return {
      success: true,
      data: res.data.data,
    }
  } catch (error) {
    console.error("Failed to get bus details:", error)
    return {
      success: false,
      data: null,
    }
  }
}
