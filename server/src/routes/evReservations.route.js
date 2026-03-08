import express from "express";
import { createReservation, getAllReservations, getReservationById, updateReservation, deleteReservation, getReservationsByVehicle, getReservationsByPoint, getReservationsByUser } from "../controllers/evReservations.controller.js";

const router = express.Router();

// CRUD
router.post("/", createReservation);
router.get("/", getAllReservations);
router.get("/:id", getReservationById);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);

// Nested routes
router.get("/vehicles/:id", getReservationsByVehicle);
router.get("/points/:id", getReservationsByPoint);
router.get("/users/:id", getReservationsByUser);

export default router;