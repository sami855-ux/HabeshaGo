import cron from "node-cron"

import {
  getUpcomingTrips,
  processEVRefund,
  processRefund,
  sendPassengerReminder,
} from "./cron-services.js"
import prisma from "../prisma/client.js"
import {
  completeEVChargingSessions,
  completeParkingSessions,
  completeTripsJob,
} from "./completeTrips.job.js"
import { startBusEtaNotificationJob } from "./busEtaNotification.job.js"

// Passenger reminders (24h & 2h before departure)
// Run every 15 mins
cron.schedule(
  "*/15 * * * *",
  async () => {
    try {
      console.log("🕒 Running passenger reminders...")

      const trips = await getUpcomingTrips()
      console.log(`🕒 Upcoming trips: ${trips.length}`)

      const now = new Date()

      await Promise.all(
        trips.map(async (trip) => {
          try {
            const validDateTrip = trip.tickets[0]?.validUntil

            if (!validDateTrip) {
              console.warn(
                `⚠️ Trip ${trip.id} has no valid validUntil date. Skipping.`,
              )
              return
            }

            const diffMins = (new Date(validDateTrip) - now) / (1000 * 60)
            console.log(
              `🗓️ Trip ${trip.id} — ${diffMins.toFixed(1)} mins until departure`,
            )

            if (diffMins <= 1440 && diffMins > 0 && !trip.reminder24Sent) {
              await sendPassengerReminder(trip, "24h")
              console.log(`✅ 24h reminder sent for trip ${trip.id}`)
            }

            if (diffMins <= 120 && diffMins > 0 && !trip.reminder2hSent) {
              await sendPassengerReminder(trip, "2h")
              console.log(`✅ 2h reminder sent for trip ${trip.id}`)
            }
          } catch (tripErr) {
            console.error(`❌ Failed to process trip ${trip.id}:`, tripErr)
          }
        }),
      )
    } catch (err) {
      console.error("❌ Passenger reminders failed:", err)
    }
  },
  { timezone: "Africa/Addis_Ababa" },
)

// Daily revenue calculation
// Run daily at 2:00 AM
cron.schedule(
  "0 2 * * *",
  async () => {
    try {
      console.log("🕒 Calculating daily revenue...")
      await calculateDailyRevenue()
    } catch (err) {
      console.error("❌ Daily revenue calculation failed:", err)
    }
  },
  { timezone: "Africa/Addis_Ababa" },
)

//Bus ticketing
cron.schedule("*/5 * * * *", async () => {
  const now = new Date()

  const expiredTickets = await prisma.ticket.findMany({
    where: {
      validUntil: { lt: now },
      checkedIn: false,
      refundProcessed: false,
    },
    include: {
      booking: true,
    },
  })

  for (const ticket of expiredTickets) {
    await processRefund(ticket.booking)

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { refundProcessed: true },
    })
  }
})

//EV refunded
cron.schedule("*/1 * * * *", async () => {
  const now = new Date()

  const expiredReservations = await prisma.eVReservation.findMany({
    where: {
      endTime: { lt: now },
      isUsed: false,
      refundProcessed: false,
      paymentStatus: "SUCCESS",
    },
  })

  for (const reservation of expiredReservations) {
    await processEVRefund(reservation)

    await prisma.eVReservation.update({
      where: { id: reservation.id },
      data: {
        refundProcessed: true,
        paymentStatus: "REFUNDED",
        status: "EXPIRED",
      },
    })
  }
})

cron.schedule("*/1 * * * *", async () => {
  console.log("Running trip completion job...")
  await completeTripsJob()
  // await completeEVChargingSessions()
  // await completeParkingSessions()
})

startBusEtaNotificationJob()
