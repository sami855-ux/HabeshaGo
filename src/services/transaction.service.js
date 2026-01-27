import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import bcrypt from "bcrypt"

//  Wallet-to-Wallet Transfer
export const transferFundsService = async (
  senderId,
  { recipientId, amount, pin, description },
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

    if (!senderWallet.isActive || senderWallet.isLocked)
      return errorResponse("Sender wallet is inactive or locked", 403)

    if (senderWallet.balance < amount)
      return errorResponse("Insufficient balance", 400)

    // 🔐 PIN verification
    if (senderWallet.pinHash) {
      const validPin = await bcrypt.compare(pin, senderWallet.pinHash)
      if (!validPin) return errorResponse("Invalid wallet PIN", 401)
    }

    const referenceBase = `TRF-${Date.now()}`

    let senderTxn

    await prisma.$transaction(async (tx) => {
      // Debit sender
      const updatedSenderWallet = await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } },
      })

      senderTxn = await tx.walletTransaction.create({
        data: {
          walletId: senderWallet.id,
          amount,
          type: "TRANSFER_OUT",
          status: "SUCCESS",
          reference: `${referenceBase}-OUT`,
          balanceAfter: updatedSenderWallet.balance,
          metadata: { to: recipientId },
          description: description || null,
        },
      })

      // Credit recipient
      const updatedRecipientWallet = await tx.wallet.update({
        where: { id: recipientWallet.id },
        data: { balance: { increment: amount } },
      })

      await tx.walletTransaction.create({
        data: {
          walletId: recipientWallet.id,
          amount,
          type: "TRANSFER_IN",
          status: "SUCCESS",
          reference: `${referenceBase}-IN`,
          balanceAfter: updatedRecipientWallet.balance,
          metadata: { from: senderId },
          description: description || null,
        },
      })
    })

    return successResponse("Transfer successful", senderTxn, 200)
  } catch (error) {
    console.error("Transfer service error:", error)
    return errorResponse("Failed to process transfer", 500)
  }
}

//  Pay From Wallet
export const payFromWalletService = async (
  userId,
  { amount, merchantId, pin },
) => {
  try {
    if (!amount || amount <= 0)
      return errorResponse("Invalid payment amount", 400)

    if (!merchantId) return errorResponse("Merchant is required", 400)

    const payerWallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    const merchantWallet = await prisma.wallet.findUnique({
      where: { userId: merchantId },
    })

    if (!payerWallet) return errorResponse("Payer wallet not found", 404)
    if (!merchantWallet) return errorResponse("Merchant wallet not found", 404)

    if (!payerWallet.isActive || payerWallet.isLocked)
      return errorResponse("Wallet is inactive or locked", 403)

    if (payerWallet.balance < amount)
      return errorResponse("Insufficient balance", 400)

    // 🔐 PIN verification
    if (payerWallet.pinHash) {
      const validPin = await bcrypt.compare(pin, payerWallet.pinHash)
      if (!validPin) return errorResponse("Invalid wallet PIN", 401)
    }

    const referenceBase = `PAY-${Date.now()}`

    await prisma.$transaction(async (tx) => {
      // Debit payer
      const updatedPayerWallet = await tx.wallet.update({
        where: { id: payerWallet.id },
        data: { balance: { decrement: amount } },
      })

      await tx.walletTransaction.create({
        data: {
          walletId: payerWallet.id,
          amount,
          type: "PAYMENT_OUT",
          status: "SUCCESS",
          reference: `${referenceBase}-OUT`,
          balanceAfter: updatedPayerWallet.balance,
          metadata: { toMerchant: merchantId },
        },
      })

      // Credit merchant
      const updatedMerchantWallet = await tx.wallet.update({
        where: { id: merchantWallet.id },
        data: { balance: { increment: amount } },
      })

      await tx.walletTransaction.create({
        data: {
          walletId: merchantWallet.id,
          amount,
          type: "PAYMENT_IN",
          status: "SUCCESS",
          reference: `${referenceBase}-IN`,
          balanceAfter: updatedMerchantWallet.balance,
          metadata: { fromUser: userId },
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
export const getTransactionHistoryService = async () => {
  try {
    const transactions = await prisma.walletTransaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        wallet: {
          select: {
            userId: true,
            currency: true,
          },
        },
      },
    })

    return successResponse("All transactions retrieved", transactions)
  } catch (error) {
    console.error("Get all transactions service error:", error)
    return errorResponse("Failed to fetch transactions", 500)
  }
}
