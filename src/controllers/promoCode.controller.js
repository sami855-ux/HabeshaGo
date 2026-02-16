import {
  createPromoCodeService,
  applyPromoCodeService,
} from "../services/promoCode.service.js"

// Create a new promo code
export const createPromoCode = async (req, res) => {
  try {
    const result = await createPromoCodeService(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Create promo code controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while creating promo code",
      data: null,
    })
  }
}

// Apply a promo code
export const applyPromoCode = async (req, res) => {
  try {
    const { code, totalAmount } = req.body
    const result = await applyPromoCodeService({
      userId: req.user.id, // assumes auth middleware sets req.user
      code,
      totalAmount,
    })
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Apply promo code controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while applying promo code",
      data: null,
    })
  }
}
