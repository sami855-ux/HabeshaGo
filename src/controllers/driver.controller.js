import {
  createDriverService,
  getAllDriversService,
  getDriverService,
  updateDriverService,
  deleteDriverService,
} from "../services/driver.service.js"

export const createDriver = async (req, res) => {
  try {
    const result = await createDriverService(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Create driver failed:", error)

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      data: null,
    })
  }
}

export const getDrivers = async (req, res) => {
  try {
    const result = await getAllDriversService()
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Unexpected error fetching drivers:", error)

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while retrieving drivers.",
      data: null,
    })
  }
}

export const getDriver = async (req, res) => {
  try {
    const result = await getDriverService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Unexpected error fetching driver:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while retrieving driver.",
      data: null,
    })
  }
}

export const updateDriver = async (req, res) => {
  try {
    const result = await updateDriverService(req.params.id, req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Unexpected error updating driver:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while updating driver.",
      data: null,
    })
  }
}

export const deleteDriver = async (req, res) => {
  try {
    const result = await deleteDriverService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Unexpected error deleting driver:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while deleting driver.",
      data: null,
    })
  }
}
