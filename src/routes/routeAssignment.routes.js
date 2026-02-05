import express from "express"
import {
  assignBusToRoute,
  removeBusFromRoute,
  getRouteBuses,
  assignMinibusToRoute,
  removeMinibusFromRoute,
  getRouteMinibuses,
} from "../controllers/routeAssignment.controller.js"

const router = express.Router()

// buses
router.post("/:routeId/buses/:busId", assignBusToRoute)
router.delete("/:routeId/buses/:busId", removeBusFromRoute)
router.get("/:routeId/buses", getRouteBuses)

// minibuses
router.post("/:routeId/minibuses/:minibusId", assignMinibusToRoute)
router.delete("/:routeId/minibuses/:minibusId", removeMinibusFromRoute)
router.get("/:routeId/minibuses", getRouteMinibuses)

export default router
