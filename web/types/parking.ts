export interface ParkingLot {
  id: string
  name: string
  description?: string
  address: string
  city: string
  latitude: number
  longitude: number
  totalSlots: number
  availableSlots: number
  pricePerMinute: number
  openingTime?: string
  closingTime?: string
  hasSecurity: boolean
  hasCCTV: boolean
  status: string
  rating?: number
  reviewCount?: number
  slots?: ParkingSlot[]
  distance?: number
}

export interface ParkingSlot {
  id: string
  parkingLotId: string
  slotNumber: string
  slotType:
    | "CAR"
    | "MOTORCYCLE"
    | "TRUCK"
    | "EV_FAST"
    | "EV_SUPER"
    | "EV_STANDARD"
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE"
  isOccupied: boolean
  floor?: number
  section?: string
  isEV: boolean
  hasCharger: boolean
  lastOccupiedAt?: string
  sensorId?: string
}

export interface ParkingReservation {
  id: string
  userId: string
  parkingLotId: string
  slotId: string
  startTime: string
  endTime: string
  totalPrice: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  createdAt: string
  updatedAt: string
}
