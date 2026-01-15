import express from "express"
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  updateVehicle,
  getVehicleStats,
} from "../controllers/vehicle.controller.js"

const router = express.Router()

// Create a new vehicle
router.post("/", createVehicle)

// Get all vehicles
router.get("/", getAllVehicles)

// Update a vehicle by ID
router.put("/:id", updateVehicle)

// Delete a vehicle by ID
router.delete("/:id", deleteVehicle)

//satas
router.get("/stats", getVehicleStats)

export default router
