import express from "express";
import {
  createDriver,
  getDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
} from "../controllers/driver.controller.js";
import {
  createDriverSchema,
  updateDriverSchema,
} from "../schemas/driver.schema.js";

const router = express.Router();

// Validation middleware
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ error: err.errors });
  }
};

router.post("/", validate(createDriverSchema), createDriver);
router.get("/", getDrivers);
router.get("/:id", getDriver);
router.patch("/:id", validate(updateDriverSchema), updateDriver);
router.delete("/:id", deleteDriver);

export default router;
