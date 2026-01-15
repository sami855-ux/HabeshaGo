import express from "express"
import { deleteUser, getAllUsers } from "../controllers/user.controller.js"

const router = express.Router()

// Define user-related routes here
// Get all users for the administrator
router.get("/", getAllUsers)

//Delete user (soft delete)
router.delete("/:id", deleteUser)

export default router
