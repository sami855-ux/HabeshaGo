import prisma from "../prisma/client.js"
import {
  createPromoCodeService,
  applyPromoCodeService,
} from "../services/promoCode.service.js"
import { errorResponse, successResponse } from "../utils/apiResponse.js"

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
      userId: req.user.id,
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

export const getPromoCodes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", isActive, type } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    const where = {
      ...(search && {
        code: { contains: search, mode: "insensitive" },
      }),
      ...(isActive !== undefined && {
        isActive: isActive === "true",
      }),
      ...(type && { type }),
    }

    const [promoCodes, total] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.promoCode.count({ where }),
    ])

    // ── Enrich each promo code with computed fields ───────────────────────────
    const data = promoCodes.map((promo) => {
      const usagePercent = promo.maxUsage
        ? parseFloat(((promo.usedCount / promo.maxUsage) * 100).toFixed(1))
        : null

      const isExpired = promo.expiresAt
        ? new Date(promo.expiresAt) < new Date()
        : false

      const remainingUsage = promo.maxUsage
        ? promo.maxUsage - promo.usedCount
        : null

      return {
        id: promo.id,
        code: promo.code,
        type: promo.type, // PERCENT | FIXED
        value: promo.value,
        maxUsage: promo.maxUsage,
        usedCount: promo.usedCount,
        remainingUsage,
        usagePercent,
        minAmount: promo.minAmount,
        expiresAt: promo.expiresAt,
        isActive: promo.isActive,
        isExpired,
        createdAt: promo.createdAt,
        updatedAt: promo.updatedAt,
      }
    })

    const response = successResponse("Promo codes fetched successfully", {
      data,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    })
    return res.status(response.statusCode).json(response)
  } catch (error) {
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}

export const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params
    const { type, value, maxUsage, minAmount, expiresAt, isActive } = req.body

    const existing = await prisma.promoCode.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      const response = errorResponse("Promo code not found", 404)
      return res.status(response.statusCode).json(response)
    }

    const updated = await prisma.promoCode.update({
      where: { id: parseInt(id) },
      data: {
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value }),
        ...(maxUsage !== undefined && { maxUsage }),
        ...(minAmount !== undefined && { minAmount }),
        ...(expiresAt !== undefined && { expiresAt: new Date(expiresAt) }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    const response = successResponse("Promo code updated successfully", updated)
    return res.status(response.statusCode).json(response)
  } catch (error) {
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}

export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params

    const existing = await prisma.promoCode.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing) {
      const response = errorResponse("Promo code not found", 404)
      return res.status(response.statusCode).json(response)
    }

    await prisma.promoCode.delete({ where: { id: parseInt(id) } })

    const response = successResponse("Promo code deleted successfully", null)
    return res.status(response.statusCode).json(response)
  } catch (error) {
    const response = errorResponse(error.message, 500)
    return res.status(response.statusCode).json(response)
  }
}
