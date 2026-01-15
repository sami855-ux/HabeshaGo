import { axiosInstance } from "./axiosInstance"

export type VehicleType = "BUS" | "MINIBUS" | "VAN" | "CAR" | "TRUCK"
export type VehicleStatus =
  | "ACTIVE"
  | "UNDER_MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "INACTIVE"

export interface Vehicle {
  id: number
  type: VehicleType
  model: string
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
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE" // match your Prisma enum
}

export interface VehicleStats {
  totalVehicles: number
  activeVehicles: number
  maintenanceVehicles: number
  outOfServiceVehicles: number
}

export const createVehicle = async (
  vehicleData: createVehicle
): Promise<createVehicle> => {
  try {
    const response = await axiosInstance.post<Vehicle>(
      "/vehicles",
      vehicleData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error(
      "Error creating vehicle:",
      error.response?.data || error.message
    )
  }
}

export const getVehicleStats = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/vehicles/stats")

    return response.data
  } catch (error: any) {
    console.error(
      "Error fetching vehicle stats:",
      error.response?.data || error.message
    )
  }
}

export const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await axiosInstance.get<Vehicle[]>("/vehicles")

    return response.data
  } catch (error: any) {
    console.error(
      "Error fetching vehicles:",
      error.response?.data || error.message
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
      error.response?.data || error.message
    )
    return []
  }
}
