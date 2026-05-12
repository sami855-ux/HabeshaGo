import { ParkingLot, Slot } from "./type";

export const mockParkingLots: ParkingLot[] = [
  {
    id: "1",
    name: "Downtown Plaza Parking",
    address: "123 Market St, San Francisco, CA",
    lat: 37.7849,
    lng: -122.4094,
    availableSlots: 24,
    totalSlots: 50,
    distance: "0.3 mi",
    pricePerHour: 5.0,
  },
  {
    id: "2",
    name: "Bay Area Garage",
    address: "456 Mission St, San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    availableSlots: 8,
    totalSlots: 30,
    distance: "0.5 mi",
    pricePerHour: 4.5,
  },
  {
    id: "3",
    name: "Union Square Lot",
    address: "789 Geary St, San Francisco, CA",
    lat: 37.7879,
    lng: -122.4075,
    availableSlots: 15,
    totalSlots: 40,
    distance: "0.7 mi",
    pricePerHour: 6.0,
  },
];

export const mockSlots: Slot[] = [
  { id: "1", number: "A1", status: "available", type: "standard" },
  { id: "2", number: "A2", status: "occupied", type: "standard" },
  { id: "3", number: "A3", status: "available", type: "compact" },
  { id: "4", number: "A4", status: "reserved", type: "standard" },
  { id: "5", number: "B1", status: "available", type: "ev" },
  { id: "6", number: "B2", status: "available", type: "standard" },
  { id: "7", number: "B3", status: "occupied", type: "standard" },
  { id: "8", number: "B4", status: "available", type: "disabled" },
  { id: "9", number: "C1", status: "available", type: "standard" },
  { id: "10", number: "C2", status: "available", type: "standard" },
  { id: "11", number: "C3", status: "occupied", type: "compact" },
  { id: "12", number: "C4", status: "available", type: "standard" },
];

export const walletBalance = 150.0;

export function getParkingLotById(id: string): ParkingLot | undefined {
  return mockParkingLots.find((lot) => lot.id === id);
}

export function getSlotById(id: string): Slot | undefined {
  return mockSlots.find((slot) => slot.id === id);
}
