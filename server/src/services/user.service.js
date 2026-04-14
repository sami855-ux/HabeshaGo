import { uploadToCloudinary } from "./cloudinary.service.js"
import { verifyPassword } from "./password.service.js"
import { sendOTP } from "./otp.service.js"
import prisma from "../prisma/client.js"

import { errorResponse, successResponse } from "../utils/apiResponse.js"
import { ADMIN_WALLET_ID } from "../utils/constants.js"

export const updateProfileService = async (userId, data, avatarFile) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  if (!user) throw new Error("User not found")

  let avatarUrl = user.avaterUrl

  if (avatarFile) {
    avatarUrl = await uploadToCloudinary(avatarFile.buffer, "habeshaGo/avatars")
  }

  // 🚫 Protect sensitive fields
  delete data.role
  delete data.isSuspended
  delete data.emailVerified
  delete data.phoneVerified
  delete data.googleId
  delete data.appleId

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      avaterUrl: avatarUrl,
    },
  })
}

export const sendOtpService = async (user, type) => {
  // reuse your existing OTP sender
  await sendOTP(user, type)
}

export const verifyOtpService = async (user, code, channel) => {
  console.log(user, code)
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      used: false,
    },
    orderBy: { createdAt: "desc" },
  })

  if (!otp) throw new Error("OTP not found")

  if (otp.expiresAt < new Date()) {
    throw new Error("OTP has expired")
  }

  if (otp.attempts >= otp.maxAttempts) {
    throw new Error("Too many attempts")
  }

  const isValid = await verifyPassword(code, otp.codeHash)

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: {
      attempts: { increment: 1 },
      used: isValid,
    },
  })

  if (!isValid) {
    throw new Error("Invalid OTP")
  }

  // mark verification on user
  if (channel === "email") {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })
  }

  if (channel === "phone") {
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true },
    })
  }

  return true
}

export const getUsersByPhoneService = async (phone) => {
  const users = await prisma.user.findMany({
    where: phone
      ? {
          phone: {
            contains: phone, // allows partial search
            mode: "insensitive",
          },
        }
      : {},
    select: {
      id: true,
      name: true,
      phone: true,
      phoneVerified: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Format response exactly as requested
  return users.map((user) => ({
    id: user.id,
    name: user.name ?? "Unknown",
    phone: user.phone,
    isVerified: user.phoneVerified,
  }))
}

export const getFormattedPassengersService = async () => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "PASSENGER",
        isDeleted: false,
        isSuspended: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avaterUrl: true,
        emailVerified: true,
        location: true,
      },
    })

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avaterUrl || null,
      emailVerified: user.emailVerified,
      location: user.location,
    }))

    return successResponse(
      "Passengers retrieved successfully",
      formattedUsers,
      200,
    )
  } catch (error) {
    console.error("Get passengers error:", error)
    return errorResponse("Failed to fetch passengers", 500)
  }
}

/**
 * GET /api/admin/finance/revenue-overview
 * Returns overall revenue, total commission, provider payouts, admin wallet balance, etc.
 */
export const getRevenueOverview = async (req, res) => {
  try {
    // 1️⃣ Total revenue from all bookings
    const totalRevenueResult = await prisma.transactionLedger.aggregate({
      _sum: { totalAmount: true },
      where: { status: "COMPLETED" },
    })

    const totalRevenue = totalRevenueResult._sum.totalAmount || 0

    // 2️⃣ Total commission earned by admin
    const totalCommissionResult = await prisma.transactionLedger.aggregate({
      _sum: { commission: true },
      where: { status: "COMPLETED" },
    })

    const totalCommission = totalCommissionResult._sum.commission || 0

    // 3️⃣ Total provider payout
    const totalProviderResult = await prisma.transactionLedger.aggregate({
      _sum: { providerAmount: true },
      where: { status: "COMPLETED" },
    })

    const totalProviderPayout = totalProviderResult._sum.providerAmount || 0

    // 4️⃣ Admin wallet balance
    const adminWallet = await prisma.wallet.findUnique({
      where: { id: ADMIN_WALLET_ID },
    })

    const adminWalletBalance = adminWallet?.balance || 0

    // 5️⃣ Total bookings
    const totalBookings = await prisma.booking.count()

    // 6️⃣ Active users
    const activeUsers = await prisma.user.count({
      where: { role: "PASSENGER" }, // Or any active users criteria
    })

    return res.json(
      successResponse("Revenue overview fetched successfully", {
        totalRevenue,
        totalCommission,
        totalProviderPayout,
        adminWalletBalance,
        totalBookings,
        activeUsers,
      }),
    )
  } catch (err) {
    console.error("Revenue overview error:", err)
    return res
      .status(500)
      .json(errorResponse("Failed to fetch revenue overview", 500))
  }
}

export const getDailyRevenue = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30
    const today = new Date()
    const startDate = new Date()
    startDate.setDate(today.getDate() - days + 1)

    const dailyRevenueRaw = await prisma.transactionLedger.groupBy({
      by: ["createdAt"],
      where: { status: "COMPLETED", createdAt: { gte: startDate } },
      _sum: { totalAmount: true },
    })

    const dailyRevenue = dailyRevenueRaw.map((item) => ({
      date: item.createdAt.toISOString().split("T")[0],
      revenue: item._sum.totalAmount || 0,
    }))

    return res.json(
      successResponse("Daily revenue fetched successfully", dailyRevenue),
    )
  } catch (err) {
    console.error("Daily revenue error:", err)
    return res
      .status(500)
      .json(errorResponse("Failed to fetch daily revenue", 500))
  }
}

export const getProviderRevenue = async (req, res) => {
  try {
    const revenueByProvider = await prisma.transactionLedger.groupBy({
      by: ["providerId"],
      where: { status: "COMPLETED" },
      _sum: { providerAmount: true, commission: true },
    })

    const result = await Promise.all(
      revenueByProvider.map(async (item) => {
        const provider = await prisma.user.findUnique({
          where: { id: item.providerId },
        })
        return {
          providerId: item.providerId,
          name: provider?.name || "Unknown",
          revenue: item._sum.providerAmount || 0,
          commission: item._sum.commission || 0,
        }
      }),
    )

    return res.json(
      successResponse("Provider revenue fetched successfully", result),
    )
  } catch (err) {
    console.error("Provider revenue error:", err)
    return res
      .status(500)
      .json(errorResponse("Failed to fetch provider revenue", 500))
  }
}

/**
 * 2️⃣ Daily Revenue for last N days
 */
export const getDailyRevenueService = async (days = 30) => {
  try {
    const today = new Date()
    const startDate = new Date()
    startDate.setDate(today.getDate() - days + 1)

    const dailyRevenueRaw = await prisma.transactionLedger.groupBy({
      by: ["createdAt"],
      where: { status: "COMPLETED", createdAt: { gte: startDate } },
      _sum: { totalAmount: true },
    })

    const dailyRevenue = dailyRevenueRaw.map((item) => ({
      date: item.createdAt.toISOString().split("T")[0],
      revenue: item._sum.totalAmount || 0,
    }))

    return successResponse("Daily revenue fetched successfully", dailyRevenue)
  } catch (err) {
    console.error("Daily revenue service error:", err)
    return errorResponse("Failed to fetch daily revenue", 500)
  }
}

/**
 * 3️⃣ Revenue & Commission per provider
 */
export const getProviderRevenueService = async () => {
  try {
    const revenueByProvider = await prisma.transactionLedger.groupBy({
      by: ["providerId"],
      where: { status: "COMPLETED" },
      _sum: { providerAmount: true, commission: true },
    })

    const result = await Promise.all(
      revenueByProvider.map(async (item) => {
        const provider = await prisma.user.findUnique({
          where: { id: item.providerId },
        })
        return {
          providerId: item.providerId,
          name: provider?.name || "Unknown",
          revenue: item._sum.providerAmount || 0,
          commission: item._sum.commission || 0,
        }
      }),
    )

    return successResponse("Provider revenue fetched successfully", result)
  } catch (err) {
    console.error("Provider revenue service error:", err)
    return errorResponse("Failed to fetch provider revenue", 500)
  }
}
