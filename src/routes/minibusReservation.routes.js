import express from "express";
import {
  createReservation,
  getUserReservations,
  confirmReservationPayment,
  cancelReservation,
} from "../controllers/minibusReservation.controller.js";
import {
  createReservationSchema,
  confirmPaymentSchema,
} from "../schemas/minibusReservation.schema.js";

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ error: err.errors });
  }
};

router.post("/", validate(createReservationSchema), createReservation);
router.post("/pay", validate(confirmPaymentSchema), confirmReservationPayment);
router.get("/user/:userId", getUserReservations);
router.delete("/:id", cancelReservation);

export default router;
