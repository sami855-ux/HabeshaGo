import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { handleSuccessfulTopup } from "../utils/paymentHelper.js";
import prisma from "../prisma/client.js";
import chapa from "../config/chapa.js";
import crypto from "crypto";
import { stkPush } from "./mpesa.service.js";

/* ==============================
   GENERATE REFERENCE
============================== */
const generateReference = (prefix = "payment") =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

/* ==============================
   INITIATE PAYMENT
============================== */
export const initiatePaymentService = async (
  userId,
  { amount, gateway, type, flow, bookingId, sessionId, userInfo },
) => {
  try {
    if (!amount || amount <= 0) return errorResponse("Invalid amount", 400);

    if (!gateway) return errorResponse("Payment gateway is required", 400);

    if (!type) return errorResponse("Payment type is required", 400);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (!user) return errorResponse("User not found", 404);

    const reference = generateReference(type.toLowerCase());

    // CREATE PAYMENT RECORD
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: parseFloat(amount),
        currency: "ETB",
        gateway: "CHAPA",
        method: "WALLET",
        status: "PENDING",
        flow,
        reference,

        metadata: {
          type,
          bookingId: bookingId || null,
          sessionId: sessionId || null, // 🔥 PARKING SUPPORT
          preferredMethod: userInfo?.preferredMethod || null,
          userInfo: {
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
        },
      },
    });

    if (gateway.toLowerCase() !== "chapa")
      return errorResponse("Unsupported gateway", 400);

    const chapaResult = await createChapaPayment(payment, user);

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
    );
  } catch (error) {
    console.error("Initiate payment error:", error);
    return errorResponse("Failed to initiate payment", 500);
  }
};

/* ==============================
   CHAPA CALLBACK
============================== */
export const paymentCallbackService = async (data) => {
  try {
    const reference = data.tx_ref || data.trx_ref;

    if (!reference) return errorResponse("Transaction reference missing", 400);

    const payment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (!payment) return errorResponse("Payment not found", 404);

    if (payment.status === "SUCCESS")
      return successResponse("Payment already processed");

    const verification = await chapa.verify(reference);

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
      });

      return errorResponse("Payment verification failed", 400);
    }

    const actualMethod =
      verification.data.payment_method ||
      verification.data.channel ||
      "UNKNOWN";

    await prisma.$transaction(async (tx) => {
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
      });

      await handleSuccessfulPayment(tx, payment);
    });

    return successResponse("Payment processed successfully", {
      reference,
      amount: payment.amount,
      method: actualMethod,
    });
  } catch (error) {
    console.error("Payment callback error:", error);
    return errorResponse("Failed to process payment", 500);
  }
};

/* ==============================
   HANDLE SUCCESS PAYMENT
============================== */
const handleSuccessfulPayment = async (tx, payment) => {
  const { type, bookingId, sessionId } = payment.metadata;

  switch (type) {
    case "WALLET_TOPUP":
      return handleSuccessfulTopup(tx, payment);

    case "BUS_BOOKING":
      return handleBusBookingPayment(tx, payment, bookingId);

    case "MINIBUS_BOOKING":
      return handleMinibusBookingPayment(tx, payment, bookingId);

    // 🚗 PARKING PAYMENT
    case "PARKING_PAYMENT":
      return handleParkingPayment(tx, payment, sessionId);

    default:
      console.warn("Unhandled payment type:", type);
  }
};

/* ==============================
   PARKING PAYMENT HANDLER
============================== */
const handleParkingPayment = async (tx, payment, sessionId) => {
  if (!sessionId) return;

  const session = await tx.parkingSession.findUnique({
    where: { id: sessionId },
    include: {
      slot: { include: { parkingLot: true } },
    },
  });

  if (!session) throw new Error("Parking session not found");

  const pricePerMinute = session.slot.parkingLot.pricePerMinute;

  const duration = (new Date().getTime() - session.entryTime.getTime()) / 60000;

  const cost = duration * pricePerMinute;

  await tx.parkingSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      exitTime: new Date(),
      durationMinutes: Math.round(duration),
      payments: {
        connect: { id: payment.id },
      },
    },
  });
};

/* ==============================
   CHAPA INIT
============================== */
const createChapaPayment = async (payment, user) => {
  const nameParts = (user.name || "User").split(" ");

  const payload = {
    amount: payment.amount.toString(),
    currency: "ETB",

    email: user.email,
    first_name: nameParts[0],
    last_name: nameParts.slice(1).join(" ") || "Customer",
    phone_number: user.phone,

    tx_ref: payment.reference,
    callback_url: "http://localhost:5000/api/payments/callback",
    return_url: `http://localhost:3000/payment/success?ref=${payment.reference}`,

    "customization[title]": "Parking System Payment",
    "customization[description]": payment.metadata.type,

    "meta[payment_id]": payment.id.toString(),
    "meta[user_id]": payment.userId.toString(),
    "meta[type]": payment.metadata.type,
  };

  const response = await chapa.initialize(payload);

  if (response.status !== "success")
    throw new Error(response.message || "Chapa init failed");

  return {
    paymentUrl: response.data.checkout_url,
  };
};

/* ==============================
   M-PESA TOPUP (UNCHANGED)
============================== */
export const mpesaTopUpService = async ({ amount, phone, userId }) => {
  try {
    if (!amount || amount <= 0) return errorResponse("Invalid amount", 400);

    if (!phone) return errorResponse("Phone number required", 400);

    const reference = crypto.randomBytes(8).toString("hex");

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
    });

    const stkResponse = await stkPush({
      phone,
      amount,
      reference,
    });

    return successResponse("STK push initiated", {
      reference,
      response: stkResponse,
    });
  } catch (error) {
    console.error("M-Pesa error:", error);
    return errorResponse("Failed M-Pesa payment", 500);
  }
};
