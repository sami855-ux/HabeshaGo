import {
  initiatePaymentService,
  // mpesaCallbackService,
  mpesaTopUpService,
  paymentCallbackService,
} from "../services/payment.service.js"

/**
 * ==============================
 * INITIATE PAYMENT (ALL TYPES)
 * ==============================
 */
export const initiatePayment = async (req, res) => {
  try {
    const userId = req.user?.id || "cmknyr7sc00005zku6ti238bw"

    if (!userId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User authentication required",
      })
    }

    const result = await initiatePaymentService(userId, req.body)

    return res.status(result.statusCode || 200).json(result)
  } catch (error) {
    console.error("Initiate payment error:", error)

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while initiating payment",
    })
  }
}

/**
 * ==============================
 * PAYMENT CALLBACK (CHAPA)
 * ==============================
 */
export const paymentCallback = async (req, res) => {
  try {
    console.log("Payment callback received:", req.body)

    const result = await paymentCallbackService(req.body)

    return res.status(result.statusCode || 200).json(result)
  } catch (error) {
    console.error("Payment callback error:", error)

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error during payment callback",
    })
  }
}

/**
 * ==============================
 * GET PAYMENT HISTORY
 * ==============================
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User authentication required",
      })
    }

    // TODO: later you can implement service
    return res.status(200).json({
      success: true,
      message: "Payment history endpoint ready (service pending)",
    })
  } catch (error) {
    console.error("Payment history error:", error)

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}

/**
 * ==============================
 * M-PESA TOPUP
 * ==============================
 */
export const topUpMpesa = async (req, res) => {
  try {
    const { amount, phone } = req.body
    const userId = req.user?.id || "cmknyr7sc00005zku6ti238bw"

    const result = await mpesaTopUpService({
      amount,
      phone,
      userId,
    })

    return res.status(result.statusCode || 200).json(result)
  } catch (error) {
    console.error("M-Pesa topup error:", error)

    return res.status(500).json({
      success: false,
      message: "Internal server error during M-Pesa top-up",
    })
  }
}

/**
 * ==============================
 * M-PESA CALLBACK
 * ==============================
 */
export const mpesaCallback = async (req, res) => {
  try {
    console.log("M-Pesa callback received:", req.body)

    const result = await mpesaCallbackService(req.body)

    return res.status(result.statusCode || 200).json(result)
  } catch (error) {
    console.error("M-Pesa callback error:", error)

    return res.status(500).json({
      success: false,
      message: "Internal server error during M-Pesa callback",
    })
  }
}

/**
 * ==============================
 * PARKING PAYMENT (NEW)
 * ==============================
 * 👉 THIS IS WHAT YOU ASKED FOR
 */
export const payForParking = async (req, res) => {
  try {
    const userId = req.user?.id
    const { sessionId, amount } = req.body

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!sessionId || !amount) {
      return res.status(400).json({
        success: false,
        message: "sessionId and amount are required",
      })
    }

    const result = await initiatePaymentService(userId, {
      amount,
      gateway: "CHAPA",
      type: "PARKING_PAYMENT",
      flow: "PARKING_PAYMENT",
      bookingId: sessionId, // we reuse bookingId field for session
    })

    return res.status(result.statusCode || 200).json(result)
  } catch (error) {
    console.error("Parking payment error:", error)

    return res.status(500).json({
      success: false,
      message: "Failed to process parking payment",
    })
  }
}

/**
 * Telebirr Top-up
 */
// export const topUpTelebirr = async (req, res) => {
//   try {
//     const { amount, phone } = req.body;
//     const userId = req.user.id;

//     const result = await telebirrTopUpService({ amount, phone, userId });
//     return res.status(result.statusCode).json(result);
//   } catch (error) {
//     console.error("Telebirr Top-up controller error:", error);
//     return res.status(500).json({
//       success: false,
//       statusCode: 500,
//       message: "Internal server error during Telebirr top-up",
//       data: null,
//     });
//   }
// };

/**
 * Telebirr Callback
 */
// export const telebirrCallback = async (req, res) => {
//   try {
//     console.log("Received Telebirr callback:", req.body);
//     const result = await telebirrCallbackService(req.body);
//     return res.status(result.statusCode).json(result);
//   } catch (error) {
//     console.error("Telebirr callback controller error:", error);
//     return res.status(500).json({
//       success: false,
//       statusCode: 500,
//       message: "Internal server error during Telebirr callback",
//       data: null,
//     });
//   }
// };
