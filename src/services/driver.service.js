import prisma from "../prisma/client.js"

export const createDriverService = async (dto) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: dto.userId },
  })

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found. Driver cannot be created.",
      data: null,
    }
  }

  // Check if user is already a driver
  const existingDriver = await prisma.driver.findUnique({
    where: { userId: dto.userId },
  })

  if (existingDriver) {
    return {
      success: false,
      statusCode: 409,
      message: "User is already registered as a driver.",
      data: null,
    }
  }

  // Create driver
  const driver = await prisma.driver.create({
    data: {
      userId: dto.userId,
      licenseNo: dto.licenseNo,
      experience: dto.experience ?? null,
    },
  })

  return {
    success: true,
    statusCode: 201,
    message: "Driver created successfully.",
    data: driver,
  }
}

export const getAllDriversService = async () => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: true,
        assignedBus: true,
        assignedMinibus: true,
      },
    })

    if (!drivers || drivers.length === 0) {
      return {
        success: true,
        statusCode: 200,
        message: "No drivers found.",
        data: [],
      }
    }

    return {
      success: true,
      statusCode: 200,
      message: "Drivers retrieved successfully.",
      data: drivers,
    }
  } catch (error) {
    console.error("Error fetching drivers:", error)

    return {
      success: false,
      statusCode: 500,
      message: "Failed to retrieve drivers.",
      data: null,
    }
  }
}

// Get a single driver
export const getDriverService = async (id) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: Number(id) },
      include: { user: true, assignedBus: true, assignedMinibus: true },
    })

    if (!driver) {
      return {
        success: false,
        statusCode: 404,
        message: `Driver with ID ${id} not found.`,
        data: null,
      }
    }

    return {
      success: true,
      statusCode: 200,
      message: "Driver retrieved successfully.",
      data: driver,
    }
  } catch (error) {
    console.error(`Error fetching driver ${id}:`, error)

    return {
      success: false,
      statusCode: 500,
      message: "Failed to retrieve driver.",
      data: null,
    }
  }
}

// Update a driver
export const updateDriverService = async (id, dto) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { id: Number(id) } })

    if (!driver) {
      return {
        success: false,
        statusCode: 404,
        message: `Driver with ID ${id} not found.`,
        data: null,
      }
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: Number(id) },
      data: dto,
      include: { user: true, assignedBus: true, assignedMinibus: true },
    })

    return {
      success: true,
      statusCode: 200,
      message: "Driver updated successfully.",
      data: updatedDriver,
    }
  } catch (error) {
    console.error(`Error updating driver ${id}:`, error)

    return {
      success: false,
      statusCode: 500,
      message: "Failed to update driver.",
      data: null,
    }
  }
}

// Delete a driver
export const deleteDriverService = async (id) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { id: Number(id) } })

    if (!driver) {
      return {
        success: false,
        statusCode: 404,
        message: `Driver with ID ${id} not found.`,
        data: null,
      }
    }

    const deletedDriver = await prisma.driver.delete({
      where: { id: Number(id) },
    })

    return {
      success: true,
      statusCode: 200,
      message: "Driver deleted successfully.",
      data: deletedDriver,
    }
  } catch (error) {
    console.error(`Error deleting driver ${id}:`, error)

    return {
      success: false,
      statusCode: 500,
      message: "Failed to delete driver.",
      data: null,
    }
  }
}
