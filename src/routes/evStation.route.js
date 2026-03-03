import express from "express"
import {
  createStation,
  deleteStation,
  getAllStations,
  getStationById,
  getStationPoints,
  getStationRatings,
  getStationSessions,
  updateStation,
} from "../controllers/evStation.controller.js"
import { upload } from "../config/multer.js"
const router = express.Router()

// CRUD for stations
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "documents", maxCount: 10 },
  ]),
  createStation
) // create
router.get("/", getAllStations) // get all
router.get("/:id", getStationById) // get by id
router.put("/:id", updateStation) // update
router.delete("/:id", deleteStation) // delete

// Get charging points by type or availability query: ?connectorType=CCS&status=AVAILABLE
// router.get("/stations/:id/points");

// Nested routes => After defining the station routes from the web
router.get("/:id/points", getStationPoints) // all points of a station
router.get("/:id/sessions", getStationSessions) // all sessions of a station
router.get("/:id/ratings", getStationRatings) // all ratings of a station

export default router
