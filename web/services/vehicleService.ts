import {
  Vehicle,
  CreateVehiclePayload,
  VehicleUserFormData,
} from "@/types/vehicle"
import { axiosInstance } from "./axiosInstance"
import { AxiosError } from "axios"

export const handleApiError = (error: unknown, message: string) => {
  const err = error as AxiosError<any>

  console.error(message, err?.response?.data || err.message)

  throw new Error(err?.response?.data?.message || message)
}

export const vehicleService = {
  // GET VEHICLES
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const { data } = await axiosInstance.get(`/vehicles/user-vehicles`)

      return data.data
    } catch (error) {
      handleApiError(error, "Failed to fetch vehicles")
      throw error
    }
  },

  // CREATE VEHICLE
  async createVehicle(formData: VehicleUserFormData): Promise<Vehicle> {
    try {
      const payload = new FormData()

      // REQUIRED FIELDS
      payload.append("type", formData.type)
      payload.append("vin", formData.vin)
      payload.append("model", formData.model)
      payload.append("plateNumber", formData.plateNumber)
      payload.append("capacity", String(formData.capacity))
      payload.append("manufacturer", formData.manufacturer)
      payload.append("year", String(formData.year))
      payload.append("connectorType", formData.connectorType)

      // OPTIONAL FIELDS
      payload.append("gpsDeviceId", formData.gpsDeviceId || "")
      payload.append("mileage", String(formData.mileage || 0))

      if (formData.ownerName) {
        payload.append("ownerName", formData.ownerName)
      }

      if (formData.ownerPhone) {
        payload.append("ownerPhone", formData.ownerPhone)
      }

      // IMAGE FILE (NEW)
      if (formData.image instanceof File) {
        payload.append("image", formData.image)
      }

      // API CALL
      const { data } = await axiosInstance.post("/vehicles", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return data.data
    } catch (error) {
      handleApiError(error, "Failed to create vehicle")
      throw error
    }
  },

  // DELETE VEHICLE
  async deleteVehicle(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/vehicles/${id}`)
    } catch (error) {
      handleApiError(error, "Failed to delete vehicle")
      throw error
    }
  },
}
