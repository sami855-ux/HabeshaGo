import { successResponse, errorResponse } from "../utils/apiResponse.js"
import { handleSuccessfulTopup } from "../utils/paymentHelper.js"
import prisma from "../prisma/client.js"
import chapa from "../config/chapa.js"

import crypto from "crypto"
import { stkPush } from "./mpesa.service.js"

/**
 * Generate unique transaction reference
 */
const generateReference = (prefix = "payment") =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`

// INITIATE PAYMENT
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
      return handleSuccessfulTopup(tx, payment)

    case "BUS_BOOKING":
      return handleBusBookingPayment(tx, payment, bookingId)

    case "MINIBUS_BOOKING":
      return handleMinibusBookingPayment(tx, payment, bookingId)

    default:
      console.warn("Unhandled payment type:", type)
  }
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

// M-Pesa Top-up Service
export const mpesaTopUpService = async ({ amount, phone, userId }) => {
  try {
    if (!amount || amount <= 0) return errorResponse("Invalid amount", 400)
    if (!phone) return errorResponse("Phone number required", 400)

    const reference = crypto.randomBytes(8).toString("hex")

    // 1️⃣ Create pending payment
    await prisma.payment.create({
      data: {
        userId,
        amount,
        currency: "ETB",
        method: "MOBILE_MONEY",
        gateway: "MPESA",
        flow: "WALLET_TOPUP",
        reference,
        status: "PENDING",
        metadata: { phone },
      },
    })

    // 2️⃣ Call shared STK Push service
    const stkResponse = await stkPush({ phone, amount, reference })

    return successResponse("STK push initiated", {
      reference,
      response: stkResponse,
    })
  } catch (error) {
    console.error(
      "M-Pesa Top-up service error:",
      error.response?.data || error.message,
    )
    return errorResponse("Failed to initiate M-Pesa top-up", 500)
  }
}

// M-Pesa Callback Service
export const mpesaCallbackService = async (data) => {
  try {
    const callback = data?.Body?.stkCallback
    if (!callback) return errorResponse("Invalid callback structure", 400)

    const resultCode = callback.ResultCode
    const metadata = callback.CallbackMetadata?.Item || []
    const getValue = (name) => metadata.find((i) => i.Name === name)?.Value
    const reference = getValue("AccountReference")

    if (!reference) return errorResponse("Transaction reference missing", 400)

    const payment = await prisma.payment.findUnique({ where: { reference } })
    if (!payment) return errorResponse("Payment not found", 404)
    if (payment.status === "SUCCESS")
      return successResponse("Payment already processed")

    if (resultCode !== 0) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          metadata: {
            ...payment.metadata,
            callbackData: data,
            failedAt: new Date(),
          },
        },
      })
      return errorResponse("Payment failed", 400)
    }

    const mpesaReceipt = getValue("MpesaReceiptNumber")
    const phone = getValue("PhoneNumber")

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          gatewayRef: mpesaReceipt,
          method: "MOBILE_MONEY",
          metadata: {
            ...payment.metadata,
            phone,
            callbackData: data,
            completedAt: new Date(),
          },
        },
      })

      // ✅ Use your shared function to update wallet, transactions, and points
      await handleSuccessfulPayment(tx, payment)
    })

    return successResponse("Payment processed successfully", {
      reference,
      amount: payment.amount,
      receipt: mpesaReceipt,
      phone,
    })
  } catch (error) {
    console.error("M-Pesa callback service error:", error)
    return errorResponse("Failed to process M-Pesa payment", 500)
  }
}
