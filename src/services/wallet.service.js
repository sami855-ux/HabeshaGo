import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import bcrypt from "bcrypt"

const SALT_ROUNDS = 10
const MAX_ATTEMPTS = 3

// Helper: Verify wallet PIN + biometric
export const verifyWalletAuth = async (wallet, { pin, biometricToken }) => {
  if (wallet.isLocked) {
    return errorResponse(
      "Wallet is locked due to multiple failed attempts",
      423,
    )
  }

  // Biometric check first
  if (wallet.biometricEnabled && biometricToken) {
    if (wallet.biometricToken === biometricToken) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { pinAttempts: 0 },
      })
      return { success: true }
    }
  }

  // PIN fallback
  if (!pin) return errorResponse("PIN required if biometric not provided", 400)

  const isValid = await bcrypt.compare(pin, wallet.pinHash)
  if (!isValid) {
    const attempts = wallet.pinAttempts + 1
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { pinAttempts: attempts, isLocked: attempts >= MAX_ATTEMPTS },
    })
    return errorResponse("Invalid wallet PIN", 401)
  }

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { pinAttempts: 0 },
  })

  return { success: true }
}

export const getMyWalletService = async (userId) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return errorResponse("Wallet not found", 404)
    }

    return successResponse("Wallet retrieved successfully", wallet, 200)
  } catch (error) {
    console.error("Error fetching wallet:", error)
    return errorResponse("Failed to fetch wallet", 500)
  }
}

export const getWalletTransactionsService = async (
  userId,
  page = 1,
  limit = 15,
) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!wallet) {
      return errorResponse("Wallet not found", 404)
    }

    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ])

    // 🔹 Map Prisma data → mock API shape
    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      walletId: tx.walletId,
      amount: tx.amount.toString(),
      type: tx.type,
      status: tx.status,
      balanceAfter: tx.balanceAfter.toString(),
      reference: tx.reference,
      description:
        tx.description ||
        `${tx.type}`.charAt(0).toUpperCase() +
          `${tx.type}`.slice(1).toLowerCase() +
          " transaction",
      metadata: tx.metadata,
      createdAt: tx.createdAt.toISOString(),
    }))

    return successResponse(
      "Wallet transactions retrieved successfully",
      {
        transactions: formattedTransactions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      200,
    )
  } catch (error) {
    console.error("Error fetching wallet transactions:", error)
    return errorResponse("Failed to fetch wallet transactions", 500)
  }
}

export const createWalletService = async (userId, { pin }) => {
  try {
    // Check if wallet exists
    const existingWallet = await prisma.wallet.findUnique({ where: { userId } })
    if (existingWallet) return errorResponse("Wallet already exists", 409)

    if (!pin || pin.length < 6) {
      return errorResponse("PIN is required and must be at 6 digits", 400)
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, SALT_ROUNDS)

    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: "ETB",
        pinHash,
        pinAttempts: 0,
        isLocked: false,
        isActive: true,
        biometricEnabled: false,
      },
    })

    return successResponse("Wallet created successfully", wallet, 201)
  } catch (error) {
    console.error("Error creating wallet:", error)
    return errorResponse("Failed to create wallet", 500)
  }
}

export const enableWalletBiometricService = async (
  userId,
  { biometricToken },
) => {
  try {
    // Find wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) return errorResponse("Wallet not found", 404)

    if (!biometricToken)
      return errorResponse("Biometric token is required", 400)

    // Update wallet with biometric info
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        biometricEnabled: true,
        biometricToken, // store token (hashed or device-specific) for security
      },
    })

    return successResponse("Biometric enabled successfully", updatedWallet)
  } catch (error) {
    console.error("Error enabling biometric:", error)
    return errorResponse("Failed to enable biometric", 500)
  }
}

export const changeWalletPinService = async (userId, newPin) => {
  try {
    // Find wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!wallet) {
      return errorResponse("Wallet not found", 404)
    }

    // Hash new PIN
    const pinHash = await bcrypt.hash(newPin, SALT_ROUNDS)

    // Update wallet PIN
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        pinHash,
      },
    })

    return successResponse(
      "Wallet PIN changed successfully",
      updatedWallet,
      200,
    )
  } catch (error) {
    console.error("Change wallet PIN service error:", error)
    return errorResponse("Failed to change wallet PIN", 500)
  }
}
