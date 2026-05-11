export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  availableSlots: number;
  totalSlots: number;
  distance: string;
  pricePerHour: number;
}

export interface Slot {
  id: string;
  number: string;
  status: "available" | "occupied" | "reserved";
  type: "standard" | "compact" | "ev" | "disabled";
}

export interface Booking {
  id: string;
  lotId: string;
  slotId: string;
  startTime?: string;
  endTime?: string;
  cost?: number;
}
