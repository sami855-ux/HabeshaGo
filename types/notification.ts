export interface Notification {
  id: number
  userId: string
  title: string
  message: string
  type: "BOOKING" | "PAYMENT" | "SYSTEM" | "ALERT" | "INFO"
  isRead: boolean
  readAt: string | null
  actionUrl: string | null
  metadata: any
  createdAt: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}
