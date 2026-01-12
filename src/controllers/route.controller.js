import {
  createRouteService,
  findAllRoutes,
  findRouteById,
  updateRoute,
  removeRoute,
} from "../services/route.service.js"
import {
  createRouteSchema,
  updateRouteSchema,
} from "../schemas/route.schema.js"

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body)
    next()
  } catch (err) {
    res.status(400).json({ error: err.errors })
  }
}

export const createRouteHandler = async (req, res) => {
  try {
    const result = await createRouteService(req.body)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Unexpected error creating route:", error)

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while creating route.",
      data: null,
    })
  }
}

export const getRoutesHandler = async (req, res) => {
  const routes = await findAllRoutes(req.query)
  res.json(routes)
}

export const getRouteHandler = async (req, res) => {
  const route = await findRouteById(req.params.id)
  res.json(route)
}

export const updateRouteHandler = async (req, res) => {
  const route = await updateRoute(req.params.id, req.body)
  res.json(route)
}

export const deleteRouteHandler = async (req, res) => {
  const result = await removeRoute(req.params.id)
  res.json(result)
}

export const routeValidators = {
  validate,
  createRouteSchema,
  updateRouteSchema,
}
