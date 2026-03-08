import express from "express"
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  updateVehicle,
  getVehicleStats,
  updateVehicleStatus,
  updateVehicleMileage,
  assignDriver,
  unassignDriver,
  getVehicleById,
  updateVehicleLocation,
} from "../controllers/vehicle.controller.js"

const router = express.Router()

// Create a new vehicle
router.post("/", createVehicle)

//Get a vehicle by Id
router.get("/:id", getVehicleById)

// Get all vehicles
router.get("/", getAllVehicles)

// Update a vehicle by ID
router.put("/:id", updateVehicle)

// Delete a vehicle by ID
router.delete("/:id", deleteVehicle)

//satas
router.get("/stats", getVehicleStats)

/* ---------------- STATUS ---------------- */
router.patch("/:id/status", updateVehicleStatus)
router.patch("/:id/mileage", updateVehicleMileage)

/* ---------------- DRIVER ---------------- */
router.post("/:id/assign-driver", assignDriver)
router.patch("/:id/unassign-driver", unassignDriver)

//Save gps LOcation
router.post("/location", updateVehicleLocation)

export default router
