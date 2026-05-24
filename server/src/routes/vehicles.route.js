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
  getUserVehicles,
  getVehicleIds,
} from "../controllers/vehicle.controller.js"
import { upload } from "../config/multer.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

// Static routes first (before any /:id)
router.post("/", upload.single("image"), createVehicle)
router.post("/location", updateVehicleLocation)
router.get("/user-vehicles", authenticate, getUserVehicles)
router.get("/ids", getVehicleIds) // ← before /:id
router.get("/stats", getVehicleStats) // ← before /:id

//  Dynamic routes after
router.get("/:id", getVehicleById)
router.get("/", getAllVehicles)
router.put("/:id", updateVehicle)
router.delete("/:id", deleteVehicle)
router.patch("/:id/status", updateVehicleStatus)
router.patch("/:id/mileage", updateVehicleMileage)
router.post("/:id/assign-driver", assignDriver)
router.patch("/:id/unassign-driver", unassignDriver)

export default router
