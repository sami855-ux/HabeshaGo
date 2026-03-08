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
router.get("/me", authenticate, getMyNotifications)
router.get("/unread-count", authenticate, getUnreadCount)

// update read status
router.patch("/:id/read", authenticate, markAsRead)
router.patch("/read-all", authenticate, markAllAsRead)

// delete
router.delete("/:id", authenticate, deleteNotification)

export default router
