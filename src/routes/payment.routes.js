import express from "express"
import {
  initiatePayment,
  paymentCallback,
  getPaymentHistory,
} from "../controllers/payment.controller.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

// Initiate a new payment (top-up wallet or direct)
router.post("/initiate", authenticate, initiatePayment)

// Callback from payment gateway (webhook)
router.post("/callback", paymentCallback)

// Get user payment history
router.get("/history", authenticate, getPaymentHistory)

export default router
