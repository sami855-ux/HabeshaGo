export type BusStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "MAINTENANCE"
  | "UNDER_MAINTENANCE"
  | "OUT_OF_SERVICE"

export interface Bus {
  id: number
  busNumber: string
  capacity: number
  status: BusStatus
  isActive: boolean
  isDeleted?: boolean
  createdAt: string | Date
  updatedAt: string | Date

  currentStop?: string | null
  nextDestination?: string | null

  driverId?: string
  driverName?: string
  driver?: Driver | null

  routeId?: number
  routeName?: string
  route?: Route | null

  positions?: BusPosition[]
  bookings?: Booking[]
}

export interface Driver {
  id: string
  name: string
  phone?: string
}

export interface Booking {
  id: number
  seatNumber: number
  status: "CONFIRMED" | "CANCELLED"
}

export interface BusPosition {
  latitude: number
  longitude: number
  timestamp: Date
}

export interface Route {
  id: number
  name: string
  origin: string
  destination: string
  distanceKm?: number | null
  estimatedTimeMin?: number | null
  midPoints: RouteMidPoint[]
}

export interface RouteMidPoint {
  name: string
  lat: number
  lng: number
}

export interface BusFilters {
  search: string
  status: BusStatus | ""
  route: string
  driver: string
}
