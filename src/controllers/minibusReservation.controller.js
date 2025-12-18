import * as service from "../services/minibusReservation.service.js";

export const createReservation = async (req, res) => {
  const result = await service.createReservation(req.body);
  res.status(201).json(result);
};

export const getUserReservations = async (req, res) => {
  const data = await service.getUserReservations(req.params.userId);
  res.json(data);
};

export const confirmReservationPayment = async (req, res) => {
  const data = await service.confirmPayment(req.body);
  res.json(data);
};

export const cancelReservation = async (req, res) => {
  const data = await service.cancelReservation(Number(req.params.id));
  res.json(data);
};
