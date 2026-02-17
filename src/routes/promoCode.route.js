import express from "express"
import {
  applyPromoCode,
  createPromoCode,
} from "../controllers/promoCode.controller.js"
import { authenticate } from "../middlewares/authenticate.js"

const router = express.Router()

// Apply promo code
router.post("/apply", authenticate, applyPromoCode)

// Create new promo code
router.post("/create", authenticate, createPromoCode)

export default router
