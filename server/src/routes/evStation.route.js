import express from "express"
import {
  bulkCreatePoints,
  createStation,
  deleteStation,
  getAllStations,
  getMyStations,
  getStationById,
  getStationPoints,
  getStationRatings,
  getStationSessions,
  updateStation,
} from "../controllers/evStation.controller.js"
import { upload } from "../config/multer.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

// CRUD for stations
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "documents", maxCount: 10 },
  ]),
  authenticate,
  createStation,
) // create
router.get("/ev-manager", authenticate, getMyStations)
//Get all points for all station for a manager
router.get("/points", authenticate, getStationPoints)
router.get("/", getAllStations) // get all
router.get("/:id", getStationById) // get by id
router.put("/:id", updateStation) // update
router.delete("/:id", deleteStation) // delete

// Get charging points by type or availability query: ?connectorType=CCS&status=AVAILABLE
// router.get("/stations/:id/points");

// Bulk operations routes
router.post("/bulk", bulkCreatePoints) // create multiple charging points
// router.put("/bulk", bulkUpdatePoints);         // update multiple charging points
// router.delete("/bulk", bulkDeletePoints);      // delete multiple charging points

// Nested routes => After defining the station routes from the web
router.get("/:id/sessions", getStationSessions) // all sessions of a station
router.get("/:id/ratings", getStationRatings) // all ratings of a station

export default router
