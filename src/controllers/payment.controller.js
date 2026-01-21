import {
  initiatePaymentService,
  paymentCallbackService,
  getPaymentHistoryService,
} from "../services/payment.service.js"

/**
 * Initiate payment with Chapa, Telebirr, or bank
 */
export const initiatePayment = async (req, res) => {
  try {
    const result = await initiatePaymentService(req.user.id, req.body)
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
 * Payment gateway webhook callback
 */
export const paymentCallback = async (req, res) => {
  try {
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
 * Get all external payments for logged-in user
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const result = await getPaymentHistoryService(req.user.id)
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
