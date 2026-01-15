import express from "express"
import {
  createRouteHandler,
  getRoutesHandler,
  getRouteHandler,
  updateRouteHandler,
  deleteRouteHandler,
  routeValidators,
  getRouteStats,
  getAllMidPointNamesService,
} from "../controllers/route.controller.js"

const router = express.Router()
const { validate, createRouteSchema, updateRouteSchema } = routeValidators

router.post("/", validate(createRouteSchema), createRouteHandler)
router.get("/get", getAllMidPointNamesService)
router.get("/", getRoutesHandler)
router.get("/stats", getRouteStats)
router.get("/:id", getRouteHandler)
router.patch("/:id", validate(updateRouteSchema), updateRouteHandler)
router.delete("/:id", deleteRouteHandler)

export default router
