import {
  initiatePaymentService,
  mpesaCallbackService,
  mpesaTopUpService,
  paymentCallbackService,
  telebirrCallbackService,
  // getPaymentHistoryService,
  // verifyPaymentService,
  // getPaymentByReferenceService,
} from "../services/payment.service.js"

/**
 * Initiate payment with Chapa, Telebirr, or bank
 */
export const initiatePayment = async (req, res) => {
  try {
    const userId = req.user?.id
    // const userId = "cmo0c8ahn0000ux3k5gaga7dm"

    if (!userId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User authentication required",
        data: null,
      })
    }

    const result = await initiatePaymentService(userId, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Initiate payment controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while initiating payment",
      data: null,
    })
  }
}

/**
 * Payment gateway webhook callback (specifically for Chapa)
 */
export const paymentCallback = async (req, res) => {
  try {
    console.log("Received payment callback:", req.body)

    const result = await paymentCallbackService(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Payment callback controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error during payment callback",
      data: null,
    })
  }
}

export const telebirrPaymentCallback = async (req, res) => {
  try {
    console.log("Received Telebirr callback:", req.body)
    const result = await telebirrCallbackService(req.body)
    return res.status(200).json({ code: "0", message: "success" })
  } catch (error) {
    console.error("Telebirr callback controller error:", error)
    return res.status(500).json({
      code: "1",
      message: "error",
    })
  }
}

/**
 * Verify payment status
 */
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params

    if (!reference) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Payment reference is required",
        data: null,
      })
    }

    // const result = await verifyPaymentService(reference)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Verify payment controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while verifying payment",
      data: null,
    })
  }
}

/**
 * Get payment by reference
 */
export const getPaymentByReference = async (req, res) => {
  try {
    const { reference } = req.params

    if (!reference) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Payment reference is required",
        data: null,
      })
    }

    // const result = await getPaymentByReferenceService(reference)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get payment by reference controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching payment",
      data: null,
    })
  }
}

/**
 * Get payment history for logged-in user
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId // Get from auth middleware or query

    if (!userId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User authentication required",
        data: null,
      })
    }

    // Extract query filters
    const filters = {
      status: req.query.status,
      gateway: req.query.gateway,
      type: req.query.type,
      limit: req.query.limit,
      offset: req.query.offset,
    }

    // const result = await getPaymentHistoryService(userId, filters)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get payment history controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching payment history",
      data: null,
    })
  }
}

/**
 * M-PESA Top-up
 */
export const topUpMpesa = async (req, res) => {
  try {
    const { amount, phone } = req.body
    const userId = "cmknyr7sc00005zku6ti238bw"

    const result = await mpesaTopUpService({ amount, phone, userId })
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("M-Pesa Top-up controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error during M-Pesa top-up",
      data: null,
    })
  }
}

/**
 * M-PESA Callback
 */
export const mpesaCallback = async (req, res) => {
  try {
    console.log("Received M-Pesa callback:", req.body)
    const result = await mpesaCallbackService(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("M-Pesa callback controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error during M-Pesa callback",
      data: null,
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
