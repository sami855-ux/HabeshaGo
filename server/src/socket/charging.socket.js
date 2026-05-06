import {
  createChargingSession,
  startChargingService,
} from "../services/chargingSession.service.js"
import { startEnergyFlow } from "../utils/energyFlow.js"

export const chargingSocketHandler = (socket) => {
  socket.on("start-charging", async ({ reservationId }) => {
    try {
      // Step 1: validate
      const reservation = await startChargingService(reservationId)

      socket.emit("charging-status", { status: "connecting", step: 1 })

      // Step 2: create session (real backend work)
      const session = await createChargingSession(reservation)

      socket.emit("charging-status", { status: "connecting", step: 2 })

      // Step 3: ready
      socket.emit("charging-status", { status: "connecting", step: 3 })

      // Connected
      socket.emit("charging-status", {
        status: "connected",
        sessionId: session.id,
      })

      // Start real-time energy tracking
      startEnergyFlow(session.id, socket)
    } catch (error) {
      socket.emit("charging-status", {
        status: "error",
        message: error.message || "Something went wrong",
      })
    }
  })
}
