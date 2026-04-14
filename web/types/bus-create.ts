export interface BusSchedule {
  startTime: string // Format: "HH:MM" in Western time
  ethiopianTime: string // Format: "HH:MM ጠዋት/ከሰዓት"
  direction: "FORWARD" | "REVERSE"
  endTime?: string // Western time
  endEthiopianTime?: string // Ethiopian time
  isActive?: boolean
  intervalAfter?: number
}

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  experience?: number
  status?: string
}

export interface Route {
  id: number
  name: string
  origin: string
  destination: string
  distanceKm?: number
  estimatedTimeMin: number
  stops?: string[]
}

export interface Vehicle {
  id: number
  plateNumber: string
  type: string
  model: string
  year?: number
  status?: string
  mileage?: number
}

export interface BusFormData {
  busNumber: string
  capacity: number
  status: "ACTIVE" | "OUT_OF_SERVICE" | "UNDER_MAINTENANCE"
  vehicleId?: number
  driverId?: string
  routeId?: number
  currentStop?: string
  nextDestination?: string
  isActive: boolean
  departureTime?: Date
  estimatedArrival?: Date
  delayMinutes: number
  lastServiceDate?: Date
  nextServiceDate?: Date
  currentLocation?: {
    latitude?: number
    longitude?: number
  }
  schedules: BusSchedule[]
}
