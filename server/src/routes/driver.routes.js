import express from "express"
import {
  createDriver,
  getDriverById,
  getAllDrivers,
  updateDriver,
  verifyDriverDocuments,
  assignVehicleToDriver,
  toggleDutyStatus,
  blockDriver,
} from "../controllers/driver.controller.js"
import { authenticate, requireAdmin } from "../middlewares/authenticate.js"
import { upload } from "../config/multer.js"

const router = express.Router()

// Create driver profile (admin)
router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.fields([
    { name: "driverLicense", maxCount: 1 },
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
  ]),
  createDriver,
)

// Get drivers
router.get("/", getAllDrivers)
router.get("/:id", authenticate, getDriverById)

// Update driver basic info
router.put("/:id", authenticate, requireAdmin, updateDriver)

// Verify / reject documents
router.post("/:id/verify", authenticate, requireAdmin, verifyDriverDocuments)

// Assign vehicle
router.post(
  "/:id/assign-vehicle",
  authenticate,
  requireAdmin,
  assignVehicleToDriver,
)

// Driver on/off duty
router.post("/:id/duty", authenticate, toggleDutyStatus)

// Block / unblock driver
router.post("/:id/block", authenticate, requireAdmin, blockDriver)

export default router
