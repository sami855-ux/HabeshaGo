export interface Coordinates {
  lat: number
  lng: number
}

export interface EVStation {
  id: string
  name: string
  address: string
  location: Coordinates
  chargingType: "fast" | "standard"
  availableChargers: number
  totalChargers: number
  distance?: number
}

export interface ParkingStation {
  id: string
  name: string
  address: string
  location: Coordinates
  availableSpaces: number
  totalSpaces: number
  pricing?: string
  distance?: number
}

export interface Bus {
  id: string
  routeId: string
  routeName: string
  location: Coordinates
  speed?: number
  heading?: number
  timestamp: Date
}

export interface RouteInfo {
  distance: string
  duration: string
  coordinates: Coordinates[]
}

export type MarkerType = "ev" | "parking" | "bus" | "all"
