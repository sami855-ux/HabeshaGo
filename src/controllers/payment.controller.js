import {
  initiatePaymentService,
  paymentCallbackService,
  // getPaymentHistoryService,
  // verifyPaymentService,
  // getPaymentByReferenceService,
} from "../services/payment.service.js"

/**
 * Initiate payment with Chapa, Telebirr, or bank
 */
export const initiatePayment = async (req, res) => {
  try {
    // const userId = req.user?.id || req.body.userId // Get from auth middleware or request body
    const userId = "cmknyr7sc00005zku6ti238bw"

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
