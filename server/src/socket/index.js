import { Server } from "socket.io";
import { getLatestVehicleLocation } from "../services/redisService.service.js";
import { chargingSocketHandler } from "./charging.socket.js";

let io = null;

// Initialize socket
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // =========================
    // VEHICLE SOCKETS
    // =========================
    socket.on("joinVehicle", async (vehicleId) => {
      socket.join(`vehicle-${vehicleId}`);

      try {
        const latest = await getLatestVehicleLocation(vehicleId);
        if (latest) {
          socket.emit("vehicle:location", latest);
        }
      } catch (error) {
        console.error("Vehicle location error", error);
      }
    });

    socket.on("leaveVehicle", (vehicleId) => {
      socket.leave(`vehicle-${vehicleId}`);
    });

    // Charging module
    chargingSocketHandler(socket);

    // =========================
    // PARKING SOCKETS (NEW CLEAN MODULE)
    // =========================

    socket.on("joinParkingLot", (lotId) => {
      if (!lotId) return;
      socket.join(`parking-lot-${lotId}`);
    });

    socket.on("leaveParkingLot", (lotId) => {
      if (!lotId) return;
      socket.leave(`parking-lot-${lotId}`);
    });

    socket.on("joinParkingSlot", (slotId) => {
      if (!slotId) return;
      socket.join(`parking-slot-${slotId}`);
    });

    socket.on("leaveParkingSlot", (slotId) => {
      if (!slotId) return;
      socket.leave(`parking-slot-${slotId}`);
    });

    socket.on("joinParkingSession", (sessionId) => {
      if (!sessionId) return;
      socket.join(`parking-session-${sessionId}`);
    });

    socket.on("leaveParkingSession", (sessionId) => {
      if (!sessionId) return;
      socket.leave(`parking-session-${sessionId}`);
    });

    // =========================
    // MAP SOCKETS
    // =========================
    socket.on("joinMap", async (vehicleIds) => {
      if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
        socket.emit("map:error", {
          message: "vehicleIds must be a non-empty array",
        });
        return;
      }

      const validIds = vehicleIds
        .slice(0, 100)
        .filter((id) => Number.isInteger(id) && id > 0);

      if (validIds.length === 0) {
        socket.emit("map:error", { message: "No valid vehicle IDs provided" });
        return;
      }

      socket.join("map");

      try {
        const results = await Promise.allSettled(
          validIds.map(getLatestVehicleLocation),
        );

        const locations = [];
        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            locations.push(result.value);
          }
        });

        socket.emit("map:init", locations);

        socket.data.trackedVehicleIds = validIds;
      } catch (error) {
        console.error("Map init error", error);
        socket.emit("map:error", { message: "Failed to initialize map" });
      }
    });

    socket.on("leaveMap", () => {
      socket.leave("map");
      socket.data.trackedVehicleIds = [];
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
      socket.data.trackedVehicleIds = [];
    });

    // =========================
    // CHARGING / STATION
    // =========================
    socket.on("joinSession", (sessionId) => {
      if (!sessionId) return;
      socket.join(`session-${sessionId}`);
    });

    socket.on("leaveSession", (sessionId) => {
      if (!sessionId) return;
      socket.leave(`session-${sessionId}`);
    });

    socket.on("joinStation", (stationId) => {
      if (!stationId) return;
      socket.join(`station-${stationId}`);
    });

    socket.on("leaveStation", (stationId) => {
      if (!stationId) return;
      socket.leave(`station-${stationId}`);
    });

    // =========================
    // USER / ADMIN ROOMS
    // =========================
    socket.on("joinUserNotification", (userId) => {
      if (!userId) return;
      socket.join(`user-${userId}`);
    });

    socket.on("joinAdminRoom", (adminId) => {
      if (!adminId) return;
      socket.join(`admin-${adminId}`);
    });
  });

  return io;
};

// =========================
// SOCKET INSTANCE
// =========================
export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

// =========================
// EMIT HELPERS
// =========================
export const emitToVehicle = (vehicleId, payload) => {
  if (!io) return;
  io.to(`vehicle-${vehicleId}`).emit("vehicle:location", payload);
};

export const emitSessionUpdate = (sessionId, payload) => {
  if (!io) return;
  io.to(`session-${sessionId}`).emit("session:update", payload);
};

export const emitParkingReservation = (userId, reservation) => {
  if (!io) return;

  io.to(`user-${userId}`).emit("parking:reservation", {
    reservation,
  });
};
export const emitParkingSessionEnd = (userId, session) => {
  if (!io) return;

  io.to(`user-${userId}`).emit("parking:session:end", {
    session,
  });
};
export const emitParkingSessionStart = (userId, session) => {
  if (!io) return;

  io.to(`user-${userId}`).emit("parking:session:start", {
    session,
  });
};

export const emitParkingSlotUpdate = (lotId, slot) => {
  if (!io) return;

  io.to(`parking-lot-${lotId}`).emit("parking:slot:update", {
    slot,
  });
};

export const emitPointStatusUpdate = (stationId, pointData) => {
  if (!io) return;

  io.to(`station-${stationId}`).emit("point:statusChanged", pointData);

  io.to("map").emit("station:availabilityUpdate", {
    stationId,
    point: pointData,
  });
};

export const emitWalletTransaction = (userId, transaction) => {
  if (!io) return;
  io.to(`user-${userId}`).emit("wallet:transaction", transaction);
};

export const emitReservationExpiring = (userId, reservation) => {
  if (!io) return;
  io.to(`user-${userId}`).emit("reservation:expiring", reservation);
};

export const emitReservationConfirmed = (userId, reservation) => {
  if (!io) return;
  io.to(`user-${userId}`).emit("reservation:confirmed", reservation);
};

export const emitAdminTelemetry = (payload) => {
  if (!io) return;
  io.to("admin-dashboard").emit("telemetry:update", payload);
};

export const emitToMap = (payload) => {
  if (!io) return;
  io.to("map").emit("map:vehicleUpdate", payload);
};

export const emitChargerFault = (stationId, faultData) => {
  if (!io) return;
  io.emit("charger:fault", {
    stationId,
    ...faultData,
  });
};

export const emitToUserNotification = (userId, notification) => {
  if (!io) return;
  io.to(`user-${userId}`).emit("notification:new", {
    notification,
  });
};

export const emitToAdminNotification = (adminId, notification) => {
  if (!io) return;
  io.to(`admin-${adminId}`).emit("notification:new", {
    notification,
  });
};

export const emitTripCompleted = (userId, payload) => {
  if (!io) return;
  io.to(`user-${userId}`).emit("trip:completed", payload);
};
