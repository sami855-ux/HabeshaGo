import express from "express"
import {
  applyPromoCode,
  createPromoCode,
  deletePromoCode,
  getPromoCodes,
  updatePromoCode,
} from "../controllers/promoCode.controller.js"
import { authenticate, restrictTo } from "../middlewares/authenticate.js"

const router = express.Router()

// Apply promo code
router.post("/apply", authenticate, applyPromoCode)

// Create new promo code
router.post("/create", authenticate, restrictTo("ADMIN"), createPromoCode)

router.get("/", authenticate, restrictTo("ADMIN"), getPromoCodes)
router.patch("/:id", authenticate, restrictTo("ADMIN"), updatePromoCode)
router.delete("/:id", authenticate, restrictTo("ADMIN"), deletePromoCode)

export default router
