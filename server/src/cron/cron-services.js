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
