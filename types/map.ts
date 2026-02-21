import { LatLng } from "react-native-maps"

export type ReportCategory =
  | "traffic"
  | "power"
  | "road"
  | "safety"
  | "water"
  | "other"
export type ReportStatus = "open" | "resolved" | "in-progress"
export type TripStatus = "active" | "upcoming" | "completed"
export type BusStatus = "active" | "inactive" | "maintenance"

export interface Report {
  id: string
  title: string
  description: string
  category: ReportCategory
  status: ReportStatus
  timestamp: Date
  location: LatLng
  severity: "low" | "medium" | "high"
  votes: number
}

export interface Bus {
  id: string
  route: string
  plateNumber: string
  capacity: number
  occupancy: number
  status: BusStatus
  location: LatLng
  driver?: string
}

export interface Trip {
  id: string
  busId: string
  route: string
  from: string
  to: string
  time: string
  date: string
  status: TripStatus
  ticketNumber: string
  seatNumber: string
  price: number
}

// Mock data
export const mockReports: Report[] = [
  {
    id: "1",
    title: "Major Traffic Jam",
    description: "Heavy traffic on Bole Road towards airport",
    category: "traffic",
    status: "open",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    location: { latitude: 9.0227, longitude: 38.7468 },
    severity: "high",
    votes: 42,
  },
  // ... add more mock reports
]

export const mockBuses: Bus[] = [
  {
    id: "bus1",
    route: "Bole - Merkato",
    plateNumber: "AA 12345",
    capacity: 60,
    occupancy: 42,
    status: "active",
    location: { latitude: 9.0227, longitude: 38.7468 },
  },
  {
    id: "bus2",
    route: "CMC - Piassa",
    plateNumber: "AA 67890",
    capacity: 60,
    occupancy: 35,
    status: "active",
    location: { latitude: 9.035, longitude: 38.758 },
  },
  {
    id: "bus3",
    route: "Ayat - Mexico",
    plateNumber: "AA 54321",
    capacity: 60,
    occupancy: 58,
    status: "active",
    location: { latitude: 9.0152, longitude: 38.7618 },
  },
]

export const mockTrips: Trip[] = [
  {
    id: "trip1",
    busId: "bus1",
    route: "Bole - Merkato",
    from: "Bole",
    to: "Merkato",
    time: "14:30",
    date: "Today",
    status: "active",
    ticketNumber: "T123456",
    seatNumber: "12A",
    price: 50,
  },
  {
    id: "trip2",
    busId: "bus2",
    route: "CMC - Piassa",
    from: "CMC",
    to: "Piassa",
    time: "16:00",
    date: "Tomorrow",
    status: "upcoming",
    ticketNumber: "T123457",
    seatNumber: "8B",
    price: 45,
  },
  {
    id: "trip3",
    busId: "bus3",
    route: "Ayat - Mexico",
    from: "Ayat",
    to: "Mexico",
    time: "09:00",
    date: "Yesterday",
    status: "completed",
    ticketNumber: "T123458",
    seatNumber: "15C",
    price: 55,
  },
]
