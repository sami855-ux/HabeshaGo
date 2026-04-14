import { TransactionType, TransactionStatus, ServiceType } from "@prisma/client"

export const handleSuccessfulTopup = async (tx, payment) => {
  // 1️⃣ Update Wallet balance if linked
  if (payment.walletId) {
    const wallet = await tx.wallet.update({
      where: { id: payment.walletId },
      data: { balance: { increment: payment.amount } },
    })

    // 2️⃣ Create WalletTransaction
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        recipientWalletId: null, // top-ups have no recipient
        amount: payment.amount,
        type: TransactionType.CREDIT, // top-up is credit
        status: TransactionStatus.SUCCESS, // since payment succeeded
        serviceType: ServiceType.WALLET_TOPUP, // custom enum for top-up
        balanceAfter: wallet.balance,
        reference: payment.reference,
        description: "Wallet top-up via " + payment.gateway,
        metadata: payment.metadata,
      },
    })

    // 3️⃣ Add 50 reward points
    const pointsToAdd = 50
    wallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { points: { increment: pointsToAdd } },
    })

    // 4️⃣ Record in PointTransaction
    await tx.pointTransaction.create({
      data: {
        walletId: wallet.id,
        amount: pointsToAdd,
        type: "EARNED", // you can convert to enum PointTransactionType if defined
        reason: "Reward points for successful wallet top-up",
      },
    })
  }
}
