import prisma from "../prisma/client.js"
import { emitToUserNotification } from "../socket/index.js"

/**
 * Get all upcoming trips for all users
 * Only trips that are confirmed, not cancelled, and in the future
 */
export const getUpcomingTrips = async () => {
  try {
    const now = new Date()

    const trips = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        date: {
          gte: now,
        },
        tickets: {
          some: {
            cancelledAt: null,
          },
        },
      },

      include: {
        bus: true,
        user: true,
        schedule: true,
        payment: true,

        tickets: {
          where: {
            cancelledAt: null,
          },
        },
      },

      orderBy: {
        date: "asc",
      },
    })

    return trips
  } catch (err) {
    console.error("Error fetching upcoming trips:", err)
    throw err
  }
}

/**
 * Send a passenger reminder by creating a Notification record
 * @param {Object} booking - Booking object
 * @param {string} type - "24h" or "2h"
 */
export const sendPassengerReminder = async (booking, type) => {
  try {
    if (!booking?.userId) throw new Error("Booking has no associated user.")

    console.log("first")
    // Prepare notification content
    const title =
      type === "24h"
        ? "Upcoming Trip Reminder (24 hours)"
        : "Upcoming Trip Reminder (2 hours)"

    const message = `Hello ${booking.user.name || "Passenger"}, your trip on ${booking.date.toLocaleString()} for bus ${booking.bus.busNumber} is coming up soon.`

    // Create a notification record in the database
    const notification = await prisma.notification.create({
      data: {
        userId: booking.userId,
        title,
        message,
        type: "REMINDER",
        metadata: {
          bookingId: booking.id,
          busId: booking.busId,
          scheduleId: booking.scheduleId,
        },
      },
    })

    // 3️⃣ Emit real-time event
    emitToUserNotification(booking.userId, {
      notification,
    })

    // Optionally update booking to mark that reminder has been sent
    if (type === "24h") {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminder24Sent: true },
      })
    } else if (type === "2h") {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminder2hSent: true },
      })
    }

    console.log(
      `✅ Passenger reminder (${type}) sent for booking ${booking.id}`,
    )
  } catch (err) {
    console.error("❌ Failed to send passenger reminder:", err)
  }
}

export const processRefund = async (booking) => {
  try {
    if (!booking?.paymentId) return

    const payment = await prisma.payment.findUnique({
      where: { id: booking.paymentId },
    })

    // 1. Safety checks (idempotency)
    if (!payment || payment.status === "REFUNDED") return

    const refundAmount = Number(booking.amountPaid || 0)
    if (refundAmount <= 0) return

    // 2. Run everything in a transaction
    await prisma.$transaction(async (tx) => {
      // 🔹 WALLET REFUND
      if (payment.method === "WALLET") {
        const wallet = await tx.wallet.findUnique({
          where: { userId: booking.userId },
        })

        if (!wallet) throw new Error("Wallet not found")

        // Prevent duplicate transaction (extra safety)
        const existingTx = await tx.walletTransaction.findFirst({
          where: {
            reference: `BOOKING_REFUND_${booking.id}_${payment.id}`,
          },
        })

        if (!existingTx) {
          const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: {
                increment: refundAmount,
              },
            },
          })

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: refundAmount,
              recipientWalletId: wallet.id,
              type: "REFUND",
              status: "SUCCESS",
              serviceType: "BUS_TICKET",
              balanceAfter: updatedWallet.balance,
              reference: `BOOKING_REFUND_${booking.id}_${payment.id}`,
              description: `Refund for booking ${booking.bookingCode}`,
              metadata: {
                bookingId: booking.id,
                paymentId: payment.id,
              },
            },
          })
        }
      }

      // 🔹 CHAPA REFUND (example)
      if (payment.method === "CHAPA") {
        // await chapa.refund(payment.transactionId)
        console.log("Trigger Chapa refund:", payment.id)
      }

      // 3. Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "REFUNDED",
        },
      })

      // 4. Update booking
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          refundStatus: "FULL",
          refundedAt: new Date(),
        },
      })

      await prisma.$transaction(async (tx) => {
        await createNotification({
          tx,
          userId: booking.userId,
          title: "Refund Completed Successfully",
          message: `Your refund of ${refundAmount} ETB for the bus booking (Reference Code: ${booking.bookingCode}) has been successfully processed. The refunded amount has been credited to your original payment method.`,
          type: "PAYMENT",
          metadata: {
            serviceType: "BUS_BOOKING",
            amount: refundAmount,
            bookingCode: booking.bookingCode,
          },
        })
      })
    })

    console.log(`Refund processed for booking ${booking.id}`)
  } catch (error) {
    console.error("Booking Refund Error:", error)
  }
}

export const processEVRefund = async (reservation) => {
  try {
    // 1. Safety check (idempotency)
    if (!reservation || reservation.paymentStatus === "REFUNDED") {
      return
    }

    // 2. Get related payments
    const payments = await prisma.payment.findMany({
      where: {
        evReservationId: reservation.id,
        status: "SUCCESS",
      },
    })

    if (!payments.length) {
      console.log(
        `No completed payment found for reservation ${reservation.id}`,
      )
      return
    }

    // 3. Calculate total refundable amount
    const totalAmount = payments.reduce((sum, p) => {
      return sum + Number(p.amount || 0)
    }, 0)

    if (totalAmount <= 0) return

    await prisma.$transaction(async (tx) => {
      for (const payment of payments) {
        // Prevent double refund
        if (payment.status === "REFUNDED") continue

        let refundAmount
        // WALLET REFUND
        if (payment.method === "WALLET") {
          const wallet = await tx.wallet.findUnique({
            where: { userId: reservation.userId },
          })
          if (!wallet) {
            throw new Error("Wallet not found")
          }

          refundAmount = Number(payment.amount)

          // 1. Update wallet balance
          const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: {
                increment: refundAmount,
              },
            },
          })

          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: refundAmount,
              recipientWalletId: wallet.id,
              type: "REFUND",
              status: "SUCCESS",
              serviceType: "EV_CHARGING", // or BOOKING if bus
              balanceAfter: updatedWallet.balance,
              reference: `EV_REFUND_${reservation.id}_${Date.now()}`,
              description: `Refund for EV reservation ${reservation.reservationCode}`,
              metadata: {
                reservationId: reservation.id,
                paymentId: payment.id,
              },
            },
          })
        }

        // CHAPA REFUND (example placeholder)
        if (payment.method === "CHAPA") {
          // await chapa.refund(payment.transactionId)
          console.log("Trigger Chapa refund:", payment.id)
        }

        // Update payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "REFUNDED",
          },
        })

        await prisma.$transaction(async (tx) => {
          await createNotification({
            tx,
            userId: reservation.userId,
            title: "Refund Completed Successfully",
            message: `Your refund of ${refundAmount} ETB for the EV charging reservation (Reference Code: ${reservation.reservationCode}) has been successfully processed. The refunded amount has been credited to your original payment method.`,
            type: "PAYMENT",
            metadata: {
              amount: refundAmount,
              reservationCode: reservation.reservationCode,
            },
          })
        })
      }
    })

    console.log(`Refund processed for EV reservation ${reservation.id}`)
  } catch (error) {
    console.error("EV Refund Error:", error)
  }
}

export const createNotification = async ({
  tx, // optional (for transaction)
  userId,
  title,
  message,
  type = "GENERAL",
  actionUrl = null,
  metadata = {},
}) => {
  try {
    const db = tx || prisma // use transaction if provided

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        actionUrl,
        metadata,
      },
    })

    // Emit real-time event
    emitToUserNotification(userId, {
      notification,
    })

    return notification
  } catch (error) {
    console.error("Notification Error:", error)
  }
}
