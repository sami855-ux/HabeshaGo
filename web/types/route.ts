export interface Route {
  id: number
  name: string
  origin: string
  destination: string
  distanceKm: number | null
  estimatedTimeMin: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  midPoints: MidPoint[]
  busCount: number
  minibusCount: number
}

export interface MidPoint {
  id: number
  name: string
  lat: number
  lng: number
  routeId: number
}

export interface CreateRouteDto {
  name: string
  origin: string
  destination: string
  distanceKm?: number | null
  estimatedTimeMin?: number | null
  isActive?: boolean
  midPoints?: Omit<MidPoint, "id" | "routeId">[]
}

export interface UpdateRouteDto extends Partial<CreateRouteDto> {}
