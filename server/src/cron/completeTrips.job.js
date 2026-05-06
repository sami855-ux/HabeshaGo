import prisma from "../prisma/client.js"
import { addPointsToUser } from "../services/wallet.service.js"
import { emitTripCompleted } from "../socket/index.js"
import { createNotification } from "./cron-services.js"

export const completeTripsJob = async () => {
  try {
    const now = new Date()

    const bookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
      },
      include: {
        schedule: true,
        bus: true,
        tickets: true,
      },
    })

    for (const booking of bookings) {
      const bus = booking.bus
      const schedule = booking.schedule

      // 🧠 1. Check destination match
      const reachedDestination =
        bus.currentStop &&
        booking.tickets?.some(
          (t) =>
            t.alightingStop &&
            t.alightingStop.toLowerCase().trim() ===
              bus.currentStop.toLowerCase().trim(),
        )

      // 🧠 2. Check time-based completion
      // const timeCompleted = new Date(schedule.endTime) < now

      // 🚫 skip if not finished
      if (!reachedDestination) {
        continue
      }

      // 🧠 3. Only valid (checked-in) tickets
      const validTickets =
        booking.tickets?.filter((t) => t.checkedIn && !t.cancelledAt) || []

      if (validTickets.length === 0) {
        console.log(`Skipping booking ${booking.id} - no checked-in passengers`)
        continue
      }

      let updatedBooking = null

      // 4️⃣ DATABASE TRANSACTION (ONLY DB OPERATIONS)
      await prisma.$transaction(async (tx) => {
        // mark booking completed
        updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: { status: "COMPLETED" },
        })

        // reward ONLY checked-in users
        for (const ticket of validTickets) {
          await addPointsToUser({
            tx,
            userId: ticket.userId,
            amount: 30,
            type: "EARN",
            reason: "Trip completed after check-in",
            reference: `TICKET_${ticket.id}`,
            metadata: {
              bookingId: booking.id,
              ticketId: ticket.id,
            },
          })
        }

        // create notification for booking owner
        await createNotification({
          tx,
          userId: booking.userId,
          title: "Trip Completed 🎉",
          message: `Your trip (${booking.bookingCode}) has ended successfully.`,
          type: "TRIP",
          metadata: {
            bookingId: booking.id,
            busId: booking.busId,
          },
        })
      })

      // 5️⃣ SOCKET EMIT (AFTER TRANSACTION)
      emitTripCompleted(booking.userId, {
        type: "BUS",
        id: booking.id,

        reward: {
          points: validTickets.length * 30,
        },

        message: "Trip completed successfully",
        completedAt: new Date(),
        metadata: {
          busId: booking.busId,
          busNumber: booking.bus?.busNumber,
          routeName: `${booking.tickets.at(0).alightingStop} to ${booking.tickets.at(0).boardingStop}`,
        },
      })

      console.log(`Trip completed: ${booking.id}`)
    }
  } catch (error) {
    console.error("Trip completion job error:", error)
  }
}

export const completeEVChargingSessions = async () => {
  const now = new Date()

  const sessions = await prisma.chargingSession.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      chargingPoint: true,
    },
  })

  for (const session of sessions) {
    // ✅ smarter completion logic
    const isCompleted =
      (session.endTime && session.endTime < now) ||
      (session.meterEnd && session.meterStart)

    if (!isCompleted) continue

    await prisma.$transaction(async (tx) => {
      const durationMinutes = Math.floor(
        (now - new Date(session.startTime)) / (1000 * 60),
      )

      // fallback if meterEnd missing
      const meterEnd = session.meterEnd ?? session.meterStart

      const energyConsumed =
        session.energyConsumedKwh ??
        (meterEnd && session.meterStart ? meterEnd - session.meterStart : 0)

      // 1️⃣ update session
      await tx.chargingSession.update({
        where: { id: session.id },
        data: {
          status: "COMPLETED",
          endTime: session.endTime ?? now,
          durationMinutes,
          meterEnd,
          energyConsumedKwh: energyConsumed,
        },
      })

      // 2️⃣ free charging point
      await tx.chargingPoint.update({
        where: { id: session.chargingPointId },
        data: {
          status: "AVAILABLE",
        },
      })

      // 3️⃣ reward user
      await addPointsToUser({
        tx,
        userId: session.userId,
        amount: 20,
        type: "EARN",
        reason: "EV charging completed",
        reference: `EV_${session.id}`,
      })

      // 4️⃣ notify
      await createNotification({
        tx,
        userId: session.userId,
        title: "Charging Complete ⚡",
        message: `Your charging session at ${session.chargingPointId} has finished.`,
        type: "EV",
        metadata: {
          sessionId: session.id,
          stationId: session.stationId,
        },
      })
    })

    // 5️⃣ socket
    emitTripCompleted(session.userId, {
      type: "EV_CHARGING",
      id: session.id,

      reward: {
        points: 20,
      },

      message: "Charging session completed",
      completedAt: new Date(),
    })
  }
}

export const completeParkingSessions = async () => {
  const now = new Date()

  const sessions = await prisma.parkingSession.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      slot: {
        include: {
          parkingLot: true,
        },
      },
      parkingReservation: true,
    },
  })

  for (const session of sessions) {
    const isCompleted =
      (session.exitTime && session.exitTime < now) ||
      session.status === "COMPLETED"

    if (!isCompleted) continue

    await prisma.$transaction(async (tx) => {
      const exitTime = session.exitTime ?? now

      const duration = Math.floor(
        (new Date(exitTime) - new Date(session.entryTime)) / (1000 * 60),
      )

      // 1️⃣ update session
      await tx.parkingSession.update({
        where: { id: session.id },
        data: {
          status: "COMPLETED",
          exitTime,
          duration,
        },
      })

      // 2️⃣ free slot
      await tx.parkingSlot.update({
        where: { id: session.slotId },
        data: {
          isOccupied: false,
          status: "AVAILABLE",
        },
      })

      // 3️⃣ increase available slots
      await tx.parkingLot.update({
        where: { id: session.slot.parkingLotId },
        data: {
          availableSlots: {
            increment: 1,
          },
        },
      })

      // 4️⃣ update reservation if exists
      if (session.parkingReservationId) {
        await tx.parkingReservation.update({
          where: { id: session.parkingReservationId },
          data: {
            status: "COMPLETED",
            checkOutTime: exitTime,
          },
        })
      }

      // 5️⃣ reward
      const userId = session.parkingReservation?.userId

      if (userId) {
        await addPointsToUser({
          tx,
          userId,
          amount: 10,
          type: "EARN",
          reason: "Parking session completed",
          reference: `PARK_${session.id}`,
        })

        await createNotification({
          tx,
          userId,
          title: "Parking Complete 🅿️",
          message: "Your parking session has ended.",
          type: "PARKING",
          metadata: {
            sessionId: session.id,
          },
        })
      }
    })

    // socket
    if (session.parkingReservation?.userId) {
      emitTripCompleted(userId, {
        type: "PARKING",
        id: session.id,
        reward: {
          points: 10,
        },
        message: "Parking session completed",
        completedAt: new Date(),
      })
    }
  }
}
