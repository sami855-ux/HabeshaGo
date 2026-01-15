import { Router } from "express"
import {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = Router()

// system/admin creates notification
router.post("/", createNotification)

// user reads notifications
router.get("/:id", getMyNotifications)
router.get("/unread-count", getUnreadCount)

// update read status
router.patch("/:id/read", markAsRead)
router.patch("/read-all", markAllAsRead)

// delete
router.delete("/:id", authenticate, deleteNotification)

export default router
