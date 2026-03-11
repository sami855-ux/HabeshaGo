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

// lib/mock-data.ts
export const mockTicketData = {
  id: "TKT-123456",
  bookingId: "BK-789012",
  route: {
    origin: "Addis Ababa",
    destination: "Bahir Dar",
    distance: "565 km",
  },
  bus: {
    name: "Ethio Bus 505",
    operator: "Ethio Bus",
  },
  date: "2024-03-25",
  departureTime: "06:30 AM",
  seatNumber: "12A",
  boardingStop: "Megenagna Bus Terminal, Addis Ababa",
  alightingStop: "Bahir Dar Bus Station",
  bookingCode: "ETB-7890-ABCD",
  status: "confirmed",
}

export const mockUsers = [
  {
    id: "1",
    name: "Abebe Kebede",
    phone: "+251912345678",
    avatar: "/avatars/1.png",
    email: "abebe.k@example.com",
    friends: true,
  },
  {
    id: "2",
    name: "Tigist Hailu",
    phone: "+251923456789",
    avatar: "/avatars/2.png",
    email: "tigist.h@example.com",
    friends: true,
  },
  {
    id: "3",
    name: "Dawit Mekonnen",
    phone: "+251934567890",
    avatar: "/avatars/3.png",
    email: "dawit.m@example.com",
    friends: false,
  },
  {
    id: "4",
    name: "Meron Alemu",
    phone: "+251945678901",
    avatar: "/avatars/4.png",
    email: "meron.a@example.com",
    friends: true,
  },
  {
    id: "5",
    name: "Henok Tesfaye",
    phone: "+251956789012",
    avatar: "/avatars/5.png",
    email: "henok.t@example.com",
    friends: false,
  },
]
