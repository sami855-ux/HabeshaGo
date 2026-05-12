import express from "express"
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  getReservationsByVehicle,
  getReservationsByPoint,
  getReservationsByUser,
  getManagerPayments,
  verifyCharger,
} from "../controllers/evReservations.controller.js"
import { authenticate } from "../middlewares/authenticate.js"
import { paymentCallbackController } from "../controllers/booking.controller.js"

const router = express.Router()

router.post("/callback", paymentCallbackController)
router.get("/callback", paymentCallbackController)

router.post("/verify", authenticate, verifyCharger)

// CRUD
router.post("/", createReservation)
router.get("/", getAllReservations)

// Manager payment history (all stations they manage)
router.get("/manager/payments", authenticate, getManagerPayments)

router.get("/:id", getReservationById)
router.put("/:id", updateReservation)
router.delete("/:id", deleteReservation)

// Nested routes
router.get("/vehicles/:id", getReservationsByVehicle)
router.get("/points/:id", getReservationsByPoint)
router.get("/users/:id", getReservationsByUser)

export default router
