import {
  changeWalletPinService,
  createWalletService,
  enableWalletBiometricService,
  getMyWalletService,
  getWalletTransactionsService,
} from "../services/wallet.service.js"

/**
 * Get the logged-in user's wallet
 */
export const getMyWallet = async (req, res) => {
  try {
    const result = await getMyWalletService(req.user.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get wallet controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching wallet",
      data: null,
    })
  }
}

/**
 * Get wallet transactions for the logged-in user
 */
export const getWalletTransactions = async (req, res) => {
  try {
    const result = await getWalletTransactionsService(req.user.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get wallet transactions controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while fetching wallet transactions",
      data: null,
    })
  }
}

/**
 * Create wallet for logged-in user (with PIN)
 */
export const createWallet = async (req, res) => {
  try {
    const result = await createWalletService(req.user.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Wallet creation controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while creating wallet",
      data: null,
    })
  }
}

/**
 * Enable biometric authentication for wallet
 */
export const enableWalletBiometric = async (req, res) => {
  try {
    const result = await enableWalletBiometricService(req.user.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Wallet biometric controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while enabling biometric",
      data: null,
    })
  }
}

export const changeWalletPin = async (req, res) => {
  try {
    const userId = req.user.id
    const { newPin } = req.body

    if (!newPin) {
      return res.status(400).json({
        success: false,
        message: "New PIN is required",
      })
    }

    const result = await changeWalletPinService(userId, newPin)

    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Change wallet PIN error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to change wallet PIN",
    })
  }
}
