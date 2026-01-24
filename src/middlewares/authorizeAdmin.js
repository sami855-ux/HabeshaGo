import { errorResponse } from "../utils/apiResponse.js"

export const authorizeAdmin = (req, res, next) => {
  try {
    // Ensure user info exists
    if (!req.user) {
      return res.status(401).json(errorResponse("User not authenticated", 401))
    }

    // Check if role is ADMIN
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json(errorResponse("Access denied: Admins only", 403))
    }

    // User is admin, proceed
    next()
  } catch (err) {
    console.error("authorizeAdmin error:", err)
    return res.status(500).json(errorResponse("Internal server error", 500))
  }
}
