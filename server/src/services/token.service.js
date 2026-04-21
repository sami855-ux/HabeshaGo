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
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
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
export const issueMobileTokens = async (user, req, res) => {
  try {
    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" })
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken({ sub: user.id })

    // Store hashed refresh token for session tracking
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: await hashPassword(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    })

    // Generate access token
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    })

    // ✅ MOBILE-FRIENDLY RESPONSE (NO COOKIES)
    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error("Token issuance failed:", err)
    return res.status(500).json({ message: "Failed to issue tokens" })
  }
}

//Socal IssueToken
export const issueTokensSocial = async (user, req, res) => {
  try {
    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" })
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken({ sub: user.id })

    // Store hashed refresh token in DB
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: await hashPassword(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    })

    // Generate access token
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    })

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    })

    // Decide role-based redirect URL
    let redirectUrl = "http://localhost:3000"
    switch (user.role) {
      case "ADMIN":
        redirectUrl = "http://localhost:3000/admin"
        break
      case "DRIVER":
        redirectUrl = "http://localhost:3000/driver"
        break
      case "PASSENGER":
        redirectUrl = "http://localhost:3000/user"
        break
      case "EV_CHARGER_MANAGER":
        redirectUrl = "http://localhost:3000/ev-charge-manager"
        break
      case "PARKING_MANAGER":
        redirectUrl = "http://localhost:3000/parking-manager"
        break
    }
    return res.redirect(redirectUrl)
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
