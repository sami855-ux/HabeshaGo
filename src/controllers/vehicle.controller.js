import prisma from "../prisma/client.js"
import { setLatestVehicleLocation } from "../services/redisService.service.js"
import { emitToVehicle } from "../socket/index.js"
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

    if (isNaN(id)) {
      return res.status(400).json(errorResponse("Invalid vehicle ID", 400))
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        driverAssignments: {
          where: { endDate: null }, 
          include: {
            driver: {
              select: {
                id: true,
                experience: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!vehicle) {
      return res.status(404).json(errorResponse("Vehicle not found", 404))
    }

    // extract single active driver
    const activeDriver = vehicle.driverAssignments[0]?.driver

    const formattedVehicle = {
      ...vehicle,
      driver: activeDriver
        ? {
            id: activeDriver.id,
            name: activeDriver.user?.name,
            experience: activeDriver.experience,
          }
        : null,
      driverAssignments: undefined, // hide raw relation if you want cleaner response
    }

    return res
      .status(200)
      .json(successResponse("Vehicle fetched successfully", formattedVehicle))
  } catch (error) {
    console.error("Get vehicle by ID error:", error)

    return res.status(500).json(errorResponse("Failed to fetch vehicle", 500))
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

    const result = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          driverAssignments: { where: { endDate: null } },
        },
      })

      if (!vehicle) {
        return { type: "NOT_FOUND" }
      }

      if (vehicle.driverAssignments.length > 0) {
        return { type: "VEHICLE_BUSY", data: vehicle.driverAssignments }
      }

      const driver = await tx.driver.findUnique({
        where: { id: driverId },
        include: {
          assignments: { where: { endDate: null } },
        },
      })

      if (!driver) {
        return { type: "NOT_FOUND" }
      }

      if (driver.assignments.length > 0) {
        return { type: "DRIVER_BUSY", data: driver.assignments }
      }

      const assignment = await tx.driverAssignment.create({
        data: { vehicleId, driverId },
        include: { driver: true, vehicle: true },
      })

      return { type: "SUCCESS", data: assignment }
    })

    // ✅ Handle all responses here (ONE place only)

    if (result.type === "NOT_FOUND") {
      return res
        .status(404)
        .json(errorResponse("Vehicle or Driver not found", 404))
    }

    if (result.type === "VEHICLE_BUSY") {
      return res
        .status(400)
        .json(errorResponse("Vehicle already assigned", 400, result.data))
    }

    if (result.type === "DRIVER_BUSY") {
      return res
        .status(400)
        .json(errorResponse("Driver already assigned", 400, result.data))
    }

    return res
      .status(201)
      .json(successResponse("Driver assigned successfully", result.data))
  } catch (err) {
    console.error(err)
    return res.status(500).json(errorResponse("Failed to assign driver", 500))
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

export const updateVehicleLocation = async (req, res) => {
  try {
    let { vehicleId, lat, lng, speed, heading, accuracy } = req.body

    // required fields
    if (!vehicleId)
      return res.status(400).json(errorResponse("vehicleId is required", 400))

    if (lat === undefined || lng === undefined)
      return res
        .status(400)
        .json(errorResponse("lat and lng are required", 400))

    // convert types
    vehicleId = Number(vehicleId)
    lat = Number(lat)
    lng = Number(lng)
    speed = speed ? Number(speed) : null
    heading = heading ? Number(heading) : null
    accuracy = accuracy ? Number(accuracy) : null

    // validate numbers
    if (Number.isNaN(vehicleId) || vehicleId <= 0)
      return res.status(400).json(errorResponse("Invalid vehicleId", 400))

    if (Number.isNaN(lat) || lat < -90 || lat > 90)
      return res.status(400).json(errorResponse("Invalid latitude", 400))

    if (Number.isNaN(lng) || lng < -180 || lng > 180)
      return res.status(400).json(errorResponse("Invalid longitude", 400))

    // check vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    })

    if (!vehicle)
      return res.status(404).json(errorResponse("Vehicle not found", 404))

    // save history in DB
    const location = await prisma.vehicleLocation.create({
      data: {
        vehicleId,
        lat,
        lng,
        speed,
        heading,
        accuracy,
      },
    })

    console.log(location)

    // save latest in Redis via service
    await setLatestVehicleLocation(vehicleId, location)

    // realtime socket emit
    emitToVehicle(vehicleId, "vehicle:location", location)

    // success response
    return res
      .status(201)
      .json(successResponse("Location updated successfully", location, 201))
  } catch (error) {
    console.error("GPS update error:", error)

    return res
      .status(500)
      .json(errorResponse("Failed to update vehicle location", 500))
  }
}
