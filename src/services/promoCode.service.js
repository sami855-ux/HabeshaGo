import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

// Create promo code
export const createPromoCodeService = async ({
  code,
  type,
  value,
  maxUsage,
  minAmount,
  expiresAt,
  isActive = true,
}) => {
  try {
    const existing = await prisma.promoCode.findUnique({ where: { code } })
    if (existing) {
      return errorResponse(`Promo code "${code}" already exists`, 400)
    }

    const promo = await prisma.promoCode.create({
      data: { code, type, value, maxUsage, minAmount, expiresAt, isActive },
    })

    return successResponse("Promo code created successfully", promo, 201)
  } catch (error) {
    console.error("Create promo code service error:", error)
    return errorResponse("Failed to create promo code", 500)
  }
}

// Apply promo code
export const applyPromoCodeService = async ({ userId, code, totalAmount }) => {
  try {
    const promo = await prisma.promoCode.findUnique({ where: { code } })
    if (!promo || !promo.isActive) {
      return errorResponse("Promo code not found or inactive", 404)
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return errorResponse("Promo code has expired", 400)
    }

    if (promo.minAmount && totalAmount < promo.minAmount) {
      return errorResponse(
        `Minimum order amount for this promo is ${promo.minAmount}`,
        400,
      )
    }

    if (promo.maxUsage && promo.usedCount >= promo.maxUsage) {
      return errorResponse("Promo code usage limit reached", 400)
    }

    // Calculate discount
    const discount =
      promo.type === "PERCENT" ? (totalAmount * promo.value) / 100 : promo.value

    return successResponse("Promo code applied successfully", {
      code: promo.code,
      discount,
      promoId: promo.id,
    })
  } catch (error) {
    console.error("Apply promo code service error:", error)
    return errorResponse("Failed to apply promo code", 500)
  }
}
