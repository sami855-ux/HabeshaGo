export type MenuItem = {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  subItems?: {
    id: string
    label: string
    icon?: React.ReactNode
    path: string
  }[]
}
export interface Bus {
  id: string
  name: string
  type: string
  amenities: string[]
  departure: string
  arrival: string
  duration: string
  price: number
  discount?: number
  seats: number
  totalSeats: number
  quality: number
  estimatedArrival: string
  routeId: string
}

export interface Route {
  id: string
  from: string
  to: string
  distance: string
  duration: string
  priceRange: [number, number]
  traffic: string
}

export interface Seat {
  id: string
  number: string
  type: "standard" | "premium" | "disabled"
  status: "available" | "booked" | "selected" | "disabled"
  price: number
  recommended?: boolean
}

export interface Booking {
  id: string
  busId: string
  seats: string[]
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled"
  date: Date
}

export type TransactionType = "Tax" | "Transfer" | "Payment"
export type PaymentMethod = "Wallet" | "Telebirr" | "Bank" | "Card" | "Manual"
export type TransactionStatus = "SUCCESS" | "PENDING" | "FAILED"

export interface Transaction {
  id: number
  walletId: number
  amount: number
  balanceAfter: number
  type: TransactionType
  status: TransactionStatus
  reference: string
  description?: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface TransactionTableProps {
  transactions: Transaction[]
  isLoading?: boolean
}
