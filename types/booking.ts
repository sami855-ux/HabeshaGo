// types/bus.ts
export const CITIES = [
  "Addis Ababa",
  "Debre Berhan",
  "Bahir Dar",
  "Gondar",
  "Mekelle",
  "Hawassa",
  "Dire Dawa",
  "Jimma",
  "Arba Minch",
  "Awasa",
]

// Booking types
export type BookingStatus =
  | "CONFIRMED"
  | "PENDING"
  | "CANCELLED"
  | "CHECKED_IN"
  | "COMPLETED"
export type PaymentMethod = "CARD" | "MOBILE_BANKING" | "CASH" | "WALLET"
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  profileImage?: string
}

export interface Payment {
  id: number
  bookingId: number
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  processedAt?: Date
}

export interface Booking {
  id: number
  userId: string
  busId: number
  date: Date
  status: BookingStatus
  boardingStop?: string
  alightingStop?: string
  bookingCode: string
  cancelledAt?: Date
  payNow: boolean

  // Ticket sharing
  sharedToId?: string
  sharedTo?: User
  sharedAt?: Date
  sharedTicketUsed: boolean

  // Check-in
  qrCode?: string
  checkedIn: boolean
  checkedInAt?: Date
  validUntil?: Date

  // Pricing
  discount?: number
  promoCode?: string
  amountPaid?: number
  totalAmount?: number
  currency: string

  // Points
  pointsUsed?: number
  pointsValue?: number
  pointsConversionRate?: number

  // Relations
  paymentId?: number
  payment?: Payment
  bus: Bus
  user: User

  createdAt: Date
  updatedAt: Date
}

// Add these to your existing Bus interface
export interface Bus {
  id: number
  busNumber: string
  // ... other existing fields
  pricePerKm: number // Add this for pricing calculation
}
