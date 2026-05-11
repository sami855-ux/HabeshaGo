import prisma from "../prisma/client.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import bcrypt from "bcrypt";
import { calculateCost } from "./parking.service.js";

const SALT_ROUNDS = 10;
const MAX_ATTEMPTS = 3;

// Helper: Verify wallet PIN + biometric
export const verifyWalletAuth = async (wallet, { pin, biometricToken }) => {
  if (wallet.isLocked) {
    return errorResponse(
      "Wallet is locked due to multiple failed attempts",
      423,
    );
  }

  // Biometric check first
  if (wallet.biometricEnabled && biometricToken) {
    if (wallet.biometricToken === biometricToken) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { pinAttempts: 0 },
      });
      return { success: true };
    }
  }

  // PIN fallback
  if (!pin) return errorResponse("PIN required if biometric not provided", 400);

  const isValid = await bcrypt.compare(pin, wallet.pinHash);
  if (!isValid) {
    const attempts = wallet.pinAttempts + 1;
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { pinAttempts: attempts, isLocked: attempts >= MAX_ATTEMPTS },
    });
    return errorResponse("Invalid wallet PIN", 401);
  }

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { pinAttempts: 0 },
  });

  return { success: true };
};

export const getMyWalletService = async (userId) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return errorResponse("Wallet not found", 404);
    }

    return successResponse("Wallet retrieved successfully", wallet, 200);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return errorResponse("Failed to fetch wallet", 500);
  }
};

export const getWalletTransactionsService = async (userId) => {
  try {
    // 1️⃣ Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wallet) {
      return errorResponse("Wallet not found", 404);
    }

    // 2️⃣ Fetch both
    const [walletTxs, pointTxs] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        include: {
          recipientWallet: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),

      prisma.pointTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // 3️⃣ Wallet transactions
    const formattedWallet = walletTxs.map((tx) => ({
      id: `wallet-${tx.id}`,
      walletId: tx.walletId,

      category: "WALLET",

      amount: tx.amount.toString(),
      type: tx.type, // keep original type
      status: tx.status,
      balanceAfter: tx.balanceAfter.toString(),
      reference: tx.reference,

      description:
        tx.description ||
        `${tx.type}`.charAt(0).toUpperCase() +
          `${tx.type}`.slice(1).toLowerCase() +
          " transaction",

      metadata: tx.metadata,
      createdAt: tx.createdAt,

      recipientName:
        tx.recipientWallet?.user?.id === userId
          ? "You"
          : tx.recipientWallet?.user?.name || null,
    }));

    // 4️⃣ Point transactions
    const formattedPoints = pointTxs.map((tx) => ({
      id: `point-${tx.id}`,
      walletId: tx.walletId,

      category: "POINT",

      amount: tx.amount.toString(),
      type: tx.type,

      status: "SUCCESS",

      // points don’t have balanceAfter → null for table
      balanceAfter: null,

      reference: null,

      description:
        tx.reason ||
        `${tx.type}`.charAt(0).toUpperCase() +
          `${tx.type}`.slice(1).toLowerCase() +
          " points",

      metadata: null,
      createdAt: tx.createdAt,

      recipientName: "You",
    }));

    // 5️⃣ Merge + sort
    const combined = [...formattedWallet, ...formattedPoints].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    // 6️⃣ Final format
    const finalTransactions = combined.map((tx) => ({
      ...tx,
      createdAt: new Date(tx.createdAt).toISOString(),
    }));

    return successResponse("Transactions retrieved successfully", {
      transactions: finalTransactions,
      total: finalTransactions.length,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return errorResponse("Failed to fetch transactions", 500);
  }
};

export const createWalletService = async (userId, { pin }) => {
  try {
    // Check if wallet exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId },
    });
    if (existingWallet) return errorResponse("Wallet already exists", 409);

    if (!pin || pin.length < 6) {
      return errorResponse("PIN is required and must be at 6 digits", 400);
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, SALT_ROUNDS);

    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: "ETB",
        pinHash,
        pinAttempts: 0,
        isLocked: false,
        isActive: true,
        biometricEnabled: false,
      },
    });

    return successResponse("Wallet created successfully", wallet, 201);
  } catch (error) {
    console.error("Error creating wallet:", error);
    return errorResponse("Failed to create wallet", 500);
  }
};

export const enableWalletBiometricService = async (
  userId,
  { biometricToken },
) => {
  try {
    // Find wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return errorResponse("Wallet not found", 404);

    if (!biometricToken)
      return errorResponse("Biometric token is required", 400);

    // Update wallet with biometric info
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        biometricEnabled: true,
        biometricToken, // store token (hashed or device-specific) for security
      },
    });

    return successResponse("Biometric enabled successfully", updatedWallet);
  } catch (error) {
    console.error("Error enabling biometric:", error);
    return errorResponse("Failed to enable biometric", 500);
  }
};

export const changeWalletPinService = async (userId, newPin) => {
  try {
    // Find wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wallet) {
      return errorResponse("Wallet not found", 404);
    }

    // Hash new PIN
    const pinHash = await bcrypt.hash(newPin, SALT_ROUNDS);

    // Update wallet PIN
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        pinHash,
      },
    });

    return successResponse(
      "Wallet PIN changed successfully",
      updatedWallet,
      200,
    );
  } catch (error) {
    console.error("Change wallet PIN service error:", error);
    return errorResponse("Failed to change wallet PIN", 500);
  }
};
export const depositToWalletService = async (userId, amount) => {
  try {
    if (!amount || amount <= 0) {
      return errorResponse("Invalid deposit amount", 400);
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) return errorResponse("Wallet not found", 404);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Add balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // 2. Log transaction
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount,
          type: "DEPOSIT",
          status: "SUCCESS",
          serviceType: "WALLET_TOPUP",
          balanceAfter: updatedWallet.balance,
          reference: `DEP-${Date.now()}`,
          description: "Wallet deposit",
        },
      });

      return { updatedWallet, transaction };
    });

    return successResponse("Deposit successful", result);
  } catch (error) {
    console.error("Deposit error:", error);
    return errorResponse("Deposit failed", 500);
  }
};

export const deductPointsService = async (userId, points, reason) => {
  try {
    if (!points || points <= 0) {
      return errorResponse("Invalid points amount", 400);
    }

    // 🔍 Get wallet using userId
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return errorResponse("Wallet not found", 404);
    }

    const authCheck = await verifyWalletAuth(wallet, auth);
    if (authCheck?.success === false) return authCheck;

    if (!wallet.isActive || wallet.isLocked) {
      return errorResponse("Wallet is locked or inactive", 403);
    }

    if (wallet.points < points) {
      return errorResponse("Insufficient points", 400);
    }

    // ⚡ Use transaction for consistency
    const updatedWallet = await prisma.$transaction(async (tx) => {
      // 1. Deduct points
      const walletUpdate = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          points: {
            decrement: points,
          },
        },
      });

      // 2. Log transaction
      await tx.pointTransaction.create({
        data: {
          walletId: wallet.id,
          amount: -points, // negative = deduction
          type: "SPEND",
          reason: reason || "Points redemption",
        },
      });

      return walletUpdate;
    });

    return successResponse("Points deducted successfully", updatedWallet, 200);
  } catch (error) {
    console.error("Deduct points service error:", error);
    return errorResponse("Failed to deduct points", 500);
  }
};

export const deductFromWalletService = async (userId, payload) => {
  try {
    const { amount, currency, description, metadata } = payload;

    if (!amount || amount <= 0) {
      return errorResponse("Invalid amount", 400);
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) return errorResponse("Wallet not found", 404);

    if (!wallet.isActive) {
      return errorResponse("Wallet is inactive", 403);
    }

    if (wallet.isLocked) {
      return errorResponse("Wallet is locked", 403);
    }

    if (wallet.balance < amount) {
      return errorResponse("Insufficient wallet balance", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: amount, // store positive for record clarity
          type: "PAYMENT_OUT",
          status: "SUCCESS",
          serviceType: "EV_CHARGING",
          balanceAfter: updatedWallet.balance,
          reference: `EV-${Date.now()}-${wallet.id}`,
          description,
          metadata,
        },
      });

      return { updatedWallet, transaction };
    });

    return successResponse("Wallet deducted successfully", result, 200);
  } catch (error) {
    console.error("Wallet deduction service error:", error);
    return errorResponse("Failed to deduct wallet", 500);
  }
};

export const addPointsToUser = async ({
  tx, // ✅ pass transaction
  userId,
  amount,
  type,
  reason,
  reference = null,
  metadata = null,
}) => {
  if (!tx) throw new Error("Transaction (tx) is required");

  const wallet = await tx.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) throw new Error("Wallet not found");

  const newBalance = wallet.points + amount;
  if (newBalance < 0) throw new Error("Insufficient points");

  const pointTx = await tx.pointTransaction.create({
    data: {
      walletId: wallet.id,
      amount,
      type,
      reason,
    },
  });

  await tx.wallet.update({
    where: { id: wallet.id },
    data: { points: newBalance },
  });

  return pointTx;
};

export const payParkingSessionFromWallet = async (
  userId,
  sessionId,
  cost,
  auth,
) => {
  try {
    if (!sessionId) {
      return errorResponse("Session ID is required", 400);
    }

    // Get parking session
    const session = await prisma.parkingSession.findUnique({
      where: { id: sessionId },
      include: {
        slot: {
          include: {
            parkingLot: true,
          },
        },
      },
    });

    if (!session) {
      return errorResponse("Session not found", 404);
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return errorResponse("Wallet not found", 404);
    }

    // Extract auth
    const { pin, biometricToken } = auth || {};

    // Verify wallet auth
    const authCheck = await verifyWalletAuth(wallet, {
      pin,
      biometricToken,
    });

    if (authCheck?.success === false) {
      return authCheck;
    }

    // Check balance
    if (wallet.balance < cost) {
      return errorResponse("Insufficient balance", 400);
    }

    const newBalance = wallet.balance - cost;

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
        },
      });

      const walletTx = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: cost,
          type: "PAYMENT_OUT",
          status: "SUCCESS",
          serviceType: "PARKING",
          balanceAfter: newBalance,
          reference: `PARK-${sessionId}-${Date.now()}`,
          description: "Parking session payment",
          metadata: {
            sessionId,
            parkingLotId: session.slot.parkingLot.id,
          },
          parkingSessionId: sessionId,
        },
      });

      return { updatedWallet, walletTx };
    });

    return successResponse("Parking payment successful", result);
  } catch (error) {
    console.error("Wallet parking payment error:", error);
    return errorResponse("Parking payment failed", 500);
  }
};