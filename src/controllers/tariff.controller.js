import {
  createTariffService,
  getAllTariffsService,
  getTariffByIdService,
  updateTariffService,
  deleteTariffService,
  getTariffsByStationService,
} from "../services/tariff.service.js";

export const createTariff = async (req, res) => {
  const result = await createTariffService(req.body);
  return res.status(result.statusCode).json(result);
};

export const getAllTariffs = async (req, res) => {
  const result = await getAllTariffsService();
  return res.status(result.statusCode).json(result);
};

export const getTariffById = async (req, res) => {
  const result = await getTariffByIdService(req.params.id);
  return res.status(result.statusCode).json(result);
};

export const updateTariff = async (req, res) => {
  const result = await updateTariffService(req.params.id, req.body);
  return res.status(result.statusCode).json(result);
};

export const deleteTariff = async (req, res) => {
  const result = await deleteTariffService(req.params.id);
  return res.status(result.statusCode).json(result);
};

export const getTariffsByStation = async (req, res) => {
  const result = await getTariffsByStationService(req.params.id);
  return res.status(result.statusCode).json(result);
};