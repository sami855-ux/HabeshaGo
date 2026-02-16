import express from "express"
import {
  applyPromoCode,
  createPromoCode,
} from "../controllers/promoCode.controller.js"

const router = express.Router()

// Apply promo code
router.post("/apply", applyPromoCode)

// Create new promo code
router.post("/create", createPromoCode)

export default router
