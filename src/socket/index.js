import { Server } from "socket.io"
import { getLatestVehicleLocation } from "../services/redisService.service"

let io = null

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id)

    // vehicle live tracking
    socket.on("joinVehicle", async (vehicleId) => {
      socket.join(`vehicle-${vehicleId}`)

      try {
        // fetch latest cached location from Redis
        const latest = await getLatestVehicleLocation(vehicleId)

        if (latest) {
          // immediately send latest to this client
          socket.emit("vehicle:location", latest)
        }
      } catch (error) {
        console.error(
          `Failed to send latest location to client ${socket.id} for vehicle ${vehicleId}`,
          error,
        )
      }
    })

    // Join the map room to receive all vehicle updates
    socket.on("joinMap", async (vehicleIds) => {
      socket.join("map")

      try {
        // send latest cached locations of all vehicles immediately
        if (Array.isArray(vehicleIds) && vehicleIds.length > 0) {
          const latestLocations = await Promise.all(
            vehicleIds.map(getLatestVehicleLocation),
          )
          // filter out nulls
          const validLocations = latestLocations.filter(Boolean)
          socket.emit("map:init", validLocations)
        }
      } catch (error) {
        console.error(
          `Failed to send initial map locations to client ${socket.id}`,
          error,
        )
      }
    })

    socket.on("leaveVehicle", (vehicleId) => {
      socket.leave(`vehicle-${vehicleId}`)
    })

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket(server) first.")
  }
  return io
}

// Helper emitters (clean API)
// Use these everywhere instead of io.to(...)
export const emitToUser = (userId, event, payload) => {
  io.to(`user-${userId}`).emit(event, payload)
}

export const emitToVehicle = (vehicleId, event, payload) => {
  io.to(`vehicle-${vehicleId}`).emit(event, payload)
}

export const emitToAdmins = (event, payload) => {
  io.to("admins").emit(event, payload)
}
