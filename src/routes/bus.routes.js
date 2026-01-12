import express from "express"
import {
  createBus,
  findAllBuses,
  findBus,
  updateBus,
  assignDriver,
  updateStatus,
  removeBus,
  getSeatAvailability,
  recordPosition,
  searchBuses,
} from "../controllers/bus.controller.js"

import {
  createBusSchema,
  updateBusSchema,
  assignDriverSchema,
  updateStatusSchema,
  recordPositionSchema,
} from "../schemas/bus.schema.js"

const router = express.Router()

// Validation middleware
const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json(parsed.error)
  req.body = parsed.data
  next()
}

// Routes
router.post("/", validate(createBusSchema), createBus)
// Search buses by start/end points
// /buses/search?start=Main%20Station&end=University%20Stop
router.get("/search", searchBuses)
router.get("/", findAllBuses)
router.get("/:id", findBus)

router.patch("/:id", validate(updateBusSchema), updateBus)
router.patch("/:id/assign-driver", validate(assignDriverSchema), assignDriver)
router.patch("/:id/status", validate(updateStatusSchema), updateStatus)
router.delete("/:id", removeBus)

// Special routes
router.get("/:id/availability", getSeatAvailability)
router.post("/:id/position", validate(recordPositionSchema), recordPosition)

export default router
