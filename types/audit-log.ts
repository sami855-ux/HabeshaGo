import { UserRole } from "./user"

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  VERIFY = "VERIFY",
  REJECT = "REJECT",
  ACTIVATE = "ACTIVATE",
  DEACTIVATE = "DEACTIVATE",
  DELETE = "DELETE",
}

export enum EntityType {
  DRIVER = "DRIVER",
  VEHICLE = "VEHICLE",
  BUS = "BUS",
  USER = "USER",
  WALLET = "WALLET",
}

export interface AuditLog {
  id: string
  action: AuditAction
  entityType: EntityType
  entityId: string
  actorId?: string
  actorRole?: UserRole
  targetUserId?: string
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  reason?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}
