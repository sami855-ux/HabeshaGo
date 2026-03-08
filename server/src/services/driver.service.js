import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

// CREATE DRIVER

export const createDriverService = async (data) => {
  try {
    const requiredFields = [
      "userId",
      "licenseNo",
      "driverLicenseUrl",
      "idType",
      "idFrontUrl",
      "idBackUrl",
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return errorResponse(`Field "${field}" is required`, 400)
      }
    }

    const validIdTypes = ["PASSPORT", "NATIONAL_ID", "KEBELE_ID"]
    if (!validIdTypes.includes(data.idType)) {
      return errorResponse(
        `Invalid idType. Must be one of: ${validIdTypes.join(", ")}`,
        400,
      )
    }

    const existingDriver = await prisma.driver.findUnique({
      where: { userId: data.userId },
    })

    if (existingDriver) {
      return errorResponse("A driver already exists for this user", 409)
    }

    const driver = await prisma.driver.create({
      data: {
        userId: data.userId,
        licenseNo: data.licenseNo,
        experience: data.experience ?? 0,
        driverLicenseUrl: data.driverLicenseUrl,
        idType: data.idType,
        idFrontUrl: data.idFrontUrl,
        idBackUrl: data.idBackUrl,
      },
    })

    return successResponse("Driver created successfully", driver, 201)
  } catch (error) {
    console.error("Create driver error:", error)

    if (error.code === "P2002") {
      return errorResponse("Duplicate driver entry", 409)
    }

    return errorResponse("Failed to create driver", 500)
  }
}

// GET ALL DRIVERS
export const getAllDriversService = async () => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: true,
        // vehicle: true,
        // assignedBus: true,
        // assignedMinibus: true,
      },
    })

    return successResponse("Drivers retrieved successfully", drivers, 200)
  } catch (error) {
    console.error("Get all drivers error:", error)
    return errorResponse("Failed to fetch drivers", 500)
  }
}

// GET DRIVER BY ID
export const getDriverByIdService = async (driverId) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: true,
        vehicle: true,
        assignedBus: true,
        assignedMinibus: true,
      },
    })

    if (!driver) {
      return errorResponse("Driver not found", 404)
    }

    return successResponse("Driver retrieved successfully", driver, 200)
  } catch (error) {
    console.error("Get driver by id error:", error)
    return errorResponse("Failed to fetch driver", 500)
  }
}

// UPDATE DRIVER
export const updateDriverService = async (driverId, data) => {
  try {
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data,
    })

    return successResponse("Driver updated successfully", driver, 200)
  } catch (error) {
    console.error("Update driver error:", error)
    return errorResponse("Failed to update driver", 500)
  }
}

// VERIFY / REJECT DOCUMENTS
export const verifyDriverDocumentsService = async (
  driverId,
  adminId,
  licenseStatus,
  idStatus,
  rejectionReason,
) => {
  try {
    const existingDriver = await prisma.driver.findUnique({
      where: { id: driverId },
    })

    if (!existingDriver) {
      return errorResponse("Driver not found", 404)
    }

    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        licenseStatus: licenseStatus ?? existingDriver.licenseStatus,
        idStatus: idStatus ?? existingDriver.idStatus,
        verifiedById: adminId,
        verifiedAt: new Date(),
        rejectionReason: rejectionReason ?? null,
      },
    })

    return successResponse(
      "Driver documents verified successfully",
      driver,
      200,
    )
  } catch (error) {
    console.error("Verify driver documents error:", error)
    return errorResponse("Failed to verify documents", 500)
  }
}

// ASSIGN VEHICLE
export const assignVehicleToDriverService = async (driverId, vehicleId) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    })

    if (!driver) {
      return errorResponse("Driver not found", 404)
    }

    if (driver.licenseStatus !== "VERIFIED" || driver.idStatus !== "VERIFIED") {
      return errorResponse("Driver documents are not verified", 403)
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: { vehicleId },
    })

    return successResponse(
      "Vehicle assigned to driver successfully",
      updatedDriver,
      200,
    )
  } catch (error) {
    console.error("Assign vehicle error:", error)
    return errorResponse("Failed to assign vehicle", 500)
  }
}

// TOGGLE DUTY STATUS
export const toggleDriverDutyService = async (userId) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId },
    })

    if (!driver) {
      return errorResponse("Driver not found", 404)
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isOnDuty: !driver.isOnDuty,
        lastActiveAt: new Date(),
      },
    })

    return successResponse("Driver duty status updated", updatedDriver, 200)
  } catch (error) {
    console.error("Toggle duty error:", error)
    return errorResponse("Failed to update duty status", 500)
  }
}

// BLOCK / UNBLOCK DRIVER
export const blockDriverService = async (driverId, block) => {
  try {
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        status: block ? "INACTIVE" : "ACTIVE",
        isOnDuty: false,
      },
    })

    return successResponse(
      block ? "Driver blocked successfully" : "Driver unblocked successfully",
      updatedDriver,
      200,
    )
  } catch (error) {
    console.error("Block driver error:", error)
    return errorResponse("Failed to update driver status", 500)
  }
}
