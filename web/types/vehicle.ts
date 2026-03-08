export type VehicleType = "BUS" | "MINIBUS" | "VAN" | "CAR" | "TRUCK"
export type VehicleStatus =
  | "ACTIVE"
  | "UNDER_MAINTENANCE"
  | "OUT_OF_SERVICE"
  | "INACTIVE"

export interface Vehicle {
  id: string
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
