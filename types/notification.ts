// types/notification.ts
export enum NotificationType {
  SYSTEM = "SYSTEM",
  BOOKING = "BOOKING",
  PAYMENT = "PAYMENT",
  ROUTE = "ROUTE",
  BUS = "BUS",
  WALLET = "WALLET",
  ALERT = "ALERT",
}

export interface Notification {
  id: number
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  readAt?: Date | null
  actionUrl?: string | null
  metadata?: Record<string, any> | null
  createdAt: Date
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedNotifications {
  notifications: Notification[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Query parameter types
export interface NotificationFilters {
  isRead?: boolean
  type?: NotificationType
  startDate?: Date
  endDate?: Date
  limit?: number
  page?: number
}
