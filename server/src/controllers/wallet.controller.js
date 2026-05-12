import {
  changeWalletPinService,
  createWalletService,
  deductFromWalletService,
  deductPointsService,
  enableWalletBiometricService,
  getMyWalletService,
  getWalletTransactionsService,
  payParkingSessionFromWallet,
  depositToWalletService, 
} from "../services/wallet.service.js";

// ===============================
// GET MY WALLET
// ===============================
export const getMyWallet = async (req, res) => {
  try {
    const result = await getMyWalletService(req.user.id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Get wallet controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching wallet",
    });
  }
};

// ===============================
// WALLET TRANSACTIONS
// ===============================
export const getWalletTransactions = async (req, res) => {
  try {
    const result = await getWalletTransactionsService(req.user?.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get wallet transactions controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching wallet transactions",
    });
  }
};

// ===============================
// CREATE WALLET
// ===============================
export const createWallet = async (req, res) => {
  try {
    const result = await createWalletService(req.user.id, req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Wallet creation controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating wallet",
    });
  }
};

// ===============================
// ENABLE BIOMETRIC
// ===============================
export const enableWalletBiometric = async (req, res) => {
  try {
    const result = await enableWalletBiometricService(req.user.id, req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Wallet biometric controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while enabling biometric",
    });
  }
};

// ===============================
// CHANGE PIN
// ===============================
export const changeWalletPin = async (req, res) => {
  try {
    const { newPin } = req.body;

    if (!newPin) {
      return res.status(400).json({
        success: false,
        message: "New PIN is required",
      });
    }

    const result = await changeWalletPinService(req.user.id, newPin);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Change wallet PIN error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change wallet PIN",
    });
  }
};

export const depositToWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    const result = await depositToWalletService(req.user.id, amount);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Deposit controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Deposit failed",
    });
  }
};
// ===============================
// DEDUCT POINTS
// ===============================
export const deductPoints = async (req, res) => {
  try {
    const { points, reason } = req.body;

    const result = await deductPointsService(req.user.id, points, reason);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Deduct points controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deducting points",
    });
  }
};

// ===============================
// DEDUCT FROM WALLET (GENERAL)
// ===============================
export const deductFromWallet = async (req, res) => {
  try {
    const result = await deductFromWalletService(req.user.id, req.body);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Wallet deduct controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deducting wallet",
    });
  }
};

// ===============================
// 🚀 NEW: PARKING PAYMENT CONTROLLER
// ===============================
export const payParkingSession = async (req, res) => {
  try {
    const { sessionId, amount } = req.body;

    if (!sessionId || !amount) {
      return res.status(400).json({
        success: false,
        message: "sessionId and amount are required",
      });
    }

    const result = await payParkingSessionFromWallet(
      req.user.id,
      sessionId,
      amount,
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Parking payment controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process parking payment",
    });
  }
};
