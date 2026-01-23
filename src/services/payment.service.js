import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import chapa from "../config/chapa.js"

// Utility to generate unique transaction references
const generateReference = () =>
  `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`

// ---------------------------
// Initiate Payment
// ---------------------------
export const initiatePaymentService = async (
  userId,
  { amount, gateway, type, flow },
) => {
  try {
    if (!amount || amount <= 0)
      return { success: false, message: "Invalid amount", status: 400 }

    if (!gateway)
      return {
        success: false,
        message: "Payment gateway is required",
        status: 400,
      }

    if (!flow)
      return {
        success: false,
        message: "Payment flow is required",
        status: 400,
      }

    const reference = generateReference()

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency: "ETB",
        method: "WALLET", // WALLET, TELEBIRR, CBE
        gateway: gateway.toLowerCase() === "chapa" ? "CHAPA" : "INTERNAL",
        status: "PENDING",
        flow, // WALLET_TOPUP, WALLET_PAYMENT, DIRECT_PAYMENT
        reference,
        metadata: { type }, // e.g., WALLET_TOPUP
      },
    })

    // Generate external gateway URL
    let paymentUrl
    switch (gateway.toLowerCase()) {
      case "chapa":
        paymentUrl = await createChapaPayment(payment)
        break
      case "telebirr":
        paymentUrl = createTelebirrPayment(payment)
        break
      case "cbe":
        paymentUrl = createCBEPayment(payment)
        break
      default:
        return { success: false, message: "Unsupported gateway", status: 400 }
    }

    return {
      success: true,
      message: "Payment initiated",
      data: { payment, paymentUrl },
      status: 200,
    }
  } catch (error) {
    console.error("Initiate payment service error:", error)
    return {
      success: false,
      message: "Failed to initiate payment",
      status: 500,
    }
  }
}

// ---------------------------
// Payment Callback
// ---------------------------
export const paymentCallbackService = async (data) => {
  try {
    const { reference, status, gatewayMetadata } = data

    const payment = await prisma.payment.findUnique({ where: { reference } })
    if (!payment) return errorResponse("Payment not found", 404)

    if (status === "SUCCESS") {
      await prisma.$transaction(async (tx) => {
        // Mark payment success
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            metadata: { ...payment.metadata, gatewayMetadata },
          },
        })

        // Wallet top-up
        if (payment.metadata.type === "WALLET_TOPUP") {
          const wallet = await tx.wallet.findUnique({
            where: { userId: payment.userId },
          })
          if (wallet) {
            await tx.wallet.update({
              where: { id: wallet.id },
              data: { balance: { increment: payment.amount } },
            })

            await tx.walletTransaction.create({
              data: {
                walletId: wallet.id,
                amount: payment.amount,
                type: "DEPOSIT",
                reference: payment.reference,
                meta: { gateway: payment.method },
              },
            })
          }
        }
      })

      return successResponse("Payment successful")
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          metadata: { ...payment.metadata, gatewayMetadata },
        },
      })

      return errorResponse("Payment failed", 400)
    }
  } catch (error) {
    console.error("Payment callback service error:", error)
    return errorResponse("Failed to process payment callback", 500)
  }
}

// ---------------------------
// Payment History
// ---------------------------
export const getPaymentHistoryService = async (userId) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
    return successResponse("Payment history retrieved", payments)
  } catch (error) {
    console.error("Get payment history service error:", error)
    return errorResponse("Failed to fetch payment history", 500)
  }
}

// ---------------------------
// Gateway Integrations
// ---------------------------

// Chapa payment
const createChapaPayment = async (payment) => {
  try {
    const tx_ref = payment.reference
    const response = await chapa.initialize({
      tx_ref,
      amount: payment.amount,
      currency: "ETB",
      email: payment.metadata.email || "user@example.com", // get real email if available
      first_name: payment.metadata.firstName || "User",
      last_name: payment.metadata.lastName || "",
      callback_url: `${process.env.BACKEND_URL}/payment/callback`,
      return_url: `${process.env.FRONTEND_URL}/payment-success`,
      customization: {
        title: "Wallet Top-up",
        description: "Add funds to your wallet",
      },
    })

    return response.data.checkout_url
  } catch (error) {
    console.error("Chapa payment creation failed:", error)
    throw new Error("Failed to create Chapa payment")
  }
}

// Telebirr placeholder
const createTelebirrPayment = (payment) => {
  return `https://pay.telebirr.com/${payment.reference}`
}

// CBE placeholder
const createCBEPayment = (payment) => {
  return `https://cbe.com/pay/${payment.reference}`
}
