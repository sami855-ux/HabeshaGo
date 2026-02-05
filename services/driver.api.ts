import { axiosInstance } from "./axiosInstance"

enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  UNDER_REVIEW = "UNDER_REVIEW",
}

export const fetchAllDriver = async () => {
  try {
    const response = await axiosInstance.get("/drivers")
    console.log("Drivers", response.data.data)
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

export const fetchDriverById = async (driverId: string) => {
  try {
    const response = await axiosInstance.get(`/drivers/${driverId}`)
    console.log("driver", response.data.data)
    return response.data.data
  } catch (error: any) {
    console.error("Error fetching driver:", error)
  }
}

export const updateVerificationStatus = async (
  driverId: string,
  status: VerificationStatus,
  reason?: string,
) => {
  try {
    const response = await axiosInstance.patch(
      `/drivers/${driverId}/verification`,
      {
        status,
        reason,
      },
    )
    return response.data
  } catch (error: any) {
    console.error("Error updating verification status:", error)
    return {
      success: false,
      message: "Failed to update verification status",
      error: error.message,
    }
  }
}
