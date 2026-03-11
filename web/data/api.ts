import { EVStation, ParkingStation } from "@/types/map-user"

// Mock API functions - replace with real API calls
export async function fetchEVStations(
  lat: number,
  lng: number,
  radius: number = 5,
): Promise<EVStation[]> {
  // Simulate API call
  return [
    {
      id: "ev1",
      name: "Central EV Charging Hub",
      address: "123 Main Street",
      location: { lat: lat + 0.01, lng: lng + 0.01 },
      chargingType: "fast",
      availableChargers: 3,
      totalChargers: 8,
    },
    {
      id: "ev2",
      name: "Green Energy Station",
      address: "456 Oak Avenue",
      location: { lat: lat - 0.008, lng: lng + 0.012 },
      chargingType: "standard",
      availableChargers: 2,
      totalChargers: 4,
    },
    {
      id: "ev3",
      name: "Supercharger Plaza",
      address: "789 Electric Blvd",
      location: { lat: lat + 0.015, lng: lng - 0.01 },
      chargingType: "fast",
      availableChargers: 6,
      totalChargers: 12,
    },
  ]
}

export async function fetchParkingStations(
  lat: number,
  lng: number,
  radius: number = 5,
): Promise<ParkingStation[]> {
  return [
    {
      id: "park1",
      name: "City Center Parking",
      address: "321 Parking Lane",
      location: { lat: lat + 0.005, lng: lng - 0.005 },
      availableSpaces: 45,
      totalSpaces: 200,
      pricing: "$2/hour",
    },
    {
      id: "park2",
      name: "Market Street Garage",
      address: "654 Market Street",
      location: { lat: lat - 0.01, lng: lng + 0.008 },
      availableSpaces: 12,
      totalSpaces: 150,
      pricing: "$3/hour",
    },
    {
      id: "park3",
      name: "Transit Center Parking",
      address: "987 Transit Way",
      location: { lat: lat + 0.012, lng: lng + 0.015 },
      availableSpaces: 78,
      totalSpaces: 300,
      pricing: "$1.50/hour",
    },
  ]
}
