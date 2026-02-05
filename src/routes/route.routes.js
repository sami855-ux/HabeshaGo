import express from "express"
import {
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
  activateRoute,
  deactivateRoute,
  suspendRoute,
  resumeRoute,
  searchRoutes,
  getRouteMap,
  estimateRoute,
  getRouteStats,
} from "../controllers/route.controller.js"

const router = express.Router()

// CRUD
router.post("/", createRoute)
router.get("/stats", getRouteStats)
router.get("/", getRoutes)
router.get("/search", searchRoutes)
router.get("/:id", getRouteById)
router.put("/:id", updateRoute)
router.delete("/:id", deleteRoute)

// status management
router.patch("/:id/activate", activateRoute)
router.patch("/:id/deactivate", deactivateRoute)
router.patch("/:id/suspend", suspendRoute)
router.patch("/:id/resume", resumeRoute)

// extra/public helpers
router.get("/:id/map", getRouteMap)
router.get("/:id/estimate", estimateRoute)

export default router
