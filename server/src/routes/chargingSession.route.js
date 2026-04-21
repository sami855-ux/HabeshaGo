import express from "express"
import {
  startSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
  getSessionsByVehicle,
  getSessionsByStation,
  getSessionsByUser,
  getManagerStationsSessions,
} from "../controllers/chargingSession.controller.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

// CRUD for charging sessions
router.post("/", startSession) // start a session
router.get("/", getAllSessions) // get all sessions
//For manager
router.get("/manager", authenticate, getManagerStationsSessions)

router.get("/:id", getSessionById) // get session by id
router.put("/:id", updateSession) // update session / end session
router.delete("/:id", deleteSession) // optional: cancel session

// Nested routes
router.get("/vehicles/:id", getSessionsByVehicle) // sessions for a vehicle
router.get("/stations/:id", getSessionsByStation) // sessions for a station
router.get("/users/:id", getSessionsByUser) // sessions for a user

export default router
