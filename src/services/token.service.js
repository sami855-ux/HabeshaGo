import jwt from "jsonwebtoken"
import crypto from "crypto"

const ACCESS_TOKEN_EXPIRES = "15m"
const REFRESH_TOKEN_EXPIRES = "15d"
const JWT_ALGORITHM = "HS256"

import prisma from "../prisma/client.js"
import "dotenv"
import { hashPassword } from "./password.service.js"

// console.log(first)
/**
 * Issue access and refresh tokens for a user
 * @param {Object} user - Prisma User object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const issueTokens = async (user, req, res) => {
  try {
    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" })
    }

    // Generate refresh token JWT
    const refreshToken = generateRefreshToken({ sub: user.id })

    // Store hashed refresh token in DB for session tracking
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: await hashPassword(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    })

    // Generate access token JWT
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    })

    // Send refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    })

    // Return access token in response body
    return res.json({
      userId: user.id,
      accessToken,
      message: "Email Verfied Successfuly",
      success: true,
    })
  } catch (err) {
    console.error("Token issuance failed:", err)
    return res.status(500).json({ message: "Failed to issue tokens" })
  }
}

// ACCESS TOKEN
export const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set")
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: ACCESS_TOKEN_EXPIRES,
  })
}

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    })
  } catch (err) {
    throw new Error("Invalid or expired access token")
  }
}

// REFRESH TOKEN
export const generateRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET)
    throw new Error("JWT_REFRESH_SECRET is not set")
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: REFRESH_TOKEN_EXPIRES,
  })
}

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      algorithms: [JWT_ALGORITHM],
    })
  } catch (err) {
    throw new Error("Invalid or expired refresh token")
  }
}

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex")
}
