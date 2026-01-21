import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

//  Wallet-to-Wallet Transfer
export const transferFundsService = async (
  senderId,
  { recipientId, amount, pin }
) => {
  try {
    if (!recipientId || !amount || amount <= 0)
      return errorResponse("Invalid transfer data", 400)

    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: senderId },
    })
    const recipientWallet = await prisma.wallet.findUnique({
      where: { userId: recipientId },
    })

    if (!senderWallet) return errorResponse("Sender wallet not found", 404)
    if (!recipientWallet)
      return errorResponse("Recipient wallet not found", 404)
    if (senderWallet.balance < amount)
      return errorResponse("Insufficient balance", 400)

    // Optional: verify PIN
    if (senderWallet.password && senderWallet.password !== pin) {
      return errorResponse("Invalid wallet PIN", 401)
    }

    // Transfer transaction
    await prisma.$transaction(async (tx) => {
      // Debit sender
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } },
      })

      await tx.walletTransaction.create({
        data: {
          walletId: senderWallet.id,
          amount,
          type: "TRANSFER_OUT",
          reference: `TRF-${Date.now()}`,
          meta: { to: recipientId },
        },
      })

      // Credit recipient
      await tx.wallet.update({
        where: { id: recipientWallet.id },
        data: { balance: { increment: amount } },
      })

      await tx.walletTransaction.create({
        data: {
          walletId: recipientWallet.id,
          amount,
          type: "TRANSFER_IN",
          reference: `TRF-${Date.now()}`,
          meta: { from: senderId },
        },
      })
    })

    return successResponse("Transfer successful")
  } catch (error) {
    console.error("Transfer service error:", error)
    return errorResponse("Failed to process transfer", 500)
  }
}

//  Pay From Wallet
export const payFromWalletService = async (
  userId,
  { amount, merchant, pin }
) => {
  try {
    if (!amount || amount <= 0)
      return errorResponse("Invalid payment amount", 400)
    if (!merchant) return errorResponse("Merchant is required", 400)

    const wallet = await prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) return errorResponse("Wallet not found", 404)
    if (wallet.balance < amount)
      return errorResponse("Insufficient balance", 400)

    // Optional: verify PIN
    if (wallet.password && wallet.password !== pin)
      return errorResponse("Invalid wallet PIN", 401)

    // Debit wallet and create WalletTransaction
    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      })

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: "DEBIT",
          reference: `PAY-${Date.now()}`,
          meta: { merchant },
        },
      })
    })

    return successResponse("Payment successful")
  } catch (error) {
    console.error("Pay from wallet service error:", error)
    return errorResponse("Failed to process wallet payment", 500)
  }
}

//  Internal Wallet Transaction History
export const getTransactionHistoryService = async (userId) => {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } })
    if (!wallet) return errorResponse("Wallet not found", 404)

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
    })

    return successResponse("Transaction history retrieved", transactions)
  } catch (error) {
    console.error("Get transaction history service error:", error)
    return errorResponse("Failed to fetch wallet transactions", 500)
  }
}
