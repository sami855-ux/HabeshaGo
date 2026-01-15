import { axiosInstance } from "./axiosInstance"

export const fetchAllDriver = async () => {
  try {
    const response = await axiosInstance.get("/drivers")
    return response.data.data
  } catch (error: any) {
    console.error("Error fetching buses:", error)

    return {
      success: false,
      message: "Failed to fetch buses",
      error: error.message,
    }
  }
}

export const fetchAllDriversSimple = async () => {
  try {
    const response = await axiosInstance.get("/drivers")

    // assuming response.data.data is the array of drivers
    return response.data.data.map((driver: any) => ({
      id: driver.id,
      name: driver.user?.name ?? "",
      licenseNumber: driver.licenseNo,
      experience: driver.experience ?? 0,
      status: driver.status,
    }))
  } catch (error: any) {
    console.error("Error fetching drivers:", error)

    return {
      success: false,
      message: "Failed to fetch drivers",
      error: error.message,
    }
  }
}
