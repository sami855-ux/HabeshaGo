import { addHours, addDays } from "date-fns"

export interface Bus {
  id: number
  busNumber: string
  capacity: number
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE"
  routeId: number
  currentStop?: string
  nextDestination?: string
  isActive: boolean
  departureTime: Date
  estimatedArrival: Date
  delayMinutes: number
  reservedSeats: number
  availableSeats: number
  lastServiceDate?: Date
  nextServiceDate?: Date
  vehicleId: number
  route: Route
  seats: Seat[]
  vehicle: Vehicle
  driver?: Driver
}

export interface Seat {
  id: number
  busId: number
  seatNumber: string
  category: "NORMAL" | "ELDERLY" | "DISABLED"
  isReserved: boolean
}

export interface Vehicle {
  id: number
  type: "BUS" | "MINIBUS" | "COASTER"
  model: string
  plateNumber: string
  capacity: number
  manufacturer: string
  year: number
  status: "ACTIVE" | "MAINTENANCE"
}

export interface Route {
  id: number
  name: string
  origin: string
  destination: string
  distanceKm: number
  estimatedTimeMin: number
  midPoints: RouteMidPoint[]
}

export interface RouteMidPoint {
  id: number
  routeId: number
  name: string
  lat: number
  lng: number
}

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  phone: string
  yearsOfExperience: number
  profileImage?: string
}

// Mock cities for search
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

// Mock data
const mockVehicles: Vehicle[] = [
  {
    id: 1,
    type: "BUS",
    model: "Yutong ZK6128H",
    plateNumber: "3-AA-1234",
    capacity: 45,
    manufacturer: "Yutong",
    year: 2022,
    status: "ACTIVE",
  },
  {
    id: 2,
    type: "BUS",
    model: "Golden Dragon XML6125",
    plateNumber: "3-BB-5678",
    capacity: 50,
    manufacturer: "Golden Dragon",
    year: 2021,
    status: "ACTIVE",
  },
  {
    id: 3,
    type: "COASTER",
    model: "Toyota Coaster",
    plateNumber: "3-CC-9012",
    capacity: 30,
    manufacturer: "Toyota",
    year: 2020,
    status: "ACTIVE",
  },
]

const mockRoutes: Route[] = [
  {
    id: 1,
    name: "Addis-Bahir Dar Express",
    origin: "Addis Ababa",
    destination: "Bahir Dar",
    distanceKm: 578,
    estimatedTimeMin: 480,
    midPoints: [
      { id: 1, routeId: 1, name: "Debre Berhan", lat: 9.6814, lng: 39.5336 },
      { id: 2, routeId: 1, name: "Debre Sina", lat: 9.8472, lng: 39.7606 },
      { id: 3, routeId: 1, name: "Debre Markos", lat: 10.3333, lng: 37.7333 },
    ],
  },
  {
    id: 2,
    name: "Addis-Mekelle Highway",
    origin: "Addis Ababa",
    destination: "Mekelle",
    distanceKm: 783,
    estimatedTimeMin: 600,
    midPoints: [
      { id: 4, routeId: 2, name: "Debre Berhan", lat: 9.6814, lng: 39.5336 },
      { id: 5, routeId: 2, name: "Dessie", lat: 11.1272, lng: 39.6361 },
      { id: 6, routeId: 2, name: "Woldia", lat: 11.8293, lng: 39.5961 },
    ],
  },
  {
    id: 3,
    name: "Addis-Hawassa Scenic",
    origin: "Addis Ababa",
    destination: "Gondar",
    distanceKm: 275,
    estimatedTimeMin: 240,
    midPoints: [
      { id: 7, routeId: 3, name: "Mojo", lat: 8.5869, lng: 39.1211 },
      { id: 8, routeId: 3, name: "Ziway", lat: 7.9333, lng: 38.7167 },
    ],
  },
]

const mockDrivers: Driver[] = [
  {
    id: "DRV001",
    name: "Alemayehu Kebede",
    licenseNumber: "ET-123456",
    phone: "+251911223344",
    yearsOfExperience: 8,
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alemayehu",
  },
  {
    id: "DRV002",
    name: "Selamawit Assefa",
    licenseNumber: "ET-789012",
    phone: "+251922334455",
    yearsOfExperience: 5,
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Selamawit",
  },
]

const generateSeats = (busId: number, capacity: number): Seat[] => {
  const seats: Seat[] = []
  const rows = Math.ceil(capacity / 4)

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= 4; col++) {
      const seatNumber = `${String.fromCharCode(64 + row)}${col}`
      const seatId = (busId - 1) * capacity + (row - 1) * 4 + col

      if (seatId <= busId * capacity) {
        // Randomly assign some seats as reserved
        const isReserved = Math.random() > 0.7
        // Random category
        const categories: ("NORMAL" | "ELDERLY" | "DISABLED")[] = [
          "NORMAL",
          "NORMAL",
          "NORMAL",
          "ELDERLY",
          "DISABLED",
        ]
        const category =
          categories[Math.floor(Math.random() * categories.length)]

        seats.push({
          id: seatId,
          busId,
          seatNumber,
          category,
          isReserved,
        })
      }
    }
  }

  return seats.slice(0, capacity)
}

const now = new Date()

export const mockBuses: Bus[] = [
  {
    id: 1,
    busNumber: "ET-101",
    capacity: 45,
    status: "ACTIVE",
    routeId: 1,
    currentStop: "Addis Ababa",
    nextDestination: "Debre Berhan",
    isActive: true,
    departureTime: addHours(now, 2),
    estimatedArrival: addHours(now, 10),
    delayMinutes: 0,
    reservedSeats: 12,
    availableSeats: 33,
    lastServiceDate: addDays(now, -15),
    nextServiceDate: addDays(now, 15),
    vehicleId: 1,
    route: mockRoutes[0],
    seats: generateSeats(1, 45),
    vehicle: mockVehicles[0],
    driver: mockDrivers[0],
  },
  {
    id: 2,
    busNumber: "ET-202",
    capacity: 50,
    status: "ACTIVE",
    routeId: 2,
    currentStop: "Addis Ababa",
    nextDestination: "Debre Berhan",
    isActive: true,
    departureTime: addHours(now, 4),
    estimatedArrival: addHours(now, 14),
    delayMinutes: 15,
    reservedSeats: 25,
    availableSeats: 25,
    lastServiceDate: addDays(now, -30),
    nextServiceDate: addDays(now, 30),
    vehicleId: 2,
    route: mockRoutes[1],
    seats: generateSeats(2, 50),
    vehicle: mockVehicles[1],
    driver: mockDrivers[1],
  },
  {
    id: 3,
    busNumber: "ET-303",
    capacity: 30,
    status: "ACTIVE",
    routeId: 3,
    currentStop: "Addis Ababa",
    nextDestination: "Mojo",
    isActive: true,
    departureTime: addHours(now, 1),
    estimatedArrival: addHours(now, 5),
    delayMinutes: 5,
    reservedSeats: 8,
    availableSeats: 22,
    lastServiceDate: addDays(now, -7),
    nextServiceDate: addDays(now, 23),
    vehicleId: 3,
    route: mockRoutes[2],
    seats: generateSeats(3, 30),
    vehicle: mockVehicles[2],
    driver: mockDrivers[0],
  },
]

// Helper functions
export const searchBuses = async (
  from: string,
  to: string,
  date: Date,
  passengers: number,
): Promise<Bus[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log(from, to, date, passengers)
  // Filter buses based on route and capacity
  return mockBuses.filter(
    (bus) =>
      bus.route.origin.toLowerCase().includes(from.toLowerCase()) &&
      bus.route.destination.toLowerCase().includes(to.toLowerCase()),
    // bus.availableSeats >= passengers &&
    // new Date(bus.departureTime).toDateString() === date.toDateString(),
  )
}

export const getBusDetails = async (
  busId: number,
): Promise<Bus | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockBuses.find((bus) => bus.id === busId)
}
