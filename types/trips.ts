export type TripStatus = "UPCOMING" | "COMPLETED" | "CANCELLED"

export interface Trip {
  id: string
  originCity: string
  destinationCity: string
  departureTime: string // ISO date
  arrivalTime: string // ISO date
  busName: string
  seatNumber: string
  price: number
  status: TripStatus
}

export type TripCategory = "upcoming" | "past"
