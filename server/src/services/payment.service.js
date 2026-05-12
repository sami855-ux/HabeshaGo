import { successResponse, errorResponse } from "../utils/apiResponse.js"
import { handleSuccessfulTopup } from "../utils/paymentHelper.js"
import prisma from "../prisma/client.js"
import chapa from "../config/chapa.js"

import crypto from "crypto"
import { stkPush } from "./mpesa.service.js"
import {
  createTelebirrPayment,
  encryptWithPublicKey,
  signPayload,
} from "./telebirr.service.js"
import { addPointsToUser } from "./wallet.service.js"
import { ADMIN_WALLET_ID, COMMISSION_RATE } from "../utils/constants.js"
import { generateQRCode } from "../utils/qrcode.js"
import { Decimal } from "@prisma/client/runtime/library"
import { createNotificationService } from "../controllers/notification.controller.js"

/**
 * Generate unique transaction reference
 */
export const generateReference = (prefix = "payment") =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`

// INITIATE PAYMENT

export const initiatePaymentService = async (
  userId,
  { amount, gateway, type, flow, bookingId, sessionId, userInfo },
) => {
  try {
    if (!amount || amount <= 0) return errorResponse("Invalid amount", 400)
    if (!gateway) return errorResponse("Payment gateway is required", 400)
    if (!type) return errorResponse("Payment type is required", 400)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        wallet: { select: { id: true, balance: true } },
      },
    })

    if (!user) return errorResponse("User not found", 404)
    if (flow === "WALLET_TOPUP" && !user.wallet)
      return errorResponse("Wallet not found", 404)

    const reference = generateReference(type.toLowerCase())

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: parseFloat(amount),
        currency: "ETB",
        gateway: gateway.toUpperCase(), // CHAPA or TELEBIRR
        method: "MOBILE_MONEY",
        status: "PENDING",
        flow,
        flow,
        reference,
        ...(flow === "WALLET_TOPUP" &&
          user.wallet && {
            walletId: user.wallet.id,
          }),
        metadata: {
          type,
          bookingId: bookingId || null,
          preferredMethod: userInfo?.preferredMethod || null,
          userInfo: { name: user.name, email: user.email, phone: user.phone },
        },
      },
    })

    // ✅ Route to correct gateway
    let paymentUrl
    const gw = gateway.toLowerCase()

    if (gw === "chapa") {
      const result = await createChapaPayment(payment, user)
      paymentUrl = result.paymentUrl
    } else if (gw === "telebirr") {
      const result = await createTelebirrPayment(payment, user)
      paymentUrl = result.paymentUrl
    } else {
      return errorResponse("Unsupported gateway", 400)
    }

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
          walletId: payment.walletId ?? null,
        },
        paymentUrl,
        expiresIn: "15 minutes",
      },
      201,
    )
  } catch (error) {
    console.error("Initiate payment error:", error)
    return errorResponse("Failed to initiate payment", 500)
  }
}

// CHAPA CALLBACK / WEBHOOK
export const paymentCallbackService = async (data) => {
  try {
    const reference = data.tx_ref || data.trx_ref
    if (!reference) return errorResponse("Transaction reference missing", 400)

    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { wallet: true }, // include wallet relation
    })

    if (!payment) return errorResponse("Payment not found", 404)
    if (payment.status === "SUCCESS")
      return successResponse("Payment already processed")

    // Verify with Chapa (SOURCE OF TRUTH)
    const verification = await chapa.verify({ tx_ref: reference })
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
      verification.data.payment_method ||
      verification.data.channel ||
      "MOBILE_MONEY"

    await prisma.$transaction(async (tx) => {
      // 1. Update payment to SUCCESS
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

      console.log(payment.flow)

      // 2. Only update wallet for WALLET_TOPUP flow
      if (payment.flow === "WALLET_TOPUP" && payment.walletId) {
        // Get current balance for balanceAfter calculation
        const wallet = await tx.wallet.findUnique({
          where: { id: payment.walletId },
          select: { balance: true },
        })

        if (!wallet) throw new Error("Wallet not found")

        const newBalance = Number(wallet.balance) + Number(payment.amount)

        // Update wallet balance
        await tx.wallet.update({
          where: { id: payment.walletId },
          data: {
            balance: newBalance,
          },
        })

        // Record the WalletTransaction ledger entry
        await tx.walletTransaction.create({
          data: {
            walletId: payment.walletId,
            recipientWalletId: payment.walletId,
            amount: payment.amount,
            type: "DEPOSIT",
            status: "SUCCESS",
            balanceAfter: newBalance,
            reference: `WT-${reference}`,
            description: `Wallet top-up via ${actualMethod}`,
            metadata: {
              paymentId: payment.id,
              gateway: payment.gateway,
            },
          },
        })

        await addPointsToUser({
          tx,
          userId: payment.userId,
          amount: 500, // points to reward for top-up
          type: "EARN",
          reason: "Wallet top-up reward",
          reference: `TOPUP_${reference}`,
          metadata: {
            paymentId: payment.id,
            gateway: payment.gateway,
            amount: payment.amount,
          },
        })

        await createNotificationService({
          userId: payment.userId,
          title: "Wallet Top-up Successful",
          message: `Your wallet has been topped up with ${payment.amount} ${payment.currency} via ${actualMethod}.`,
          type: "WALLET",
          actionUrl: "/user/wallet",
          metadata: {
            paymentId: payment.id,
            amount: payment.amount,
            gateway: payment.gateway,
            reference,
          },
        })
      }

      // 3. Run your existing handler (tickets, bookings, etc.)
      // await handleSuccessfulPayment(tx, payment)
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

export const telebirrCallbackService = async (data) => {
  try {
    // Telebirr sends outTradeNo as your reference
    const reference = data.outTradeNo || data.transNo || data.tx_ref
    if (!reference) return errorResponse("Transaction reference missing", 400)

    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { wallet: true },
    })

    if (!payment) return errorResponse("Payment not found", 404)
    if (payment.status === "SUCCESS")
      return successResponse("Payment already processed")

    // ✅ Telebirr verification (no SDK — direct API call)
    const verification = await verifyTelebirrPayment(reference)

    if (!verification.success) {
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

    const actualMethod = "TELEBIRR"

    await prisma.$transaction(async (tx) => {
      // 1. Update payment to SUCCESS
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          method: actualMethod,
          gatewayRef: verification.data?.msisdn || null, // telebirr phone number
          metadata: {
            ...payment.metadata,
            actualMethod,
            callbackData: data,
            verificationResponse: verification,
            completedAt: new Date(),
          },
        },
      })

      // 2. Update wallet for WALLET_TOPUP
      if (payment.flow === "WALLET_TOPUP" && payment.walletId) {
        const wallet = await tx.wallet.findUnique({
          where: { id: payment.walletId },
          select: { balance: true },
        })

        if (!wallet) throw new Error("Wallet not found")

        const newBalance = Number(wallet.balance) + Number(payment.amount)

        await tx.wallet.update({
          where: { id: payment.walletId },
          data: { balance: newBalance },
        })

        await tx.walletTransaction.create({
          data: {
            walletId: payment.walletId,
            amount: payment.amount,
            type: "DEPOSIT",
            status: "SUCCESS",
            balanceAfter: newBalance,
            reference: `WT-${reference}`,
            description: `Wallet top-up via Telebirr`,
            metadata: {
              paymentId: payment.id,
              gateway: "TELEBIRR",
            },
          },
        })
      }

      // 3. Handle other flows (bookings, tickets etc.)
      // await handleSuccessfulPayment(tx, payment)
    })

    return successResponse("Payment processed successfully", {
      reference,
      amount: payment.amount,
      method: actualMethod,
    })
  } catch (error) {
    console.error("Telebirr callback error:", error)
    return errorResponse("Failed to process payment", 500)
  }
}

// ✅ Telebirr verify helper
const verifyTelebirrPayment = async (reference) => {
  try {
    const timestamp = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString("hex")

    const params = {
      appId: process.env.TELEBIRR_APP_ID,
      shortCode: process.env.TELEBIRR_SHORT_CODE,
      timeStamp: timestamp,
      nonce,
      outTradeNo: reference,
    }

    const sign = signPayload(params)
    const encryptedData = encryptWithPublicKey(params)

    const response = await axios.post(
      `${process.env.TELEBIRR_BASE_URL}/query`,
      {
        appid: process.env.TELEBIRR_APP_ID,
        sign,
        ussd: encryptedData,
      },
      {
        headers: { "Content-Type": "application/json" },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      },
    )

    const isSuccess =
      response.data.code === "0" &&
      response.data.data?.tradeStatus === "SUCCESS"

    return {
      success: isSuccess,
      data: response.data.data || {},
      raw: response.data,
    }
  } catch (error) {
    console.error("Telebirr verify error:", error)
    return { success: false, data: {}, raw: error.message }
  }
}

// HANDLE SUCCESSFUL PAYMENT
export const handleSuccessfulPayment = async (tx, payment, type, bookingId) => {
  console.log(type)
  switch (type) {
    case "WALLET_TOPUP":
      return handleSuccessfulTopup(tx, payment)

    case "BOOKING":
      return handleBusBookingPayment(tx, payment, bookingId)

    case "MINIBUS_BOOKING":
      return handleMinibusBookingPayment(tx, payment, bookingId)

    case "EV_RESERVATION":
      return handleEvReservationPayment(tx, payment)
    default:
      console.warn("Unhandled payment type:", type)
  }
}

// BUS BOOKING
const handleBusBookingPayment = async (tx, payment, bookingId) => {
  console.log("booking id", bookingId)
  if (!bookingId) throw new Error("Booking ID missing")

  const actualMethod = payment.metadata?.actualMethod || "MOBILE_MONEY"
  const seats = payment.metadata?.seats || 1

  const booking = await tx.booking.findUnique({
    where: { id: parseInt(bookingId) },
    include: { bus: true },
  })
  if (!booking) throw new Error("Booking not found")
  if (booking.status === "CONFIRMED") return // idempotent guard

  // 1️⃣ Confirm booking
  await tx.booking.update({
    where: { id: parseInt(bookingId) },
    data: {
      status: "CONFIRMED",
      amountPaid: payment.amount,
    },
  })

  // 2️⃣ Generate QR & issue tickets
  const qrCode = await generateQRCode(
    JSON.stringify({ userId: payment.userId, bookingId }),
  )
  const validUntil = new Date(booking.date)
  validUntil.setHours(validUntil.getHours() + 4)

  const ticketsData = Array.from({ length: seats }).map((_, index) => ({
    bookingId: parseInt(bookingId),
    userId: payment.userId,
    seatNumber: index + 1,
    boardingStop: booking.boardingStop ?? null,
    alightingStop: booking.alightingStop ?? null,
    qrCode,
    validUntil,
  }))
  await tx.ticket.createMany({ data: ticketsData })

  // 3️⃣ Ledger
  const commission = Number(booking.totalAmount) * COMMISSION_RATE
  const providerAmount = Number(booking.totalAmount) - commission

  await tx.transactionLedger.create({
    data: {
      userId: payment.userId,
      providerId: null,
      paymentId: payment.id,
      totalAmount: payment.amount,
      commission,
      providerAmount,
      serviceType: "BUS_TICKET",
      referenceId: String(bookingId),
      referenceType: "BOOKING",
      paymentMethod: "MOBILE_MONEY",
      currency: payment.currency,
      status: "COMPLETED",
      isSettled: true,
      externalRef: `LEDGER-CHAPA-${bookingId}`,
      description: "Government bus ticket — full revenue to admin",
      metadata: {
        busId: booking.busId,
        scheduleId: booking.scheduleId,
        seats,
        gateway: payment.gateway,
        actualMethod,
        ownershipType: "GOVERNMENT",
      },
    },
  })

  // 4️⃣ Admin wallet credit
  const updatedAdmin = await tx.wallet.update({
    where: { id: ADMIN_WALLET_ID },
    data: { balance: { increment: payment.amount } },
  })

  await tx.walletTransaction.create({
    data: {
      walletId: ADMIN_WALLET_ID,
      amount: payment.amount,
      type: "PAYMENT_IN",
      status: "SUCCESS",
      balanceAfter: updatedAdmin.balance,
      reference: `TX-BUS-${bookingId}`,
      serviceType: "BUS_TICKET",
      description: `Government bus ticket revenue via ${actualMethod}`,
      metadata: {
        bookingId,
        paymentId: payment.id,
        gateway: payment.gateway,
      },
    },
  })

  // 5️⃣ Reward points
  await addPointsToUser({
    tx,
    userId: payment.userId,
    amount: 100,
    type: "EARN",
    reason: "Bus ticket booking reward",
    reference: `BOOKING_${bookingId}`,
    metadata: {
      bookingId,
      busId: booking.busId,
      seats,
    },
  })
}

const handleEvReservationPayment = async (tx, payment) => {
  const { reservationId } = payment.metadata || {}
  if (!reservationId)
    throw new Error("Reservation ID missing in payment metadata")

  const reservation = await tx.eVReservation.findUnique({
    where: { id: reservationId },
    include: {
      chargingPoint: {
        include: {
          station: {
            include: { manager: { include: { wallet: true } } },
          },
        },
      },
    },
  })
  if (!reservation) throw new Error("Reservation not found")
  if (reservation.paymentStatus === "SUCCESS") return // idempotent guard

  const totalPaid = Number(reservation.calculatedAmount)
  const commission = new Decimal(totalPaid * COMMISSION_RATE).toDecimalPlaces(2)
  const providerAmount = new Decimal(totalPaid)
    .minus(commission)
    .toDecimalPlaces(2)
  const managerWallet = reservation.chargingPoint.station.manager?.wallet
  if (!managerWallet) throw new Error("Manager wallet not found")

  // 1️⃣ Confirm reservation
  await tx.eVReservation.update({
    where: { id: reservationId },
    data: {
      status: "CONFIRMED",
      paymentStatus: "SUCCESS",
      isConnectorLocked: false,
    },
  })

  // 2️⃣ Update ledger to COMPLETED
  await tx.transactionLedger.updateMany({
    where: {
      referenceId: String(reservationId),
      referenceType: "EV_CHARGING_SESSION",
    },
    data: {
      status: "COMPLETED",
      isSettled: true,
    },
  })

  // 3️⃣ Admin wallet — commission
  const updatedAdmin = await tx.wallet.update({
    where: { id: ADMIN_WALLET_ID },
    data: { balance: { increment: commission } },
  })

  await tx.walletTransaction.create({
    data: {
      walletId: ADMIN_WALLET_ID,
      amount: commission,
      type: "COMMISSION",
      status: "SUCCESS",
      serviceType: "EV_CHARGING",
      balanceAfter: updatedAdmin.balance,
      reference: `TX-EV-ADMIN-${reservationId}`,
      description: "EV reservation commission via Chapa",
    },
  })

  // 4️⃣ Manager wallet — provider amount
  const updatedManager = await tx.wallet.update({
    where: { id: managerWallet.id },
    data: { balance: { increment: providerAmount } },
  })

  await tx.walletTransaction.create({
    data: {
      walletId: ADMIN_WALLET_ID,
      recipientWalletId: managerWallet.id,
      amount: providerAmount,
      type: "PAYMENT_OUT",
      status: "SUCCESS",
      serviceType: "EV_CHARGING",
      balanceAfter: updatedManager.balance,
      reference: `TX-EV-MGR-${reservationId}`,
      description: "EV reservation payout to station manager via Chapa",
    },
  })

  // 5️⃣ Loyalty points
  await addPointsToUser({
    tx,
    userId: payment.userId,
    amount: 100,
    type: "EARN",
    reason: "EV reservation reward",
    reference: `EV_RESERVATION_${reservationId}`,
    metadata: {
      reservationId,
      paymentId: payment.id,
    },
  })
}

// ---------------- MINIBUS BOOKING ----------------
const handleMinibusBookingPayment = async (tx, payment, bookingId) => {
  if (!bookingId) return

  await tx.minibusReservation.update({
    where: { id: parseInt(bookingId) },
    data: {
      status: "COMPLETED",
      exitTime: new Date(),
      durationMinutes: Math.round(duration),
      payments: {
        connect: { id: payment.id },
      },
    },
  })
}

// CHAPA INITIALIZATION
export const createChapaPayment = async (payment, user, options = {}) => {
  const nameParts = (user.name || "User").split(" ")

  const defaultCallbackUrl = `${process.env.BACKEND_NEGROK_URL}/api/payment/callback`
  const defaultReturnUrl = `${process.env.FRONTEND_URL}/payment/success?ref=${payment.reference}&amount=${payment.amount}&flow=${payment.flow}`

  const payload = {
    amount: payment.amount.toString(),
    currency: "ETB",
    email: user.email,
    first_name: nameParts[0],
    last_name: nameParts.slice(1).join(" ") || "Customer",
    phone_number: user.phone,
    tx_ref: payment.reference,
    callback_url: options.callbackUrl || defaultCallbackUrl,
    return_url: options.returnUrl || defaultReturnUrl,
    "customization[title]": "HabeshaGo Payment",
    "customization[description]": payment.metadata.type,
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

/* ==============================
   M-PESA TOPUP (UNCHANGED)
============================== */
export const mpesaTopUpService = async ({ amount, phone, userId }) => {
  try {
    if (!amount || amount <= 0) return errorResponse("Invalid amount", 400)

    if (!phone) return errorResponse("Phone number required", 400)

    const reference = crypto.randomBytes(8).toString("hex")

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

    const stkResponse = await stkPush({
      phone,
      amount,
      reference,
    })

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
      // await handleSuccessfulPayment(tx, payment)
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
