// types/bus.ts
export interface Bus {
  id: number
  busNumber: string
  capacity: number
  status: BusStatus
  driverId?: string
  routeId?: number
  currentStop?: string
  nextDestination?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  vehicleId?: number

  // Relations
  vehicle?: Vehicle
  bookings?: Booking[]
  driver?: Driver
  route?: Route
  positions?: BusPosition[]
}

export interface BusPosition {
  id: number
  busId: number
  latitude: number
  longitude: number
  timestamp: string
}

export interface Vehicle {
  id: number
  type: VehicleType
  model: string
  plateNumber: string
  capacity: number
  manufacturer?: string
  year?: number
  status: VehicleStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: number
  userId: string
  busId: number
  seatNumber: number
  date: string
  status: BookingStatus
  boardingStop?: string
  alightingStop?: string
  bookingCode: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
  paymentId?: number
  payNow: boolean

  // Relations
  bus?: Bus
  payment?: Payment
  user?: User
}

export interface Route {
  id: number
  name: string
  origin: string
  destination: string
  distanceKm?: number
  estimatedTimeMin?: number
  isActive: boolean
  createdAt: string
  updatedAt: string

  // Relations
  buses?: Bus[]
  minibuses?: any[] // Update with proper type
  midPoints?: RouteMidPoint[]
}

export interface RouteMidPoint {
  id: number
  routeId: number
  name: string
  lat: number
  lng: number
}

export interface Payment {
  id: number
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod: string
  transactionId?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  // Add other user fields as needed
}

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  phone: string
  email: string
  status: DriverStatus
  // Add other driver fields as needed
}

// Enums matching Prisma schema
export enum BusStatus {
  ACTIVE = "ACTIVE",
  MAINTENANCE = "MAINTENANCE",
  INACTIVE = "INACTIVE",
}

export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum VehicleType {
  BUS = "BUS",
  MINIBUS = "MINIBUS",
  VAN = "VAN",
}

export enum VehicleStatus {
  ACTIVE = "ACTIVE",
  MAINTENANCE = "MAINTENANCE",
  INACTIVE = "INACTIVE",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum DriverStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ON_LEAVE = "ON_LEAVE",
}

// Search and Filter Types
export interface BusSearchCriteria {
  from?: string
  to?: string
  date: string
  passengers: number
  routeId?: number
  busType?: VehicleType
  sortBy?: string
  minRating?: number
  maxPrice?: number
  departureTime?: {
    start: string
    end: string
  }
}

export interface SeatSelection {
  busId: number
  seatNumbers: number[]
  totalAmount: number
  passengers: number
}
