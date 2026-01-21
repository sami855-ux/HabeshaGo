import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

//  Initiate Payment
export const initiatePaymentService = async (
  userId,
  { amount, gateway, type }
) => {
  try {
    if (!amount || amount <= 0) return errorResponse("Invalid amount", 400)
    if (!gateway) return errorResponse("Payment gateway is required", 400)

    // Create payment record as PENDING
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        method: gateway,
        status: "PENDING",
        metadata: { type }, // e.g., wallet top-up or direct payment
      },
    })

    // Generate external gateway request (mock example)
    let paymentUrl
    switch (gateway.toLowerCase()) {
      case "chapa":
        paymentUrl = await createChapaPayment(payment)
        break
      case "telebirr":
        paymentUrl = await createTelebirrPayment(payment)
        break
      case "cbe":
        paymentUrl = await createCBEPayment(payment)
        break
      default:
        return errorResponse("Unsupported gateway", 400)
    }

    return successResponse("Payment initiated", { payment, paymentUrl })
  } catch (error) {
    console.error("Initiate payment service error:", error)
    return errorResponse("Failed to initiate payment", 500)
  }
}

//  Payment Callback
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

        // If top-up to wallet, credit wallet
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

//  Payment History
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

// == Mock Gateway Integration ==
const createChapaPayment = async (payment) => {
  // Here you call Chapa API with payment.amount, payment.reference, callback URL, etc.
  // Return the checkout/payment URL
  return `https://checkout.chapa.com/pay/${payment.reference}`
}

const createTelebirrPayment = async (payment) => {
  return `https://pay.telebirr.com/${payment.reference}`
}

const createCBEPayment = async (payment) => {
  return `https://cbe.com/pay/${payment.reference}`
}
