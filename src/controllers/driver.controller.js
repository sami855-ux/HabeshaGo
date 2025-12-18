import {
  createDriverService,
  getAllDriversService,
  getDriverService,
  updateDriverService,
  deleteDriverService,
} from "../services/driver.service.js";

export const createDriver = async (req, res) => {
  try {
    const driver = await createDriverService(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDrivers = async (req, res) => {
  try {
    const drivers = await getAllDriversService();
    res.json(drivers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDriver = async (req, res) => {
  try {
    const driver = await getDriverService(req.params.id);
    res.json(driver);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const driver = await updateDriverService(req.params.id, req.body);
    res.json(driver);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await deleteDriverService(req.params.id);
    res.json({ message: "Driver deleted", driver });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
