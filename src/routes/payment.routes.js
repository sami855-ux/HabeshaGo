import express from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import {
  createPaymentSchema,
  verifyPaymentSchema,
  refundPaymentSchema,
} from "../schemas/payment.schema.js";
import { zodValidate } from "../middlewares/zodValidate.js";

const router = express.Router();

router.post("/", zodValidate(createPaymentSchema), PaymentController.create);
router.post(
  "/verify",
  zodValidate(verifyPaymentSchema),
  PaymentController.verify
);
router.post(
  "/refund",
  zodValidate(refundPaymentSchema),
  PaymentController.refund
);

export default router;
