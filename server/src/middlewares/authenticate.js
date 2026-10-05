import jwt from "jsonwebtoken"
import prisma from "../prisma/client.js"
import { errorResponse } from "../utils/apiResponse.js"
import { redis } from "../config/redis.js"
import { hashToken } from "../services/token.service.js"

/**
 * Authentication middleware
 * - Zero-Trust token blacklisting via Redis
 * - Verifies access token cryptographic signature
 * - Checks session, user suspension, and account deletion
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

    // 1. Instant check against Redis token blacklist (zero-trust revocation)
    try {
      const tokenHash = hashToken(token)
      const isBlacklisted = await redis.get(`bl:${tokenHash}`)
      if (isBlacklisted) {
        return res
          .status(401)
          .json(errorResponse("Token has been revoked. Please log in again.", 401))
      }
    } catch (redisErr) {
      // Redis fallback: proceed to JWT verification if Redis is briefly unreachable
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

    if (user.isDeleted) {
      return res.status(403).json(errorResponse("Account has been deleted", 403))
    }

    if (user.isSuspended) {
      return res.status(403).json(errorResponse("Account suspended", 403))
    }

    // 2. Check global user-level revocation timestamp (e.g. logout-all or security reset)
    try {
      const revokedAllAt = await redis.get(`user_revoked_all:${user.id}`)
      if (revokedAllAt && decoded.iat && decoded.iat * 1000 < Number(revokedAllAt)) {
        return res
          .status(401)
          .json(errorResponse("Session invalidated by security event. Please log in again.", 401))
      }
    } catch (e) {}

    // 3. Verify session in DB
    if (decoded.sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: decoded.sessionId },
      })
      if (!session || session.revoked || session.expiresAt < new Date()) {
        return res
          .status(401)
          .json(errorResponse("Session has been revoked or expired", 401))
      }
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      sessionId: decoded.sessionId || null,
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
