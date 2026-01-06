export class BusResponseDto {
  id!: number;
  busNumber?: string;
  capacity?: number;
  status?: string;
  driverId?: number | null;
  routeId?: number | null;
  currentStop?: string | null;
  nextDestination?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
