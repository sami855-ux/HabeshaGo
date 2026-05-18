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
  getFormattedDrivers,
  getCurrentTrip,
  startTrip,
  endTrip,
  updateLocation,
  checkInPassenger,
  getDriverTripHistory,
  getDriverBusWithSchedules,
} from "../controllers/driver.controller.js"
import { authenticate, requireAdmin, restrictTo } from "../middlewares/authenticate.js"
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


// Get formatted drivers data
router.get("/formatted-drivers", getFormattedDrivers)

router.get("/trips/history", getDriverTripHistory)

/**
 * GET /api/trips/current
 * Get the driver's currently active trip + latest position
*/
router.get("/current", getCurrentTrip);

router.post("/check-in", checkInPassenger);

router.get("/bus-with-schedules", getDriverBusWithSchedules)

/**
 * POST /api/trips/start
 * Body: { busId: number, scheduleId?: number }
*/
router.post("/start", startTrip);

/**
 * POST /api/trips/end
 * Body: { busId: number }
 */
router.post("/end", endTrip);
 
/**
 * PATCH /api/trips/:busId/location
 * Body: { latitude, longitude, speed?, heading?, accuracy? }
 * Called every few seconds from the driver's device GPS
 */
router.patch("/:busId/location", updateLocation);

//Get A single drivers
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
