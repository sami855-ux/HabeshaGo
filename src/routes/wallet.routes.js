import express from "express";
import { WalletController } from "../controllers/wallet.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { zodValidate } from "../middlewares/zodValidate.js";
import { depositWalletSchema } from "../schemas/wallet.schema.js";

const router = express.Router();

// Get my wallet
router.get("/me", authenticate, WalletController.getMyWallet);

// Deposit (external)
router.post(
  "/deposit",
  authenticate,
  zodValidate(depositWalletSchema),
  WalletController.deposit
);

// Get transactions
router.get("/transactions", authenticate, WalletController.transactions);

export default router;
