import express from "express"
import {
  initiatePayment,
  paymentCallback,
  getPaymentHistory,
  topUpMpesa,
  mpesaCallback,
  telebirrPaymentCallback,
  payForParking,
} from "../controllers/payment.controller.js"

import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

// =============================
// GENERAL PAYMENT (CHAPA / WALLET)
// =============================
router.post("/initiate", authenticate, initiatePayment)

router.post("/telebirr/callback", telebirrPaymentCallback)

// webhook (NO auth - external gateway)
router.post("/callback", paymentCallback)

// =============================
// PAYMENT HISTORY
// =============================
router.get("/history", authenticate, getPaymentHistory)

// =============================
// PARKING PAYMENT (NEW ⭐)
// =============================
router.post("/parking/pay", authenticate, payForParking)

// =============================
// M-PESA
// =============================
router.post("/mpesa/topup", authenticate, topUpMpesa)

// webhook (NO auth - M-Pesa server)
router.post("/mpesa/callback", mpesaCallback)

// =============================
// TELEBIRR (future ready)
// =============================
// router.post("/telebirr/topup", authenticate, topUpTelebirr)
// router.post("/telebirr/callback", telebirrCallback)

export default router
