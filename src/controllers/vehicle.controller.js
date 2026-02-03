import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

export const createVehicle = async (req, res) => {
  try {
    const {
      plateNumber,
      vin,
      type,
      model,
      manufacturer,
      year,
      capacity,
      status,
      mileage,
      gpsDeviceId,
    } = req.body

    if (!plateNumber || !type || !model || !capacity) {
      return res
        .status(400)
        .json(
          errorResponse(
            "plateNumber, type, model and capacity are required",
            400,
          ),
        )
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber: plateNumber.trim(),
        vin: vin?.trim(),
        type,
        model: model.trim(),
        manufacturer: manufacturer?.trim(),

        year: year ? Number(year) : undefined,
        capacity: Number(capacity),
        status,
        mileage: mileage ? Number(mileage) : 0,
        gpsDeviceId: gpsDeviceId?.trim(),
      },
    })

    return res
      .status(201)
      .json(successResponse("Vehicle created successfully", vehicle, 201))
  } catch (err) {
    console.error("Create vehicle error:", err)

    if (err.code === "P2002") {
      return res
        .status(409)
        .json(
          errorResponse(
            "Vehicle with this plate number or VIN already exists",
            409,
          ),
        )
    }
    return res
      .status(500)
      .json(errorResponse("Failed to create vehicle", 500, err.message))
  }
}

export const getAllVehicles = async (req, res) => {
  try {
    const { status, type } = req.query

    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: status || undefined,
        type: type || undefined,
      },
      orderBy: { createdAt: "desc" },
    })

    return res.json(successResponse("Vehicles fetched successfully", vehicles))
  } catch (err) {
    return res
      .status(500)
      .json(errorResponse("Failed to fetch vehicles", 500, err.message))
  }
}

export const getVehicleById = async (req, res) => {
  try {
    const id = Number(req.params.id)

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    })

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" })
    }

    res.json(vehicle)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateVehicle = async (req, res) => {
  try {
    const id = Number(req.params.id)

    const {
      plateNumber,
      vin,
      type,
      model,
      manufacturer,
      year,
      capacity,
      status,
      mileage,
      ownerName,
      ownerPhone,
      gpsDeviceId,
    } = req.body

    // only update provided fields
    const data = {
      plateNumber,
      vin,
      type,
      model,
      manufacturer,
      year: year ? Number(year) : undefined,
      capacity: capacity ? Number(capacity) : undefined,
      status,
      mileage: mileage ? Number(mileage) : undefined,
      ownerName,
      ownerPhone,
      gpsDeviceId,
    }

    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k])

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    })

    return res.json(successResponse("Vehicle updated successfully", vehicle))
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json(errorResponse("Vehicle not found", 404))
    }

    if (err.code === "P2002") {
      return res
        .status(409)
        .json(errorResponse("plateNumber or VIN must be unique", 409))
    }

    return res
      .status(500)
      .json(errorResponse("Failed to update vehicle", 500, err.message))
  }
}

export const deleteVehicle = async (req, res) => {
  try {
    const id = Number(req.params.id)

    await prisma.$transaction(async (tx) => {
      await tx.driverAssignment.deleteMany({
        where: { vehicleId: id },
      })

      await tx.vehicle.delete({
        where: { id },
      })
    })

    return res.json(successResponse("Vehicle deleted successfully"))
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json(errorResponse("Vehicle not found", 404))
    }

    return res
      .status(500)
      .json(errorResponse("Failed to delete vehicle", 500, err.message))
  }
}

export const getVehicleStats = async (_req, res) => {
  try {
    const [total, active, underMaintenance, retired, outOfService] =
      await Promise.all([
        prisma.vehicle.count(),
        prisma.vehicle.count({ where: { status: "ACTIVE" } }),
        prisma.vehicle.count({ where: { status: "UNDER_MAINTENANCE" } }),
        prisma.vehicle.count({ where: { status: "RETIRED" } }),
        prisma.vehicle.count({ where: { status: "OUT_OF_SERVICE" } }),
      ])

    return res.json(
      successResponse("Vehicle stats fetched successfully", {
        totalVehicles: total,
        activeVehicles: active,
        underMaintenanceVehicles: underMaintenance,
        retiredVehicles: retired,
        outOfServiceVehicles: outOfService,
      }),
    )
  } catch (error) {
    console.error("Get vehicle stats error:", error)
    return res
      .status(500)
      .json(errorResponse("Failed to fetch vehicle stats", 500, error.message))
  }
}

export const updateVehicleStatus = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body

    if (!status) {
      return res.status(400).json(errorResponse("status is required", 400))
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { status },
    })

    return res.json(
      successResponse("Vehicle status updated successfully", vehicle),
    )
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json(errorResponse("Vehicle not found", 404))
    }

    return res
      .status(500)
      .json(errorResponse("Failed to update vehicle status", 500, err.message))
  }
}

export const updateVehicleMileage = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { mileage } = req.body

    if (mileage === undefined || mileage < 0) {
      return res
        .status(400)
        .json(errorResponse("Valid mileage is required", 400))
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { mileage: Number(mileage) },
    })

    return res.json(
      successResponse("Vehicle mileage updated successfully", vehicle),
    )
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json(errorResponse("Vehicle not found", 404))
    }

    return res
      .status(500)
      .json(errorResponse("Failed to update vehicle mileage", 500, err.message))
  }
}

export const assignDriver = async (req, res) => {
  try {
    const vehicleId = Number(req.params.id)
    const { driverId } = req.body

    if (!driverId) {
      return res.status(400).json(errorResponse("driverId is required", 400))
    }

    const assignment = await prisma.$transaction(async (tx) => {
      // Ensure vehicle exists
      const vehicle = await tx.vehicle.findUniqueOrThrow({
        where: { id: vehicleId },
        include: {
          driverAssignments: {
            where: { endDate: null }, // only active assignments
          },
        },
      })

      // If vehicle already has an active driver
      if (vehicle.driverAssignments.length > 0) {
        return res
          .status(400)
          .json(
            errorResponse(
              "Vehicle is already assigned to a driver",
              400,
              vehicle.driverAssignments,
            ),
          )
      }

      // Ensure driver exists
      const driver = await tx.driver.findUniqueOrThrow({
        where: { id: driverId },
        include: {
          assignments: {
            where: { endDate: null }, // only active assignments
          },
        },
      })

      // If driver is already assigned to a vehicle
      if (driver.assignments.length > 0) {
        return res
          .status(400)
          .json(
            errorResponse(
              "Driver is already assigned to a vehicle",
              400,
              driver.assignments,
            ),
          )
      }

      // Create new assignment
      return tx.driverAssignment.create({
        data: {
          vehicleId,
          driverId,
        },
        include: {
          driver: true,
          vehicle: true,
        },
      })
    })

    // Only return success if a new assignment was created
    if (assignment && !assignment.hasOwnProperty("success")) {
      return res
        .status(201)
        .json(successResponse("Driver assigned successfully", assignment))
    }
  } catch (err) {
    if (err.code === "P2025") {
      return res
        .status(404)
        .json(errorResponse("Vehicle or Driver not found", 404))
    }

    return res
      .status(500)
      .json(errorResponse("Failed to assign driver", 500, err.message))
  }
}
export const unassignDriver = async (req, res) => {
  try {
    const vehicleId = Number(req.params.id)

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!vehicle) {
      return res.status(404).json(errorResponse("Vehicle not found", 404))
    }

    // Unassign the active driver (if any)
    const result = await prisma.driverAssignment.updateMany({
      where: {
        vehicleId,
        endDate: null, // only active assignments
      },
      data: {
        endDate: new Date(),
      },
    })

    if (!result.count) {
      return res
        .status(404)
        .json(errorResponse("No active driver assigned to this vehicle", 404))
    }

    return res.json(successResponse("Driver unassigned successfully"))
  } catch (err) {
    return res
      .status(500)
      .json(errorResponse("Failed to unassign driver", 500, err.message))
  }
}
