export type TripStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED"

export interface Trip {
  id: number
  userId: string
  busId: number
  date: string // ISO date
  status: TripStatus
  boardingStop: string
  alightingStop: string
  bookingCode: string
  cancelledAt: string | null
  payNow: boolean
  sharedToId: string | null
  sharedAt: string | null
  sharedTicketUsed: boolean
  qrCode: string
  checkedIn: boolean
  checkedInAt: string | null
  validUntil: string
  discount: string
  promoCode: string | null
  amountPaid: string
  totalAmount: string
  currency: string
  pointsUsed: number
  pointsValue: string
  pointsConversionRate: string
  paymentId: number
  createdAt: string
  updatedAt: string
  bus: {
    id: number
    busNumber: string
    capacity: number
    status: string
    driverId: string
    routeId: number
    currentStop: string | null
    nextDestination: string | null
    isActive: boolean
    departureTime: string | null
    estimatedArrival: string | null
    delayMinutes: number
    lastServiceDate: string
    nextServiceDate: string
    reservedSeats: number
    availableSeats: number
    vehicleId: number
    createdAt: string
    updatedAt: string
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
  sharedTo: null | any // You can define a more specific type if needed
}

export type TripCategory = "upcoming" | "past"
