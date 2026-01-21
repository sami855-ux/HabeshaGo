import express from "express"
import {
  transferFunds,
  payFromWallet,
  getTransactionHistory,
} from "../controllers/transaction.controller.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

// Wallet-to-wallet transfer
router.post("/transfer", authenticate, transferFunds)

// Pay from wallet
router.post("/pay", authenticate, payFromWallet)

// Get internal wallet transaction history
router.get("/history", authenticate, getTransactionHistory)

export default router
