import express from "express"
import {
  updateMidPoint,
  deleteMidPoint,
  reorderMidPoints,
} from "../controllers/midpoint.controller.js"

const router = express.Router()

router.patch("/:routeId/reorder", reorderMidPoints)
router.put("/:id", updateMidPoint)
router.delete("/:id", deleteMidPoint)

export default router
