// jobs/busEtaNotification.job.js
import cron from "node-cron"
import prisma from "../prisma/client.js"

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const estimateMinutes = (distanceKm, speedKmh = 30) => {
  const speed = speedKmh > 0 ? speedKmh : 30
  return Math.round((distanceKm / speed) * 60)
}

const shouldNotify = (minutes) => {
  return [30, 20, 15, 10, 5, 4, 2].includes(minutes)
}

export const runBusEtaNotificationJob = async () => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // 1. Active buses
    const activeBuses = await prisma.bus.findMany({
      where: {
        isActive: true,
        status: "ACTIVE",
        driver: { isOnDuty: true },
      },
      select: {
        id: true,
        busNumber: true,
        route: {
          select: {
            midPoints: {
              orderBy: { order: "asc" },
              select: { name: true, lat: true, lng: true, order: true },
            },
          },
        },
      },
    })

    console.log(`[ETA Job] Active buses found: ${activeBuses.length}`)

    if (activeBuses.length === 0) {
      console.log("[ETA Job] No active buses with drivers on duty — exiting")
      return
    }

    for (const bus of activeBuses) {
      console.log(
        `\n[ETA Job] ── Processing bus: ${bus.busNumber} (id: ${bus.id})`,
      )

      // 2. Latest position
      const latestPosition = await prisma.busPosition.findFirst({
        where: { busId: bus.id },
        orderBy: { timestamp: "desc" },
        select: { latitude: true, longitude: true, timestamp: true },
      })

      if (!latestPosition) {
        console.log(
          `[ETA Job]   ✗ No GPS position found for bus ${bus.busNumber} — skipping`,
        )
        continue
      }

      console.log(
        `[ETA Job]   ✓ Latest position: (${latestPosition.latitude}, ${latestPosition.longitude}) at ${latestPosition.timestamp}`,
      )

      // Check position age
      const positionAgeMs =
        Date.now() - new Date(latestPosition.timestamp).getTime()
      const positionAgeMin = Math.round(positionAgeMs / 60000)

      if (positionAgeMs > 60 * 60 * 1000) {
        console.log(
          `[ETA Job]   ✗ Position is ${positionAgeMin} min old (> 5 min) — bus may be offline, skipping`,
        )
        continue
      }

      console.log(`[ETA Job]   ✓ Position age: ${positionAgeMin} min — fresh`)

      // Speed
      const latestVehicleLocation = await prisma.vehicleLocation.findFirst({
        where: { vehicle: { buses: { some: { id: bus.id } } } },
        orderBy: { recordedAt: "desc" },
        select: { speed: true },
      })

      const currentSpeedKmh = latestVehicleLocation?.speed ?? 30
      console.log(
        `[ETA Job]   ✓ Speed: ${currentSpeedKmh} km/h ${latestVehicleLocation?.speed ? "(from GPS)" : "(fallback default)"}`,
      )

      // 3. Tickets
      const tickets = await prisma.ticket.findMany({
        where: {
          cancelledAt: null,
          checkedIn: false,
          booking: {
            busId: bus.id,
            status: "CONFIRMED",
            date: { gte: todayStart },
          },
        },
        select: {
          id: true,
          userId: true,
          boardingStop: true,
        },
      })

      console.log(
        `[ETA Job]   ✓ Pending tickets (not checked in): ${tickets.length}`,
      )

      if (tickets.length === 0) {
        console.log(`[ETA Job]   ✗ No pending tickets — skipping`)
        continue
      }

      // 4. Midpoint map
      const midPointMap = {}
      if (bus.route?.midPoints) {
        bus.route.midPoints.forEach((mp) => {
          midPointMap[mp.name] = { lat: mp.lat, lng: mp.lng }
        })
      }

      console.log(
        `[ETA Job]   ✓ Midpoints: ${Object.keys(midPointMap).length} — [${Object.keys(midPointMap).join(", ")}]`,
      )

      // 5. Calculate ETA per ticket
      const notificationsToCreate = []

      for (const ticket of tickets) {
        console.log(
          `\n[ETA Job]   → Ticket #${ticket.id} | boardingStop: "${ticket.boardingStop}"`,
        )

        if (!ticket.boardingStop) {
          console.log(`[ETA Job]     ✗ No boarding stop on ticket — skipping`)
          continue
        }

        const stopCoords = midPointMap[ticket.boardingStop]
        if (!stopCoords) {
          console.log(
            `[ETA Job]     ✗ Stop "${ticket.boardingStop}" not in midpoints map — skipping`,
          )
          continue
        }

        const distanceKm = haversineDistanceKm(
          latestPosition.latitude,
          latestPosition.longitude,
          stopCoords.lat,
          stopCoords.lng,
        )

        const etaMinutes = estimateMinutes(distanceKm, currentSpeedKmh)

        console.log(
          `[ETA Job]     ✓ Distance: ${distanceKm.toFixed(2)} km | ETA: ${etaMinutes} min`,
        )

        if (!shouldNotify(etaMinutes)) {
          console.log(
            `[ETA Job]     ✗ ${etaMinutes} min not in thresholds [30,20,15,10,5,2] — skipping`,
          )
          continue
        }

        // Dedup check
        const alreadySent = await prisma.notification.findFirst({
          where: {
            userId: ticket.userId,
            type: "BUS",
            createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
            message: { contains: `${etaMinutes} minute` },
          },
        })

        if (alreadySent) {
          console.log(
            `[ETA Job]     ✗ Already sent ${etaMinutes} min notification to user ${ticket.userId} — skipping`,
          )
          continue
        }

        console.log(
          `[ETA Job]     ✅ Queuing notification → user: ${ticket.userId} | ETA: ${etaMinutes} min`,
        )

        notificationsToCreate.push({
          userId: ticket.userId,
          title: "🚌 Bus Arriving Soon",
          message:
            etaMinutes <= 2
              ? `Your bus (${bus.busNumber}) is arriving at ${ticket.boardingStop} in less than 2 minutes! Get ready to board.`
              : `Your bus (${bus.busNumber}) will arrive at ${ticket.boardingStop} in approximately ${etaMinutes} minutes.`,
          type: "BUS",
          actionUrl: `/tickets/${ticket.id}`,
          metadata: {
            busId: bus.id,
            busNumber: bus.busNumber,
            ticketId: ticket.id,
            boardingStop: ticket.boardingStop,
            etaMinutes,
            distanceKm: parseFloat(distanceKm.toFixed(2)),
            busLat: latestPosition.latitude,
            busLng: latestPosition.longitude,
          },
        })
      }

      // 6. Bulk insert
      if (notificationsToCreate.length > 0) {
        await prisma.notification.createMany({ data: notificationsToCreate })
        console.log(
          `\n[ETA Job]   ✅ Sent ${notificationsToCreate.length} notification(s) for bus ${bus.busNumber}`,
        )
      } else {
        console.log(
          `\n[ETA Job]   ℹ️  No notifications queued for bus ${bus.busNumber} this cycle`,
        )
      }
    }

    console.log("\n[ETA Job] ── Job complete ──────────────────────\n")
  } catch (error) {
    console.error("[ETA Job] ❌ Fatal error:", error)
  }
}

export const startBusEtaNotificationJob = () => {
  cron.schedule("* * * * *", async () => {
    console.log("\n[ETA Job] ════════════════════════════════════════")
    console.log("[ETA Job] Running bus ETA notification job...")
    await runBusEtaNotificationJob()
  })

  console.log("[ETA Job] Scheduled — runs every minute")
}
