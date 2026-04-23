import { User } from "./user"

export interface Ticket {
  id: number
  seatNumber: number | null
  boardingStop: string | null
  alightingStop: string | null
  qrCode: string | null
  checkedIn: boolean
  checkedInAt: string | null
  validUntil: string | null
  sharedTo: User | null
  sharedTicketUsed: boolean
  sharedAt: string
  cancelledAt: string | null
}

export type TripStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED" | "IN_PROGRESS"
export type TripType = "BUS" | "EV" | "PARKING"
export type TripCategory = "upcoming" | "past"

export interface Trip {
  id: number
  type: TripType
  category?: TripCategory // upcoming or past
  userId?: string
  busId?: number
  status: TripStatus
  bookingCode: string
  cancelledAt?: string | null

  // Pricing
  discount?: string
  promoCode?: string | null
  amountPaid: string
  totalAmount: string
  currency: string

  // Points
  pointsUsed?: number
  pointsValue?: string
  pointsConversionRate?: string

  // Dates
  bookedAt: string
  updatedAt?: string
  date?: string // BUS departure date
  startTime?: string // EV session start
  endTime?: string // EV session end
  createdAt?: string // EV reservation created at

  // Locations
  origin?: string // BUS origin
  destination?: string // BUS destination

  // EV specific
  targetBatteryPercentage?: number
  targetKwh?: number

  // Relations
  paymentId?: number
  tickets?: Ticket[] // BUS tickets

  // BUS specific
  bus?: {
    id: number
    busNumber: string
    capacity: number
    status: string
    currentStop: string | null
    nextDestination: string | null
    isActive: boolean
    departureTime: string | null
    estimatedArrival: string | null
    delayMinutes: number
    driver: {
      id: string
      name: string
      phone: string
      licenseNo: string
      experience: number
      rating: number
      totalTrips: number
      status: string
      isOnDuty: boolean
    }
    vehicle: {
      id: number
      plateNumber: string
      model: string
      manufacturer: string
      year: number
      capacity: number
      mileage: number
      image: string
      status: string
      type: string
    }
  }

  // EV specific
  vehicle?: {
    id: number
    plateNumber: string
    model: string
    manufacturer: string
    year?: number
    image?: string
    type?: string
    capacity?: number
  }

  chargingPoint?: {
    id: number
    name: string
    status: string
    connectorType?: string
    powerKw?: number
    slotNumber?: string
  }

  payments?: Array<{
    id: number
    amount: number
    status: string
    method: string
    gateway?: string
    reference?: string
    createdAt?: string
  }>

  // Payment (BUS uses this, EV uses payments array)
  payment?: {
    id: number
    userId: string
    amount: string
    currency: string
    method: string
    gateway: string
    flow: string
    pointsUsed: number
    pointsValue: string
    status: string
    gatewayRef: string | null
    reference: string
    metadata: string | null
    walletId: number
    minibusReservationId: string | null
    createdAt: string
    updatedAt: string
  }
}

export const isBusTrip = (trip: Trip): boolean => {
  return trip.type === "BUS"
}

export const isEvTrip = (trip: Trip): boolean => {
  return trip.type === "EV"
}

// export const isParkingTrip = (trip: Trip): boolean => {
//   return trip.type === "PARKING"
// }
