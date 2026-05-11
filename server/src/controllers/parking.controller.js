import * as service from "../services/parking.service.js";

/* ================= HELPERS ================= */
const handleError = (res, error) => {
  console.error(error);
  res.status(400).json({
    success: false,
    message: error.message || "Something went wrong",
  });
};

const success = (res, data) => {
  res.json({
    success: true,
    data,
  });
};

/* ================= LOT ================= */

export const createParkingLot = async (req, res) => {
  try {
    const data = await service.createParkingLot(req.body);
    success(res, data);
  } catch (e) {
    handleError(res, e);
  }
};

export const getAllParkingLots = async (req, res) => {
  try {
    success(res, await service.getAllParkingLots());
  } catch (e) {
    handleError(res, e);
  }
};

export const getNearbyParkingLots = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) throw new Error("Latitude and Longitude are required");

    const data = await service.getNearbyLots(
      Number(lat),
      Number(lng),
      Number(radius || 5),
    );

    success(res, data);
  } catch (e) {
    handleError(res, e);
  }
};

export const getParkingLotById = async (req, res) => {
  try {
    success(res, await service.getLotById(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
};

export const updateParkingLot = async (req, res) => {
  try {
    success(res, await service.updateLot(req.params.id, req.body));
  } catch (e) {
    handleError(res, e);
  }
};

export const deleteParkingLot = async (req, res) => {
  try {
    await service.deleteLot(req.params.id);
    success(res, { message: "Deleted successfully" });
  } catch (e) {
    handleError(res, e);
  }
};

/* ================= SLOT ================= */

export const createSlots = async (req, res) => {
  try {
    success(res, await service.createSlots(req.params.lotId, req.body));
  } catch (e) {
    handleError(res, e);
  }
};

export const getSlotsByLot = async (req, res) => {
  try {
    success(res, await service.getSlots(req.params.lotId));
  } catch (e) {
    handleError(res, e);
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    success(res, await service.getAvailableSlots(req.params.lotId));
  } catch (e) {
    handleError(res, e);
  }
};

export const updateSlotStatus = async (req, res) => {
  try {
    if (!req.body.status) throw new Error("Status is required");

    success(
      res,
      await service.updateSlotStatus(req.params.slotId, req.body.status),
    );
  } catch (e) {
    handleError(res, e);
  }
};

export const deleteSlot = async (req, res) => {
  try {
    await service.deleteSlot(req.params.slotId);
    success(res, { message: "Deleted successfully" });
  } catch (e) {
    handleError(res, e);
  }
};

/* ================= RESERVATION ================= */

export const getAllReservations = async (req, res) => {
  try {
    success(res, await service.getAllReservations());
  } catch (e) {
    handleError(res, e);
  }
};

export const createReservation = async (req, res) => {
  try {
    console.log("USER:", req.user);

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await service.createReservation(req.user.id, req.body);

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
export const getMyReservations = async (req, res) => {
  try {
    success(res, await service.getUserReservations(req.user.id));
  } catch (e) {
    handleError(res, e);
  }
};

export const getReservationById = async (req, res) => {
  try {
    success(res, await service.getReservation(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
};

export const cancelReservation = async (req, res) => {
  try {
    success(res, await service.cancelReservation(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
};

export const markNoShow = async (req, res) => {
  try {
    success(res, await service.markNoShow(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
};

export const checkInReservation = async (req, res) => {
  try {
    success(res, await service.checkIn(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
};

export const checkOutReservation = async (req, res) => {
  try {
    success(res, await service.checkOut(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
};

/* ================= SESSION ================= */

export const getAllSessionsAdmin = async (req, res) => {
  try {
    success(res, await service.getAllSessions());
  } catch (e) {
    handleError(res, e);
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    success(res, await service.getActiveSessions());
  } catch (e) {
    handleError(res, e);
  }
};

export const getMySessions = async (req, res) => {
  try {
    success(res, await service.getUserSessions(req.user.id));
  } catch (e) {
    handleError(res, e);
  }
};

export const getSessionById = async (req, res) => {
  try {
    success(res, await service.getSession(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
};

export const endSession = async (req, res) => {
  try {
    success(res, await service.endSession(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
};

export const getSessionCost = async (req, res) => {
  try {
    success(res, await service.calculateCost(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
};

/* ================= ANALYTICS ================= */

export const getSessionStats = async (req, res) => {
  try {
    success(res, await service.getSessionStats());
  } catch (e) {
    handleError(res, e);
  }
};

export const getLotStats = async (req, res) => {
  try {
    success(res, await service.getLotStats(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
};

export const getDailyReport = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    success(res, await service.getDailyReport(date));
  } catch (e) {
    handleError(res, e);
  }
};

export const getPeakHoursReport = async (req, res) => {
  try {
    success(res, await service.getPeakHoursReport());
  } catch (e) {
    handleError(res, e);
  }
};
export const payParkingSession = async (req, res) => {
  try {
    const { sessionId, pin, biometricToken } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required",
      });
    }

   const result = await service.payParkingSessionFromWallet(
     req.user.id,
     sessionId,
     { pin, biometricToken },
   );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Parking payment controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process parking payment",
    });
  }
};
