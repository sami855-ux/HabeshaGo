import prisma from "../prisma/client.js"

export const startEnergyFlow = async (io, sessionId, room) => {
  let meterValue = 0

  const session = await prisma.chargingSession.findUnique({
    where: { id: sessionId },
    include: {
      chargingPoint: true,
      station: {
        include: { tariffs: true },
      },
    },
  })

  if (!session) return

  const powerKw = session.chargingPoint.powerKw || 7.2
  const tariff = session.station?.tariffs?.[0]
  const pricePerKwh = Number(tariff?.pricePerKwh || 0)

  const intervalSeconds = 5

  const interval = setInterval(async () => {
    try {
      // ⚡ REAL ENERGY FORMULA
      const hours = intervalSeconds / 3600
      const energyReleased = powerKw * hours

      meterValue += energyReleased

      const cost = meterValue * pricePerKwh

      await prisma.energyMeterLog.create({
        data: {
          sessionId,
          meterValue,
          powerKw,
        },
      })

      io.to(room).emit("charging-progress", {
        sessionId,
        energy: Number(meterValue.toFixed(3)),
        powerKw,
        cost: Number(cost.toFixed(2)),
      })

      // 🛑 STOP CONDITION (target or full charge)
      if (meterValue >= 20) {
        clearInterval(interval)

        await prisma.chargingSession.update({
          where: { id: sessionId },
          data: {
            endTime: new Date(),
            energyConsumedKwh: meterValue,
            totalCost: cost,
            status: "COMPLETED",
          },
        })

        await prisma.chargingPoint.update({
          where: { id: session.chargingPointId },
          data: { status: "AVAILABLE" },
        })

        io.to(room).emit("charging-complete", {
          sessionId,
          totalEnergy: Number(meterValue.toFixed(3)),
          totalCost: Number(cost.toFixed(2)),
        })
      }
    } catch (err) {
      clearInterval(interval)

      io.to(room).emit("charging-error", {
        sessionId,
        message: "Energy calculation failed",
      })
    }
  }, intervalSeconds * 1000)
}
