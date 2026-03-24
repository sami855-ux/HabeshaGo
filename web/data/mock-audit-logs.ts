import { AuditLog, AuditAction, EntityType } from "@/types/audit-log"

import {
  ChargingSession,
  ChartDataPoint,
  StationPerformance,
} from "@/types/charging"

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

export const generateMockSessions = (): ChargingSession[] => {
  const stations = [
    "Central Station",
    "North Hub",
    "South Park",
    "East Plaza",
    "West End",
  ]
  const chargers = ["DC-001", "DC-002", "AC-101", "AC-102", "DC-003"]
  const users = [
    "Tesla Model 3",
    "Nissan Leaf",
    "Ford Mustang",
    "BMW i4",
    "VW ID.4",
  ]
  const names = ["John D.", "Sarah M.", "Mike R.", "Emma W.", "David L."]

  return Array.from({ length: 50 }, (_, i) => {
    const status =
      Math.random() > 0.7
        ? "in_progress"
        : Math.random() > 0.8
          ? "failed"
          : "completed"
    const startTime = new Date(Date.now() - Math.random() * 86400000 * 7)
    const endTime = new Date(startTime.getTime() + Math.random() * 3600000 * 2)
    const durationHours = (endTime.getTime() - startTime.getTime()) / 3600000

    return {
      id: `session-${i}`,
      sessionId: `SESS-${String(i + 1000).padStart(4, "0")}`,
      stationName: stations[Math.floor(Math.random() * stations.length)],
      chargerId: chargers[Math.floor(Math.random() * chargers.length)],
      userName: `${names[Math.floor(Math.random() * names.length)]} - ${users[Math.floor(Math.random() * users.length)]}`,
      vehicleModel: users[Math.floor(Math.random() * users.length)],
      startTime: startTime.toISOString(),
      endTime: status === "in_progress" ? "In Progress" : endTime.toISOString(),
      duration:
        status === "in_progress"
          ? "45 min"
          : `${Math.round(durationHours * 10) / 10} hrs`,
      energyDelivered: Math.round(Math.random() * 50 * 10) / 10,
      revenue: Math.round(Math.random() * 25 * 10) / 10,
      status: status as "completed" | "in_progress" | "failed",
    }
  })
}

export const generateTrendData = (): ChartDataPoint[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const revenue = Math.round((Math.random() * 1500 + 500) * 10) / 10
    const energy = Math.round((Math.random() * 2000 + 800) * 10) / 10

    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      revenue,
      energy,
      sessions: Math.floor(Math.random() * 25 + 10),
      peakDemand: Math.floor(Math.random() * 12 + 3),
      avgCostPerKwh: Number((revenue / energy).toFixed(2)),
    }
  })
}

export const generateStationPerformance = (): StationPerformance[] => {
  const stations = [
    "Central Station",
    "North Hub",
    "South Park",
    "East Plaza",
    "West End",
  ]

  return stations.map((station) => ({
    stationName: station,
    sessions: Math.floor(Math.random() * 150 + 50),
    revenue: Math.floor(Math.random() * 5000 + 1000),
    energy: Math.floor(Math.random() * 8000 + 2000),
    utilization: Math.floor(Math.random() * 40 + 40),
  }))
}
