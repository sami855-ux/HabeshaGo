import express from "express"
import {
  getMyWallet,
  getWalletTransactions,
  createWallet,
  enableWalletBiometric,
  changeWalletPin,
} from "../controllers/wallet.controller.js"
import { authenticate } from "../middlewares/authenticate.js"
import { verifyWalletPin } from "../controllers/transaction.controller.js"

const router = express.Router()

// Wallet info
router.get("/me", authenticate, getMyWallet)

// Verify wallet
router.post("/verify-pin", authenticate, verifyWalletPin)

// Wallet transactions
router.get("/transactions", getWalletTransactions)

// Create wallet + PIN
router.post("/create", authenticate, createWallet)

// Enable biometric
router.post("/biometric", authenticate, enableWalletBiometric)

//Change pin
router.patch("/change-pin", authenticate, changeWalletPin)

export default router
