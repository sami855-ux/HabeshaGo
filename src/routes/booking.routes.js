import express from "express";
import { BookingController } from "../controllers/booking.controller.js";
import { createBookingSchema } from "../schemas/booking.schema.js";
import { zodValidate } from "../middlewares/zodValidate.js";

const router = express.Router();

router.post("/", zodValidate(createBookingSchema), BookingController.create);
router.get("/user/:userId", BookingController.getUserBookings);

export default router;
