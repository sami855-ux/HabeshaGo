import * as routeService from "../services/route.service.js"

export const createRoute = async (req, res) => {
  try {
    const result = await routeService.createdRouteService(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Create route controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      data: null,
    })
  }
}

export const getRoutes = async (req, res) => {
  try {
    const result = await routeService.fetchedRoutesService(req.query)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, statusCode: 500 })
  }
}

export const getRouteById = async (req, res) => {
  try {
    const result = await routeService.fetchedRouteByIdService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch {
    return res.status(500).json({ success: false, statusCode: 500 })
  }
}

export const updateRoute = async (req, res) => {
  try {
    const result = await routeService.updatedRouteService(
      req.params.id,
      req.body,
    )
    return res.status(result.statusCode).json(result)
  } catch {
    return res.status(500).json({ success: false, statusCode: 500 })
  }
}

export const deleteRoute = async (req, res) => {
  try {
    const result = await routeService.deletedRouteService(req.params.id)
    return res.status(result.statusCode).json(result)
  } catch {
    return res.status(500).json({ success: false, statusCode: 500 })
  }
}

export const activateRoute = async (req, res) =>
  res
    .status(
      (await routeService.activatedRouteService(req.params.id)).statusCode,
    )
    .json(await routeService.activatedRouteService(req.params.id))

export const deactivateRoute = async (req, res) =>
  res
    .status(
      (await routeService.deactivatedRouteService(req.params.id)).statusCode,
    )
    .json(await routeService.deactivatedRouteService(req.params.id))

export const suspendRoute = async (req, res) =>
  res
    .status(
      (await routeService.suspendedRouteService(req.params.id)).statusCode,
    )
    .json(await routeService.suspendedRouteService(req.params.id))

export const resumeRoute = async (req, res) =>
  res
    .status((await routeService.resumedRouteService(req.params.id)).statusCode)
    .json(await routeService.resumedRouteService(req.params.id))

export const searchRoutes = async (req, res) => {
  const { origin = "", destination = "" } = req.query
  const result = await routeService.searchedRoutesService(origin, destination)
  return res.status(result.statusCode).json(result)
}

export const getRouteMap = async (req, res) =>
  res
    .status(
      (await routeService.fetchedRouteMapService(req.params.id)).statusCode,
    )
    .json(await routeService.fetchedRouteMapService(req.params.id))

export const estimateRoute = async (req, res) =>
  res
    .status(
      (await routeService.estimatedRouteService(req.params.id)).statusCode,
    )
    .json(await routeService.estimatedRouteService(req.params.id))

export const getRouteStats = async (req, res) => {
  const result = await routeService.getRouteStatsService()

  return res.status(result.statusCode).json(result)
}
