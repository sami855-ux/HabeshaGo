import {
  createRoute,
  findAllRoutes,
  findRouteById,
  updateRoute,
  removeRoute,
} from "../services/route.service.js";
import {
  createRouteSchema,
  updateRouteSchema,
} from "../schemas/route.schema.js";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ error: err.errors });
  }
};

export const createRouteHandler = async (req, res) => {
  const route = await createRoute(req.body);
  res.json(route);
};

export const getRoutesHandler = async (req, res) => {
  const routes = await findAllRoutes(req.query);
  res.json(routes);
};

export const getRouteHandler = async (req, res) => {
  const route = await findRouteById(req.params.id);
  res.json(route);
};

export const updateRouteHandler = async (req, res) => {
  const route = await updateRoute(req.params.id, req.body);
  res.json(route);
};

export const deleteRouteHandler = async (req, res) => {
  const result = await removeRoute(req.params.id);
  res.json(result);
};

export const routeValidators = {
  validate,
  createRouteSchema,
  updateRouteSchema,
};
