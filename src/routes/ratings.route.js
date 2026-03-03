import express from "express";
import { createRating, updateRating, deleteRating, getStationRatings, getUserRatings } from "../controllers/rating.controller.js";
// import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// CRUD
router.post("/", createRating);
router.put("/:id", updateRating);
router.delete("/:id", deleteRating);

// Nested routes
router.get("/stations/:id", getStationRatings);
router.get("/users/:id", getUserRatings);

export default router;