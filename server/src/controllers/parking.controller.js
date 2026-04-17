import * as service from "../services/parking.service.js";

// LOT
export const createParkingLot = async (req, res) => {
  const data = await service.createParkingLot(req.body);
  res.json(data);
};

export const getAllParkingLots = async (req, res) => {
  res.json(await service.getAllParkingLots());
};

export const getNearbyParkingLots = async (req, res) => {
  const { lat, lng, radius } = req.query;
  const data = await service.getNearbyLots(
    Number(lat),
    Number(lng),
    Number(radius || 5),
  );
  res.json(data);
};

export const getParkingLotById = async (req, res) => {
  res.json(await service.getLotById(req.params.id));
};

export const updateParkingLot = async (req, res) => {
  res.json(await service.updateLot(req.params.id, req.body));
};

export const deleteParkingLot = async (req, res) => {
  await service.deleteLot(req.params.id);
  res.json({ message: "Deleted" });
};

// SLOT
export const createSlots = async (req, res) => {
  res.json(await service.createSlots(req.params.lotId, req.body));
};

export const getSlotsByLot = async (req, res) => {
  res.json(await service.getSlots(req.params.lotId));
};

export const getAvailableSlots = async (req, res) => {
  res.json(await service.getAvailableSlots(req.params.lotId));
};

export const updateSlotStatus = async (req, res) => {
  res.json(await service.updateSlotStatus(req.params.slotId, req.body.status));
};

export const deleteSlot = async (req, res) => {
  await service.deleteSlot(req.params.slotId);
  res.json({ message: "Deleted" });
};

// RESERVATION
export const createReservation = async (req, res) => {
  res.json(await service.createReservation(req.user.id, req.body));
};

export const getMyReservations = async (req, res) => {
  res.json(await service.getUserReservations(req.user.id));
};

export const getReservationById = async (req, res) => {
  res.json(await service.getReservation(req.params.id));
};

export const cancelReservation = async (req, res) => {
  res.json(await service.cancelReservation(req.params.id));
};

export const checkInReservation = async (req, res) => {
  res.json(await service.checkIn(req.params.id));
};

export const checkOutReservation = async (req, res) => {
  res.json(await service.checkOut(req.params.id));
};

export const markNoShow = async (req, res) => {
  res.json(await service.markNoShow(req.params.id));
};

// SESSION
export const createSession = async (req, res) => {
  res.json(await service.createSession(req.body));
};

export const getActiveSessions = async (req, res) => {
  res.json(await service.getActiveSessions());
};

export const getMySessions = async (req, res) => {
  res.json(await service.getUserSessions());
};

export const getSessionById = async (req, res) => {
  res.json(await service.getSession(req.params.id));
};

export const endSession = async (req, res) => {
  res.json(await service.endSession(req.params.id));
};

export const getSessionCost = async (req, res) => {
  res.json(await service.calculateCost(req.params.id));
};
export const getLotStats = async (req, res) => {
  const data = await service.getLotStats(req.params.id);
  res.json(data);
};

export const getDailyReport = async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const data = await service.getDailyReport(date);
  res.json(data);
};

export const getPeakHoursReport = async (req, res) => {
  const data = await service.getPeakHoursReport();
  res.json(data);
};