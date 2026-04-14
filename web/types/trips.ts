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

export type TripStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED"

export interface Trip {
  id: number
  userId?: string
  busId?: number

  date: string
  status: TripStatus

  origin: string
  destination: string

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

  // Relations
  paymentId?: number
  bookedAt: string
  updatedAt?: string

  // tickets array
  tickets: Ticket[]

  bus: {
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

    // ✅ driver nested
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

    // ✅ vehicle nested
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

  payment: {
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
