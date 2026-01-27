import {
  transferFundsService,
  payFromWalletService,
  getTransactionHistoryService,
} from "../services/transaction.service.js"

/**
 * Wallet-to-wallet transfer
 */
export const transferFunds = async (req, res) => {
  try {
    console.log(req.body)
    const result = await transferFundsService(req.user.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Transfer controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error during transfer",
      data: null,
    })
  }
}

/**
 * Pay from wallet
 */
export const payFromWallet = async (req, res) => {
  try {
    const result = await payFromWalletService(req.user.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Pay from wallet controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error during wallet payment",
      data: null,
    })
  }
}

/**
 * Get internal wallet transaction history
 */
export const getTransactionHistory = async (req, res) => {
  try {
    const result = await getTransactionHistoryService()
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get transaction history controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching transactions",
      data: null,
    })
  }
}
