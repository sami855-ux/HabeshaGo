export type Role = "DRIVER" | "PARKING_OPERATOR" | "EV_OPERATOR" | "STAFF"
export type Status = "ACTIVE" | "OFFLINE" | "SUSPENDED"

export interface Operator {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  role: Role
  assignment: string
  status: Status
  createdAt: string
  licenseNumber?: string
  assignedBus?: string
  assignedRoute?: string
  assignedParkingArea?: string
  shift?: string
  assignedChargingStation?: string
  chargerType?: string
}
