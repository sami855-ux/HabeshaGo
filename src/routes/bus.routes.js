import express from "express"
import {
  createBus,
  getAllBuses,
  getBusById,
  updateBus,
  deleteBus,
  toggleBusStatus,
  createBusSchedule,
  bulkCreateBusSchedules,
  getBusSchedules,
  updateBusSchedule,
  deleteBusSchedule,
  searchBuses,
  getRouteMidPointsController,
  getAllMidPointsController,
} from "../controllers/bus.controller.js"

const router = express.Router()

// Create a new bus
// POST /api/buses
router.post("/", createBus)

// Get all buses
// GET /api/buses
router.get("/", getAllBuses)

/* ------------------ SEARCH BUS ------------------ */

// Search buses by origin, destination, date, time, passengers
// GET /api/buses/search?origin=Addis%20Ababa&destination=Bahir%20Dar&passengers=3&date=2026-02-01&time=14:00
router.get("/search", searchBuses)

//Get all the midpoints
// GET /api/buses/midpoints
router.get("/midpoints", getAllMidPointsController)

// Get a single bus by ID
// GET /api/buses/:busId
router.get("/:busId", getBusById)

// Update a bus by ID
// PUT /api/buses/:busId
router.put("/:busId", updateBus)

// Delete a bus by ID
// DELETE /api/buses/:busId
router.delete("/:busId", deleteBus)

// Activate or deactivate a bus
// PATCH /api/buses/:busId/status
router.patch("/:busId/status", toggleBusStatus)

router.get("/route/:routeId/midpoints", getRouteMidPointsController)

/* ------------------ BUS SCHEDULE ------------------ */

// Create a schedule for a bus
// POST /api/buses/:busId/schedules
router.post("/:busId/schedules", createBusSchedule)

// Bulk create schedules for a bus
// POST /api/buses/:busId/schedules/bulk
router.post("/:busId/schedules/bulk", bulkCreateBusSchedules)

// Get all schedules of a specific bus
// GET /api/buses/:busId/schedules
router.get("/:busId/schedules", getBusSchedules)

// Update a bus schedule by schedule ID
// PUT /api/bus-schedules/:scheduleId
router.put("/schedules/:scheduleId", updateBusSchedule)

// Delete a bus schedule by schedule ID
// DELETE /api/bus-schedules/:scheduleId
router.delete("/schedules/:scheduleId", deleteBusSchedule)

export default router
