import {
  createBusService,
  findAllBusesService,
  findBusService,
  updateBusService,
  assignDriverService,
  updateStatusService,
  removeBusService,
  getSeatAvailabilityService,
  recordPositionService,
} from "../services/bus.service.js";

// Create bus
export const createBus = async (req, res) => {
  const bus = await createBusService(req.body);
  res.status(201).json(bus);
};

// Get all buses
export const findAllBuses = async (req, res) => {
  const buses = await findAllBusesService(req.query);
  res.json(buses);
};

// Get one bus
export const findBus = async (req, res) => {
  const bus = await findBusService(Number(req.params.id));
  res.json(bus);
};

// Update bus
export const updateBus = async (req, res) => {
  const bus = await updateBusService(Number(req.params.id), req.body);
  res.json(bus);
};

// Assign/unassign driver
export const assignDriver = async (req, res) => {
  const bus = await assignDriverService(Number(req.params.id), req.body);
  res.json(bus);
};

// Update bus status
export const updateStatus = async (req, res) => {
  const bus = await updateStatusService(Number(req.params.id), req.body);
  res.json(bus);
};

// Soft delete
export const removeBus = async (req, res) => {
  const bus = await removeBusService(Number(req.params.id));
  res.json({ message: "Bus removed", bus });
};

// Get seat availability
export const getSeatAvailability = async (req, res) => {
  const availability = await getSeatAvailabilityService(
    Number(req.params.id),
    req.query.date
  );
  res.json(availability);
};

// Record position
export const recordPosition = async (req, res) => {
  const position = await recordPositionService(Number(req.params.id), req.body);
  res.json(position);
};
