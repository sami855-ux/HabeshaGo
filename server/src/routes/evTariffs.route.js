import express from "express";
import {
  createTariff,
  getAllTariffs,
  getTariffById,
  updateTariff,
  deleteTariff,
  getTariffsByStation,
} from "../controllers/tariff.controller.js";

const router = express.Router();

// CRUD for tariffs
router.post("/", createTariff);
router.get("/", getAllTariffs);
router.get("/:id", getTariffById);
router.put("/:id", updateTariff);
router.delete("/:id", deleteTariff);

// Nested route
router.get("/stations/:id", getTariffsByStation);

export default router;