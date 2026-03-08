import { success } from "zod"
import prisma from "../prisma/client.js"
import { emitToUserNotification } from "../socket/index.js"

/**
 * Create a notification (used internally by system/admin/services)
 */
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, actionUrl, metadata } = req.body

    if (!userId || !title || !message || !type) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        actionUrl,
        metadata,
      },
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })

    // 3️⃣ Emit real-time event
    emitToUserNotification(userId, {
      notification,
      unreadCount,
    })

    res.status(201).json({ notification, success: true })
  } catch (error) {
    console.error("Create notification error:", error)
    res
      .status(500)
      .json({ message: "Failed to create notification", success: false })
  }
}

export const createNotificationService = async ({
  userId,
  title,
  message,
  type,
  actionUrl = null,
  metadata = null,
}) => {
  if (!userId || !title || !message || !type) {
    throw new Error("Missing required fields")
  }

  // 1️⃣ Create notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      actionUrl,
      metadata,
    },
  })

  // 2️⃣ Get updated unread count
  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })

  // 3️⃣ Emit real-time event
  emitToUserNotification(userId, {
    notification,
    unreadCount,
  })

  return notification
}

/**
 * Get all notifications for logged-in user
 */
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    res.json({
      notifications,
      success: true,
      message: "Notifications fetched successfully",
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({ message: "Failed to fetch notifications" })
  }
}

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })

    res.json({ unreadCount: count })
  } catch (error) {
    console.error("Unread count error:", error)
    res.status(500).json({ message: "Failed to fetch unread count" })
  }
}

/**
 * Mark one notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const notification = await prisma.notification.updateMany({
      where: {
        id: Number(id),
        userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    if (notification.count === 0) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Mark as read error:", error)
    res.status(500).json({ message: "Failed to update notification" })
  }
}

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Mark all as read error:", error)
    res.status(500).json({ message: "Failed to update notifications" })
  }
}

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const deleted = await prisma.notification.deleteMany({
      where: {
        id: Number(id),
        userId,
      },
    })

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json({ message: "Notification deleted" })
  } catch (error) {
    console.error("Delete notification error:", error)
    res.status(500).json({ message: "Failed to delete notification" })
  }
}
