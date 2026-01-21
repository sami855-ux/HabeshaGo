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
      423
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

export const getWalletTransactionsService = async (userId) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!wallet) {
      return errorResponse("Wallet not found", 404)
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
    })

    return successResponse(
      "Wallet transactions retrieved successfully",
      transactions,
      200
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

    if (!pin || pin.length < 4) {
      return errorResponse("PIN is required and must be at least 4 digits", 400)
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
  { biometricToken }
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
