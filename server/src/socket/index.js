import { Server } from "socket.io"
import { getLatestVehicleLocation } from "../services/redisService.service.js"

let io = null

// Initialize socket
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id)

    // Join vehicle room
    socket.on("joinVehicle", async (vehicleId) => {
      socket.join(`vehicle-${vehicleId}`)

      try {
        const latest = await getLatestVehicleLocation(vehicleId)
        if (latest) {
          socket.emit("vehicle:location", latest)
        }
      } catch (error) {
        console.error("Vehicle location error", error)
      }
    })

    socket.on("leaveVehicle", (vehicleId) => {
      socket.leave(`vehicle-${vehicleId}`)
    })

    // Join map room
    socket.on("joinMap", async (vehicleIds) => {
      socket.join("map")

      try {
        if (Array.isArray(vehicleIds) && vehicleIds.length > 0) {
          const latestLocations = await Promise.all(
            vehicleIds.map(getLatestVehicleLocation),
          )

          socket.emit("map:init", latestLocations.filter(Boolean))
        }
      } catch (error) {
        console.error("Map init error", error)
      }
    })

    // Join charging session
    socket.on("joinSession", (sessionId) => {
      socket.join(`session-${sessionId}`)
    })

    socket.on("leaveSession", (sessionId) => {
      socket.leave(`session-${sessionId}`)
    })

    // Join station room
    socket.on("joinStation", (stationId) => {
      socket.join(`station-${stationId}`)
    })

    socket.on("leaveStation", (stationId) => {
      socket.leave(`station-${stationId}`)
    })

    // Join user notification room
    socket.on("joinUserNotification", (userId) => {
      if (!userId) return
      console.log("Joining user notification room:", userId)
      socket.join(`user-${userId}`)
    })

    // Join admin notification room (fixed)
    socket.on("joinAdminRoom", (adminId) => {
      if (!adminId) return
      socket.join(`admin-${adminId}`)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id)
    })
  })

  return io
}

// Get socket instance
export const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized")
  }
  return io
}

// Emit vehicle location
export const emitToVehicle = (vehicleId, payload) => {
  if (!io) return
  io.to(`vehicle-${vehicleId}`).emit("vehicle:location", payload)
}

// Emit session update
export const emitSessionUpdate = (sessionId, payload) => {
  if (!io) return
  io.to(`session-${sessionId}`).emit("session:update", payload)
}

// Emit charging point status
export const emitPointStatusUpdate = (stationId, pointData) => {
  if (!io) return

  io.to(`station-${stationId}`).emit("point:statusChanged", pointData)

  io.to("map").emit("station:availabilityUpdate", {
    stationId,
    point: pointData,
  })
}

// Emit wallet transaction
export const emitWalletTransaction = (userId, transaction) => {
  if (!io) return
  io.to(`user-${userId}`).emit("wallet:transaction", transaction)
}

// Emit reservation events
export const emitReservationExpiring = (userId, reservation) => {
  if (!io) return
  io.to(`user-${userId}`).emit("reservation:expiring", reservation)
}

export const emitReservationConfirmed = (userId, reservation) => {
  if (!io) return
  io.to(`user-${userId}`).emit("reservation:confirmed", reservation)
}

// Emit admin telemetry
export const emitAdminTelemetry = (payload) => {
  if (!io) return
  io.to("admin-dashboard").emit("telemetry:update", payload)
}

// Emit charger fault
export const emitChargerFault = (stationId, faultData) => {
  if (!io) return
  io.emit("charger:fault", {
    stationId,
    ...faultData,
  })
}

// Emit user notification (fixed structure)
export const emitToUserNotification = (userId, notification) => {
  if (!io) return
  io.to(`user-${userId}`).emit("notification:new", {
    notification,
  })
}

// Emit admin notification (fixed room)
export const emitToAdminNotification = (adminId, notification) => {
  if (!io) return
  io.to(`admin-${adminId}`).emit("notification:new", {
    notification,
  })
}
