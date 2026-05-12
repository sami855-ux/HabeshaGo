import express from "express";
import {
  getMyWallet,
  getWalletTransactions,
  createWallet,
  enableWalletBiometric,
  changeWalletPin,
  deductPoints,
  deductFromWallet,
  payParkingSession,
  depositToWallet// 🚀 NEW
} from "../controllers/wallet.controller.js";

import { authenticate } from "../middlewares/authenticate.js";
import { verifyWalletPin } from "../controllers/transaction.controller.js";

const router = express.Router();

// ========================
// WALLET CORE
// ========================

// Get wallet
router.get("/me", authenticate, getMyWallet);

//Deduct wallet balance
router.post("/balance/deduct", authenticate, deductFromWallet)

//Deduct point
router.post("/deduct", authenticate, deductPoints)

// Wallet transactions
router.get("/transactions", authenticate, getWalletTransactions)
// Create wallet
router.post("/create", authenticate, createWallet);

// Change PIN
router.patch("/change-pin", authenticate, changeWalletPin);

// Enable biometric
router.post("/biometric", authenticate, enableWalletBiometric);

// ========================
// SECURITY
// ========================

// Verify PIN
router.post("/verify-pin", authenticate, verifyWalletPin);

// ========================
// TRANSACTIONS
// ========================

router.post("/deposit", authenticate, depositToWallet);

// Wallet transactions (FIXED: add auth)
router.get("/transactions", authenticate, getWalletTransactions);

// Deduct wallet balance (generic)
router.post("/balance/deduct", authenticate, deductFromWallet);

// Deduct points
router.post("/deduct", authenticate, deductPoints);

// ========================
// 🚀 PARKING PAYMENT (NEW)
// ========================

// Pay parking session using wallet
router.post("/parking/pay", authenticate, payParkingSession);

export default router;
