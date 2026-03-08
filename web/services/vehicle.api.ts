import { axiosInstance } from "./axiosInstance"

export type VehicleType = "BUS" | "MINIBUS" | "VAN" | "CAR" | "TRUCK"
export type VehicleStatus =
  | "ACTIVE"
  | "UNDER_MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "RETIRED"

export interface Vehicle {
  id: number
  type: VehicleType
  model: string
  vin: string
  plateNumber: string
  capacity: number
  manufacturer: string
  year: number
  status: VehicleStatus
  isActive: boolean
  createdAt: string // ISO string
  updatedAt: string // ISO string
  bus: any | null // adjust type if you have a Bus type
  minibus: any | null // adjust type if you have a Minibus type
  driver: any | null // adjust type if you have a Driver type
}

export interface createVehicle {
  type: "BUS" | "MINIBUS" | "VAN" | "TRUCK" // match your Prisma enum
  model: string
  plateNumber: string
  capacity: number
  manufacturer?: string
  year?: number
  status: "ACTIVE" | "OUT_OF_SERVICE" | "UNDER_MAINTENANCE" | "RETIRED"
}

export interface VehicleStats {
  totalVehicles: number
  activeVehicles: number
  underMaintenanceVehicles: number
  outOfServiceVehicles: number
  retiredVehicles: number
}

export const createVehicle = async (
  vehicleData: createVehicle,
): Promise<createVehicle> => {
  try {
    const response = await axiosInstance.post<Vehicle>(
      "/vehicles",
      vehicleData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    return response.data
  } catch (error: any) {
    console.error(
      "Error creating vehicle:",
      error.response?.data || error.message,
    )
  }
}

export const getVehicleStats = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/vehicles/stats")

    return response.data.data
  } catch (error: any) {
    console.error(
      "Error fetching vehicle stats:",
      error.response?.data || error.message,
    )
  }
}

export const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await axiosInstance.get<Vehicle[]>("/vehicles")

    return response.data.data
  } catch (error: any) {
    console.error(
      "Error fetching vehicles:",
      error.response?.data || error.message,
    )
  }
}

export const getAllSimpleVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await axiosInstance.get("/vehicles")

    // assuming response.data.data contains the vehicles array
    return response.data.data.map((vehicle: any) => ({
      id: vehicle.id,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      model: vehicle.model,
      year: vehicle.year ?? null,
      status: vehicle.status ?? "AVAILABLE",
    }))
  } catch (error: any) {
    console.error(
      "Error fetching vehicles:",
      error.response?.data || error.message,
    )
    return []
  }
}

export const updateVehicleStatus = async (
  vehicleId: string,
  status: VehicleStatus,
) => {
  try {
    const res = await axiosInstance.patch(`/vehicles/${vehicleId}/status`, {
      status,
    })
    if (res.data.success) {
      return {
        message: res.data.message,
        success: true,
      }
    } else {
      return {
        message: res.data.message,
        success: false,
      }
    }
  } catch (error) {
    console.log("error on updating status", error)
    return {
      success: false,
      message: "Error when updating vehicle status",
    }
  }
}

export const updateVehicleMileage = async (
  vehicleId: string,
  mileage: number,
) => {
  try {
    const res = await axiosInstance.patch(`/vehicles/${vehicleId}/mileage`, {
      mileage,
    })
    if (res.data.success) {
      return {
        message: res.data.message,
        success: true,
      }
    } else {
      return {
        message: res.data.message,
        success: false,
      }
    }
  } catch (error) {
    console.log("error on updating status", error)
    return {
      success: false,
      message: "Error when updating vehicle status",
    }
  }
}

export const assignDriverForVehicle = async (
  vehicleId: string,
  driverId: string,
) => {
  try {
    const res = await axiosInstance.post(
      `/vehicles/${vehicleId}/assign-driver`,
      { driverId },
    )

    return {
      success: res.data.success,
      message: res.data.message,
      data: res.data.data,
    }
  } catch (error: any) {
    // 🔑 Axios puts non-2xx responses here
    if (error.response?.data) {
      return {
        success: error.response.data.success,
        message: error.response.data.message,
        data: error.response.data.data,
      }
    }

    // real network / server crash
    return {
      success: false,
      message: "Network or server error",
    }
  }
}

export const unassignDriverForVehicle = async (vehicleId: string) => {
  try {
    const res = await axiosInstance.patch(
      `/vehicles/${vehicleId}/unassign-driver`,
    )
    if (res.data.success) {
      return {
        message: res.data.message,
        success: true,
      }
    } else {
      return {
        message: res.data.message,
        success: false,
      }
    }
  } catch (error) {
    console.log("error on assiging driver", error)
    return {
      success: false,
      message: "Error when assiging driver",
    }
  }
}

export const deleteVehicle = async (vehicleId: string) => {
  try {
    const res = await axiosInstance.delete(`/vehicles/${vehicleId}`)

    if (res.data.success) {
      return {
        message: res.data.message,
        success: true,
      }
    } else {
      return {
        message: res.data.message,
        success: false,
      }
    }
  } catch (error) {
    console.log("error on deleting vehicle", error)
    return {
      success: false,
      message: "Error when deleting vehicle",
    }
  }
}

export const getVehicleById = async (vehicleId: string) => {
  try {
    const res = await axiosInstance.get(`/vehicles/${vehicleId}`)
    console.log(res)
    if (res.data.success) {
      return res.data.data
    } else {
      return {}
    }
  } catch (error) {
    console.log("Error while getting vehicle")
    return {}
  }
}
