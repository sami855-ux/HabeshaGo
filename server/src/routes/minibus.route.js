import express from "express";
import minibusController from "../controllers/minibus.controller.js";

const router = express.Router();

router.post("/", minibusController.create);
router.get("/", minibusController.list);
router.get("/:id", minibusController.get);
router.patch("/:id", minibusController.update);
router.delete("/:id", minibusController.delete);

export default router;
