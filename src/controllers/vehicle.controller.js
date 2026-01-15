import prisma from "../prisma/client.js"
/**
 * Create a new vehicle
 */
export const createVehicle = async (req, res) => {
  try {
    const { type, model, plateNumber, capacity, manufacturer, year, status } =
      req.body

    if (!type || !model || !plateNumber || !capacity) {
      return res
        .status(400)
        .json({ error: "type, model, plateNumber and capacity are required" })
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        type,
        model,
        plateNumber,
        capacity,
        manufacturer,
        year,
        status,
      },
    })

    res.status(201).json(vehicle)
  } catch (err) {
    if (err.code === "P2002") {
      // Unique constraint
      return res
        .status(409)
        .json({ error: "Vehicle with this plateNumber already exists" })
    }
    res.status(500).json({ error: err.message })
  }
}

/**
 * Get all vehicles
 */
export const getAllVehicles = async (_req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        bus: true,
        minibus: true,
        driver: true,
      },
    })
    res.json(vehicles)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Update a vehicle
 */
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params
    const {
      type,
      model,
      plateNumber,
      capacity,
      manufacturer,
      year,
      status,
      isActive,
    } = req.body

    const vehicle = await prisma.vehicle.update({
      where: { id: Number(id) },
      data: {
        type,
        model,
        plateNumber,
        capacity,
        manufacturer,
        year,
        status,
        isActive,
      },
    })

    res.json(vehicle)
  } catch (err) {
    if (err.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "Vehicle not found" })
    }
    res.status(500).json({ error: err.message })
  }
}

/**
 * Delete a vehicle
 */
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.vehicle.delete({
      where: { id: Number(id) },
    })

    res.json({ message: "Vehicle deleted successfully" })
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Vehicle not found" })
    }
    res.status(500).json({ error: err.message })
  }
}

export const getVehicleStats = async (req, res) => {
  try {
    const totalVehicles = await prisma.vehicle.count()

    const activeVehicles = await prisma.vehicle.count({
      where: { status: "ACTIVE" },
    })

    const maintenanceVehicles = await prisma.vehicle.count({
      where: { status: "UNDER_MAINTENANCE" },
    })

    const outOfServiceVehicles = await prisma.vehicle.count({
      where: { status: "OUT_OF_SERVICE" },
    })

    return res.json({
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      outOfServiceVehicles,
    })
  } catch (error) {
    console.error("Error fetching vehicle stats:", error)
    return res.status(500).json({ error: "Failed to fetch vehicle stats" })
  }
}
