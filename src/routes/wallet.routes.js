import express from "express";
import { WalletController } from "../controllers/wallet.controller.js";
import {
  createWalletSchema,
  depositWalletSchema,
} from "../schemas/wallet.schema.js";
import { zodValidate } from "../middlewares/zodValidate.js";

const router = express.Router();

router.post(
  "/create",
  zodValidate(createWalletSchema),
  WalletController.create
);
router.post(
  "/deposit",
  zodValidate(depositWalletSchema),
  WalletController.deposit
);
router.get("/:userId", WalletController.get);
router.get("/:userId/transactions", WalletController.transactions);

export default router;
