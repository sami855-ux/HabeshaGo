import {
  updateMidPointService,
  deleteMidPointService,
  reorderMidPointsService,
} from "../services/midpoint.service.js"

export const updateMidPoint = async (req, res) => {
  const { id } = req.params
  const data = req.body

  const response = await updateMidPointService(id, data)
  res.status(response.statusCode).json(response)
}

export const deleteMidPoint = async (req, res) => {
  const { id } = req.params

  const response = await deleteMidPointService(id)
  res.status(response.statusCode).json(response)
}

export const reorderMidPoints = async (req, res) => {
  const { routeId } = req.params
  const { newOrder } = req.body

  if (!Array.isArray(newOrder)) {
    return res
      .status(400)
      .json({ success: false, message: "newOrder must be an array" })
  }

  const response = await reorderMidPointsService(routeId, newOrder)
  res.status(response.statusCode).json(response)
}
