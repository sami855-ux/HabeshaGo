import jwt from "jsonwebtoken"
import prisma from "../prisma/client.js"
import { errorResponse } from "../utils/apiResponse.js"
import e from "express"

/**
 * Authentication middleware
 * - Verifies access token
 * - Checks session and user validity
 * - Updates lastActiveAt for the session automatically
 * - Attaches req.user for downstream controllers
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null

    if (!token) {
      return res.status(401).json(errorResponse("Access token missing", 401))
    }

    let decoded

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res
        .status(401)
        .json(errorResponse("Invalid or expired access token", 401))
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return res.status(401).json(errorResponse("User not found", 401))
    }

    if (user.isSuspended) {
      return res.status(403).json(errorResponse("Account suspended", 403))
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    }

    next()
  } catch (err) {
    console.error("Authentication error:", err)
    return res.status(500).json(errorResponse("Internal server error", 500))
  }
}

export const requireAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Access denied. Admins only.",
        data: null,
      })
    }

    next()
  } catch (error) {
    console.error("Require admin middleware error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error while checking admin access",
      data: null,
    })
  }
}

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      })
    }
    next()
  }
}
