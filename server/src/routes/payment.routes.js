import express from "express"
import {
  initiatePayment,
  paymentCallback,
  getPaymentHistory,
  topUpMpesa,
  mpesaCallback,
} from "../controllers/payment.controller.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

// Initiate a new payment (top-up wallet or direct) => this will work after deployment
router.post("/initiate", initiatePayment)

// Callback from payment gateway (webhook) => this will work after deployment
router.post("/callback", paymentCallback)

// Get user payment history
router.get("/history", getPaymentHistory)

// Mepesa
router.post("/mpesa/topup", topUpMpesa)
router.post("/mpesa/callback", mpesaCallback)

//Telebirr
// router.post("/telebirr/topup", authenticate, topUpTelebirr);
// router.post("/telebirr/callback", telebirrCallback);

export default router
