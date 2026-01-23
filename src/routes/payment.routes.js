import express from "express"
import {
  initiatePayment,
  paymentCallback,
  getPaymentHistory,
} from "../controllers/payment.controller.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

// Initiate a new payment (top-up wallet or direct) => this will work after deployment
router.post("/initiate", initiatePayment)

// Callback from payment gateway (webhook) => this will work after deployment
router.post("/callback", paymentCallback)

// Get user payment history
router.get("/history", getPaymentHistory)

export default router
