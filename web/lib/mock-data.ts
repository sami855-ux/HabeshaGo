import { faker } from "@faker-js/faker"
import type { User } from "@/types/user"
import type { Bus } from "@/types/bus"

export const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => {
  const role = i < 5 ? "ADMIN" : i < 15 ? "DRIVER" : "PASSENGER"
  const isSuspended = i % 10 === 0
  const emailVerified = Math.random() > 0.2
  const phoneVerified = Math.random() > 0.3
  const twoFactorEnabled = role === "ADMIN" || Math.random() > 0.7

  return {
    id: `user_${faker.string.uuid().slice(0, 8)}`,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    image: Math.random() > 0.5 ? faker.image.avatar() : null,
    role,
    emailVerified,
    phoneVerified,
    twoFactorEnabled,
    isSuspended,
    suspendedAt: isSuspended ? faker.date.recent().toISOString() : null,
    suspendedBy: isSuspended
      ? i < 5
        ? "system"
        : faker.person.fullName()
      : null,
    suspensionReason: isSuspended ? faker.lorem.sentence() : null,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    wallet: {
      id: i + 1,
      balance: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
      currency: "USD",
    },
    bookings: Array.from(
      { length: faker.number.int({ min: 0, max: 5 }) },
      (_, j) => ({
        id: j + 1,
        status: faker.helpers.arrayElement([
          "PENDING",
          "CONFIRMED",
          "CANCELLED",
          "COMPLETED",
        ]),
        createdAt: faker.date.recent().toISOString(),
      }),
    ),
    minibusReservations:
      role === "PASSENGER"
        ? Array.from(
            { length: faker.number.int({ min: 0, max: 3 }) },
            (_, j) => ({
              id: j + 1,
              seat: faker.number.int({ min: 1, max: 20 }),
              date: faker.date.future().toISOString(),
              status: faker.helpers.arrayElement([
                "PENDING",
                "CONFIRMED",
                "CANCELLED",
              ]),
            }),
          )
        : [],
    parkingReservations:
      role === "DRIVER"
        ? Array.from(
            { length: faker.number.int({ min: 0, max: 2 }) },
            (_, j) => ({
              id: j + 1,
              slotNumber: faker.number.int({ min: 1, max: 50 }),
              startTime: faker.date.recent().toISOString(),
              endTime: faker.date.soon().toISOString(),
            }),
          )
        : [],
    sessions: Array.from(
      { length: faker.number.int({ min: 1, max: 3 }) },
      (_, j) => ({
        id: `session_${faker.string.uuid()}`,
        expiresAt: faker.date.future().toISOString(),
        createdAt: faker.date.recent().toISOString(),
      }),
    ),
    accounts: [
      {
        id: `account_${faker.string.uuid()}`,
        provider: "credentials",
        providerAccountId: faker.string.uuid(),
      },
    ],
  }
})

export const generateBuses = (count: number): Bus[] => {
  const routes = [
    "101",
    "102",
    "103",
    "104",
    "105",
    "106",
    "107",
    "108",
    "201",
    "202",
  ]
  const stops = [
    "Central Station",
    "Downtown Terminal",
    "North Gate",
    "East Mall",
    "West Terminal",
    "South Plaza",
    "University",
    "Airport",
    "General Hospital",
    "Shopping Center",
    "Tech Park",
    "Sports Arena",
  ]

  const driverNames = [
    "John Smith",
    "Maria Garcia",
    "Robert Johnson",
    "Sarah Williams",
    "David Brown",
    "Lisa Davis",
    "Michael Wilson",
    "Emily Taylor",
    "James Martinez",
    "Jennifer Anderson",
  ]

  const buses: Bus[] = []

  for (let i = 1; i <= count; i++) {
    const status: Bus["status"] = faker.helpers.weightedArrayElement([
      { weight: 7, value: "ACTIVE" },
      { weight: 2, value: "UNDER_MAINTENANCE" },
      { weight: 1, value: "OUT_OF_SERVICE" },
    ])

    const hasDriver = faker.datatype.boolean(0.7)
    const hasRoute = faker.datatype.boolean(0.85)
    const routeIndex = faker.number.int({ min: 0, max: routes.length - 1 })
    const stopIndex = faker.number.int({ min: 0, max: stops.length - 1 })
    const nextStopIndex = (stopIndex + 1) % stops.length
    const driverIndex = faker.number.int({
      min: 0,
      max: driverNames.length - 1,
    })

    buses.push({
      id: i,
      busNumber: `BUS-${faker.string.alphanumeric(6).toUpperCase()}`,
      capacity: faker.helpers.arrayElement([40, 45, 50, 55, 60]),
      status,
      driverId: hasDriver ? faker.string.uuid() : undefined,
      driverName: hasDriver ? driverNames[driverIndex] : undefined,
      routeId: hasRoute
        ? faker.number.int({ min: 1, max: routes.length })
        : undefined,
      routeName: hasRoute ? routes[routeIndex] : undefined,
      currentStop: stops[stopIndex],
      nextDestination: stops[nextStopIndex],
      isActive: status === "ACTIVE",
      isDeleted: false,
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    })
  }

  return buses
}

// Generate initial data
export const dummyBuses = generateBuses(35)

export interface BusDetails {
  id: string
  routeName: string
  routeId: string
  driverName: string
  driverPhone: string
  capacity: number
  passengersCount: number
  speed: number
  fuelLevel: number
  lastMaintenance: string
  nextStop: string
  estimatedArrival: string
  status: "on-time" | "delayed" | "early"
}

export const fetchBusDetails = async (busId: string): Promise<BusDetails> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data for different buses
  const mockBusData: Record<string, BusDetails> = {
    BUS001: {
      id: "BUS001",
      routeName: "Express A",
      routeId: "RTE-101",
      driverName: "John Smith",
      driverPhone: "+1 (555) 123-4567",
      capacity: 50,
      passengersCount: 32,
      speed: 45,
      fuelLevel: 78,
      lastMaintenance: "2024-03-15",
      nextStop: "Central Station",
      estimatedArrival: "5 min",
      status: "on-time",
    },
    BUS002: {
      id: "BUS002",
      routeName: "City Loop B",
      routeId: "RTE-102",
      driverName: "Sarah Johnson",
      driverPhone: "+1 (555) 234-5678",
      capacity: 40,
      passengersCount: 28,
      speed: 35,
      fuelLevel: 62,
      lastMaintenance: "2024-03-10",
      nextStop: "Market Square",
      estimatedArrival: "8 min",
      status: "delayed",
    },
    BUS003: {
      id: "BUS003",
      routeName: "Airport Shuttle",
      routeId: "RTE-103",
      driverName: "Mike Wilson",
      driverPhone: "+1 (555) 345-6789",
      capacity: 60,
      passengersCount: 45,
      speed: 55,
      fuelLevel: 45,
      lastMaintenance: "2024-03-12",
      nextStop: "Airport Terminal",
      estimatedArrival: "12 min",
      status: "on-time",
    },
  }

  // Return mock data or default if bus not found
  return (
    mockBusData[busId] || {
      id: busId,
      routeName: "Local Route",
      routeId: "RTE-000",
      driverName: "Unknown",
      driverPhone: "N/A",
      capacity: 40,
      passengersCount: 20,
      speed: 30,
      fuelLevel: 50,
      lastMaintenance: "N/A",
      nextStop: "Unknown",
      estimatedArrival: "N/A",
      status: "on-time",
    }
  )
}
