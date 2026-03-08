import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"
import chapa from "../config/chapa.js"

/**
 * Generate unique transaction reference
 */
const generateReference = (prefix = "payment") =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`

// ===================================================
// INITIATE PAYMENT
// ===================================================
export const initiatePaymentService = async (
  userId,
  { amount, gateway, type, flow, bookingId, userInfo },
) => {
  try {
    if (!amount || amount <= 0) return errorResponse("Invalid amount", 400)

    if (!gateway) return errorResponse("Payment gateway is required", 400)

    if (!type) return errorResponse("Payment type is required", 400)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true },
    })

    if (!user) return errorResponse("User not found", 404)

    const reference = generateReference(type.toLowerCase())

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: parseFloat(amount),
        currency: "ETB",
        gateway: "CHAPA",
        method: "WALLET", // actual method unknown until Chapa confirms
        status: "PENDING",
        flow, // WALLET_TOPUP | WALLET_PAYMENT | DIRECT_PAYMENT
        reference,
        metadata: {
          type,
          bookingId: bookingId || null,
          preferredMethod: userInfo?.preferredMethod || null, // UI choice
          userInfo: {
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
        },
        ...(bookingId && {
          bookings: { connect: { id: parseInt(bookingId) } },
        }),
      },
    })

    // Only Chapa supported here
    if (gateway.toLowerCase() !== "chapa")
      return errorResponse("Unsupported gateway", 400)

    const chapaResult = await createChapaPayment(payment, user)

    return successResponse(
      "Payment initiated successfully",
      {
        payment: {
          id: payment.id,
          reference: payment.reference,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          gateway: payment.gateway,
        },
        paymentUrl: chapaResult.paymentUrl,
        expiresIn: "15 minutes",
      },
      201,
    )
  } catch (error) {
    console.error("Initiate payment error:", error)
    return errorResponse("Failed to initiate payment", 500)
  }
}

// ===================================================
// CHAPA CALLBACK / WEBHOOK
// ===================================================
export const paymentCallbackService = async (data) => {
  try {
    const reference = data.tx_ref || data.trx_ref

    if (!reference) return errorResponse("Transaction reference missing", 400)

    const payment = await prisma.payment.findUnique({
      where: { reference },
    })

    if (!payment) return errorResponse("Payment not found", 404)

    if (payment.status === "SUCCESS")
      return successResponse("Payment already processed")

    // Verify with Chapa (SOURCE OF TRUTH)
    const verification = await chapa.verify(reference)

    if (
      verification.status !== "success" ||
      verification.data.status !== "success"
    ) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          metadata: {
            ...payment.metadata,
            callbackData: data,
            verificationResponse: verification,
          },
        },
      })
      return errorResponse("Payment verification failed", 400)
    }

    const actualMethod =
      verification.data.payment_method || verification.data.channel || "UNKNOWN"

    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          method: actualMethod.toUpperCase(),
          metadata: {
            ...payment.metadata,
            actualMethod,
            callbackData: data,
            verificationResponse: verification,
            completedAt: new Date(),
          },
        },
      })

      await handleSuccessfulPayment(tx, payment)
    })

    return successResponse("Payment processed successfully", {
      reference,
      amount: payment.amount,
      method: actualMethod,
    })
  } catch (error) {
    console.error("Payment callback error:", error)
    return errorResponse("Failed to process payment", 500)
  }
}

// ===================================================
// HANDLE SUCCESSFUL PAYMENT
// ===================================================
const handleSuccessfulPayment = async (tx, payment) => {
  const { type, bookingId } = payment.metadata

  switch (type) {
    case "WALLET_TOPUP":
      return handleWalletTopup(tx, payment)

    case "BUS_BOOKING":
      return handleBusBookingPayment(tx, payment, bookingId)

    case "MINIBUS_BOOKING":
      return handleMinibusBookingPayment(tx, payment, bookingId)

    default:
      console.warn("Unhandled payment type:", type)
  }
}

// ---------------- WALLET TOPUP ----------------
const handleWalletTopup = async (tx, payment) => {
  const wallet = await tx.wallet.findUnique({
    where: { userId: payment.userId },
  })

  if (!wallet) return

  const newBalance = wallet.balance.add(payment.amount)

  await tx.wallet.update({
    where: { id: wallet.id },
    data: { balance: newBalance },
  })

  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      amount: payment.amount,
      type: "DEPOSIT",
      status: "SUCCESS",
      balanceAfter: newBalance,
      reference: payment.reference,
      description: `Wallet top-up via ${payment.method}`,
      metadata: { paymentId: payment.id },
    },
  })
}

// ---------------- BUS BOOKING ----------------
const handleBusBookingPayment = async (tx, payment, bookingId) => {
  if (!bookingId) return

  await tx.booking.update({
    where: { id: parseInt(bookingId) },
    data: {
      status: "CONFIRMED",
      paymentId: payment.id,
      amountPaid: payment.amount,
    },
  })
}

// ---------------- MINIBUS BOOKING ----------------
const handleMinibusBookingPayment = async (tx, payment, bookingId) => {
  if (!bookingId) return

  await tx.minibusReservation.update({
    where: { id: parseInt(bookingId) },
    data: {
      status: "CONFIRMED",
      paymentId: payment.id,
    },
  })
}

// ===================================================
// CHAPA INITIALIZATION
// ===================================================
const createChapaPayment = async (payment, user) => {
  const nameParts = (user.name || "User").split(" ")

  const payload = {
    amount: payment.amount.toString(),
    currency: "ETB",

    email: user.email,
    first_name: nameParts[0],
    last_name: nameParts.slice(1).join(" ") || "Customer",
    phone_number: user.phone,

    tx_ref: payment.reference,
    callback_url: "http://localhost:5000/api/payments/chapa/callback",
    return_url: `http://localhost:3000/payment/success?ref=${payment.reference}`,

    // ✅ FLATTENED customization
    "customization[title]": "HabeshaGo Payment",
    "customization[description]": payment.metadata.type,

    // ✅ FLATTENED meta (strings only)
    "meta[payment_id]": payment.id.toString(),
    "meta[user_id]": payment.userId.toString(),
    "meta[type]": payment.metadata.type,
  }

  const response = await chapa.initialize(payload)

  if (response.status !== "success")
    throw new Error(response.message || "Chapa init failed")

  return {
    paymentUrl: response.data.checkout_url,
  }
}
