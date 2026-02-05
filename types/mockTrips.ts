import { Trip } from "./trips"

const mockTrips: Trip[] = [
  {
    id: "1",
    originCity: "Addis Ababa",
    destinationCity: "Bahir Dar",
    departureTime: "2024-03-20T08:00:00Z",
    arrivalTime: "2024-03-20T14:00:00Z",
    busName: "Selam Bus",
    seatNumber: "12A",
    price: 850,
    status: "UPCOMING",
  },
  {
    id: "2",
    originCity: "Addis Ababa",
    destinationCity: "Hawassa",
    departureTime: "2024-03-18T07:30:00Z",
    arrivalTime: "2024-03-18T12:00:00Z",
    busName: "Sky Bus",
    seatNumber: "08B",
    price: 650,
    status: "COMPLETED",
  },
  {
    id: "3",
    originCity: "Addis Ababa",
    destinationCity: "Gondar",
    departureTime: "2024-03-25T10:00:00Z",
    arrivalTime: "2024-03-25T18:00:00Z",
    busName: "Ethio Bus",
    seatNumber: "15C",
    price: 1200,
    status: "UPCOMING",
  },
  {
    id: "4",
    originCity: "Addis Ababa",
    destinationCity: "Dire Dawa",
    departureTime: "2024-03-15T09:00:00Z",
    arrivalTime: "2024-03-15T17:00:00Z",
    busName: "Selam Bus",
    seatNumber: "05A",
    price: 950,
    status: "CANCELLED",
  },
  {
    id: "5",
    originCity: "Addis Ababa",
    destinationCity: "Mekelle",
    departureTime: "2024-03-22T06:00:00Z",
    arrivalTime: "2024-03-22T20:00:00Z",
    busName: "Sky Bus",
    seatNumber: "21D",
    price: 1500,
    status: "UPCOMING",
  },
  {
    id: "6",
    originCity: "Addis Ababa",
    destinationCity: "Jimma",
    departureTime: "2024-03-10T08:30:00Z",
    arrivalTime: "2024-03-10T14:30:00Z",
    busName: "Ethio Bus",
    seatNumber: "11B",
    price: 550,
    status: "COMPLETED",
  },
]

export async function fetchTrips(): Promise<Trip[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  return Promise.resolve(mockTrips)
}

// Helper function to check if a trip is too close to departure (within 2 hours)
export function isTooCloseToDeparture(departureTime: string): boolean {
  const departure = new Date(departureTime)
  const now = new Date()
  const diffInHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60)
  return diffInHours < 2
}
