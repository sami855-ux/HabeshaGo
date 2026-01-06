export class SeatAvailabilityDto {
  busId!: number;
  date?: string; // ISO
  capacity?: number;
  occupiedSeats?: number[];
  freeSeats?: number[];
}
