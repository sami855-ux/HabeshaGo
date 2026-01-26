import express from "express"
import {
  deleteUser,
  getAllUsers,
  updateMyProfile,
  sendOtp,
  verifyOtp,
} from "../controllers/user.controller.js"
import { authenticate } from "../middlewares/authenticate.js"
import { upload } from "../config/multer.js"

const router = express.Router()

// Define user-related routes here
// Get all users for the administrator
router.get("/", getAllUsers)

//update user
router.patch(
  "/me/profile",
  authenticate,
  upload.single("avatar"),
  updateMyProfile,
)
//Send OTP for email or phone verification
router.post("/me/send-otp", authenticate, sendOtp)

//Verify OTP for email or phone verification
router.post("/me/verify-otp", authenticate, verifyOtp)

//Delete user (soft delete)
router.delete("/:id", deleteUser)

export default router
