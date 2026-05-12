import * as reservationService from "../services/evReservations.service.js"

export const createReservation = async (req, res) => {
  const result = await reservationService.createReservationService(req.body)
  return res.status(result.statusCode).json(result)
}

export const getAllReservations = async (req, res) => {
  const result = await reservationService.getAllReservationsService(req.query)
  return res.status(result.statusCode).json(result)
}

export const getReservationById = async (req, res) => {
  const result = await reservationService.getReservationByIdService(
    req.params.id,
  )
  return res.status(result.statusCode).json(result)
}

export const updateReservation = async (req, res) => {
  const result = await reservationService.updateReservationService(
    req.params.id,
    req.body,
  )
  return res.status(result.statusCode).json(result)
}

export const deleteReservation = async (req, res) => {
  const result = await reservationService.deleteReservationService(
    req.params.id,
  )
  return res.status(result.statusCode).json(result)
}

export const getReservationsByVehicle = async (req, res) => {
  const result = await reservationService.getReservationsByVehicleService(
    req.params.id,
  )
  return res.status(result.statusCode).json(result)
}

export const getReservationsByPoint = async (req, res) => {
  const result = await reservationService.getReservationsByPointService(
    req.params.id,
  )
  return res.status(result.statusCode).json(result)
}

export const getReservationsByUser = async (req, res) => {
  const result = await reservationService.getReservationsByUserService(
    req.params.id,
  )
  return res.status(result.statusCode).json(result)
}

export const getManagerPayments = async (req, res) => {
  const result = await reservationService.getManagerPaymentsService(req.user.id)

  return res.status(result.statusCode).json(result)
}

export const verifyCharger = async (req, res) => {
  try {
    const result = await reservationService.verifyChargerService(
      req.user.id,
      req.body.code,
      req.body.stationId,
    )
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Verify charger controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while verifying charger",
      data: null,
    })
  }
}
