import express from "express";
import {
  createPoint,
  getAllPoints,
  getPointById,
  updatePoint,
  deletePoint,
  getSessionPoints,
  getReservationPoints
} from "../controllers/chargingPoints.controller.js";

const router = express.Router();

// CRUD routes
router.post("/", createPoint);        // create charging point
router.get("/", getAllPoints);        // get all charging points
router.get("/:id", getPointById);    // get charging point by id
router.put("/:id", updatePoint);     // update charging point
router.delete("/:id", deletePoint);  // delete charging point

// Nested routes => after the web integarted 
router.get("/sessions/:id/points", getSessionPoints);      // points used in a session
router.get("/reservations/:id/points", getReservationPoints);  // points for a reservation

export default router;