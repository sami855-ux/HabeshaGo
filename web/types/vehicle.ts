export type VehicleType = "BUS" | "MINIBUS" | "VAN" | "CAR" | "TRUCK"
export type VehicleStatus =
  | "ACTIVE"
  | "UNDER_MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "INACTIVE"

export interface Vehicle {
  id: number
  type: VehicleType
  vin: string
  model: string
  plateNumber: string
  capacity: number
  manufacturer: string
  year: number
  status: VehicleStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
  driverId?: string
  busId?: string
  minibusId?: string
  ownerName: string | null
  ownerPhone: string | null
  gpsDeviceId: string
  mileage: number
  connectorType: "TYPE2" | "CCS" | "CHADEMO" | "TESLA" | "GBT"
  vehicleImageUrl: string
}

export interface VehicleFormData {
  type: VehicleType
  model: string
  plateNumber: string
  capacity: number
  manufacturer: string
  year: number
  status: VehicleStatus
  isActive: boolean
  driverId?: string
  ownerName: string
  ownerPhone: string
  gpsDeviceId: string
  mileage: number
  vin: string
}

export interface ApiResponse<T> {
  data: T
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface VehicleFilters {
  search?: string
  type?: VehicleType
  status?: VehicleStatus
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface CreateVehiclePayload {
  type: VehicleType
  vin: string
  model: string
  plateNumber: string
  capacity: number
  manufacturer: string
  year: number

  connectorType: "TYPE2" | "CCS" | "CHADEMO" | "TESLA" | "GBT"

  gpsDeviceId: string
  mileage?: number

  ownerName?: string | null
  ownerPhone?: string | null
}

export interface VehicleUserFormData {
  type: VehicleType
  vin: string
  model: string
  plateNumber: string
  capacity: number
  manufacturer: string
  year: number

  connectorType: "TYPE2" | "CCS" | "CHADEMO" | "TESLA" | "GBT"

  gpsDeviceId: string
  mileage?: number

  ownerName?: string
  ownerPhone?: string
  image?: File // 👈 NEW
}
