import { AuditLog, AuditAction, EntityType } from "@/types/audit-log"

export enum UserRole {
  ADMIN = "ADMIN",
  PASSENGER = "PASSENGER",
  DRIVER = "DRIVER",
}

export function generateMockAuditLogs(count: number = 50): AuditLog[] {
  const actions = Object.values(AuditAction)
  const entities = Object.values(EntityType)
  const roles = Object.values(UserRole)
  const reasons = [
    "System auto-update",
    "Manual verification",
    "Compliance requirement",
    "User request",
    "Data correction",
    "Security audit",
    "Batch processing",
    "System maintenance",
  ]

  const logs: AuditLog[] = []

  for (let i = 0; i < count; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)]
    const entityType = entities[Math.floor(Math.random() * entities.length)]
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))
    date.setHours(Math.floor(Math.random() * 24))
    date.setMinutes(Math.floor(Math.random() * 60))

    logs.push({
      id: `log_${i + 1000}`,
      action,
      entityType,
      entityId: `${entityType.toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
      actorId: `user_${Math.floor(Math.random() * 100)}`,
      actorRole: roles[Math.floor(Math.random() * roles.length)],
      targetUserId:
        Math.random() > 0.5
          ? `target_${Math.floor(Math.random() * 100)}`
          : undefined,
      oldValue:
        Math.random() > 0.3
          ? {
              status: "pending",
              data: { field: "old_value" },
            }
          : undefined,
      newValue:
        Math.random() > 0.3
          ? {
              status: "active",
              data: { field: "new_value" },
            }
          : undefined,
      reason:
        Math.random() > 0.2
          ? reasons[Math.floor(Math.random() * reasons.length)]
          : undefined,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent:
        Math.random() > 0.5
          ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
          : undefined,
      createdAt: date,
    })
  }

  return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}
