import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import bcrypt from "bcrypt"

const MAX_ATTEMPTS = 5

//  Wallet-to-Wallet Transfer
export const transferFundsService = async (
  senderId,
  { recipientId, amount, pin, description },
) => {
  try {
    if (!recipientId || !amount || amount <= 0)
      return errorResponse("Invalid transfer data", 400)

    if (senderId === recipientId)
      return errorResponse("Cannot transfer to self", 400)

    // Fetch wallets
    const [senderWallet, recipientWallet] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: senderId } }),
      prisma.wallet.findUnique({ where: { userId: recipientId } }),
    ])

    if (!senderWallet) return errorResponse("Sender wallet not found", 404)
    if (!recipientWallet)
      return errorResponse("Recipient wallet not found", 404)

    if (!senderWallet.isActive || senderWallet.isLocked)
      return errorResponse("Sender wallet is inactive or locked", 403)

    if (senderWallet.balance < amount)
      return errorResponse("Insufficient balance", 400)

    // PIN verification
    if (senderWallet.pinHash) {
      const validPin = await bcrypt.compare(pin || "", senderWallet.pinHash)
      if (!validPin) return errorResponse("Invalid wallet PIN", 401)
    }

    const referenceBase = `TRF-${Date.now()}`

    let senderTxn

    // Atomic transaction
    await prisma.$transaction(async (tx) => {
      // Debit sender
      const updatedSenderWallet = await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } },
      })

      senderTxn = await tx.walletTransaction.create({
        data: {
          walletId: senderWallet.id,
          recipientWalletId: recipientWallet.id, // <-- link recipient wallet
          amount,
          type: "TRANSFER_OUT",
          status: "SUCCESS",
          reference: `${referenceBase}-OUT`,
          balanceAfter: updatedSenderWallet.balance,
          metadata: { to: recipientId },
          description: description || `Transfer to ${recipientId}`,
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
          description: description || `Received from ${senderId}`,
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

export const verifyWalletPinService = async (userId, body) => {
  try {
    const { pin } = body

    if (!pin) {
      return errorResponse("PIN required", 400)
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return errorResponse("Wallet not found", 404)
    }

    if (!wallet.isActive) {
      return errorResponse("Wallet inactive", 403)
    }

    if (wallet.isLocked) {
      return errorResponse("Wallet locked due to too many attempts", 423)
    }

    if (!wallet.pinHash) {
      return errorResponse("PIN not set", 400)
    }

    const isMatch = await bcrypt.compare(pin, wallet.pinHash)

    // ❌ wrong pin
    if (!isMatch) {
      const attempts = wallet.pinAttempts + 1
      const lock = attempts >= MAX_ATTEMPTS

      await prisma.wallet.update({
        where: { userId },
        data: {
          pinAttempts: attempts,
          isLocked: lock,
        },
      })

      return errorResponse(
        lock ? "Wallet locked due to too many attempts" : "Invalid PIN",
        401,
      )
    }

    // ✅ correct pin
    await prisma.wallet.update({
      where: { userId },
      data: { pinAttempts: 0 },
    })

    return successResponse("PIN verified successfully", { verified: true }, 200)
  } catch (error) {
    console.error("Verify wallet PIN service error:", error)
    return errorResponse("Failed to verify wallet PIN", 500)
  }
}

export const getWalletTransactionByIdService = async (id) => {
  try {
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: Number(id) },
      include: {
        wallet: {
          include: {
            user: true,
          },
        },
        recipientWallet: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!transaction) {
      return errorResponse("Transaction not found", 404)
    }

    return successResponse(
      "Transaction retrieved successfully",
      transaction,
      200,
    )
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return errorResponse("Failed to fetch transaction", 500)
  }
}

export const getUserFinancialHistory = async (req, res) => {
  try {
    const userId = req.user.id

    // 1️⃣ Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return res.status(404).json(errorResponse("Wallet not found"))
    }

    // 2️⃣ Fetch all data in parallel
    const [walletTxs, pointTxs, payments] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: {
          OR: [{ walletId: wallet.id }, { recipientWalletId: wallet.id }],
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.pointTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
      }),

      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          wallet: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ])

    // 3️⃣ Format Wallet Transactions
    const formattedWalletTxs = walletTxs.map((tx) => ({
      id: `wallet-${tx.id}`,
      type: "WALLET",

      amount: Number(tx.amount),
      currency: "ETB",

      status: tx.status,
      method: "WALLET",
      flow: tx.walletId === wallet.id ? "DEBIT" : "CREDIT",

      reference: tx.reference,
      description: tx.description,

      balanceAfter: Number(tx.balanceAfter),

      createdAt: tx.createdAt,

      metadata: tx.metadata,
    }))

    // 4️⃣ Format Point Transactions
    const formattedPointTxs = pointTxs.map((pt) => ({
      id: `point-${pt.id}`,
      type: "POINT",

      amount: pt.amount,
      currency: "PTS",

      status: "SUCCESS",
      method: "POINT",
      flow: pt.amount > 0 ? "EARNED" : "SPENT",

      reference: `POINT-${pt.id}`,
      description: pt.reason,

      createdAt: pt.createdAt,
    }))

    // 5️⃣ Format Payments (MATCH YOUR FRONTEND SHAPE)
    const formattedPayments = payments.map((p) => ({
      id: `payment-${p.id}`,
      type: "PAYMENT",

      amount: Number(p.amount),
      currency: p.currency,

      status: p.status,
      method: p.method,
      gateway: p.gateway,
      flow: p.flow,

      pointsUsed: p.pointsUsed,
      pointsValue: p.pointsValue,

      gatewayRef: p.gatewayRef,
      reference: p.reference,

      metadata: p.metadata,

      walletId: p.walletId,

      createdAt: p.createdAt,
      updatedAt: p.updatedAt,

      user: p.user,
      wallet: p.wallet
        ? {
            id: p.wallet.id,
            balance: Number(p.wallet.balance),
          }
        : null,
    }))

    // 6️⃣ Combine everything
    const allTransactions = [
      ...formattedWalletTxs,
      ...formattedPointTxs,
      ...formattedPayments,
    ]

    // 7️⃣ Sort by date (latest first)
    allTransactions.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    )

    return res.status(200).json(
      successResponse("Financial history fetched successfully", {
        transactions: allTransactions,
        summary: {
          walletBalance: Number(wallet.balance),
          points: wallet.points,
        },
      }),
    )
  } catch (error) {
    console.error("Error fetching financial history:", error)
    return res
      .status(500)
      .json(errorResponse("Failed to fetch financial history"))
  }
}
