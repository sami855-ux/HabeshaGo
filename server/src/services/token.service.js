import jwt from "jsonwebtoken"
import crypto from "crypto"

const ACCESS_TOKEN_EXPIRES = "60m"
const REFRESH_TOKEN_EXPIRES = "15d"
const JWT_ALGORITHM = "HS256"

import prisma from "../prisma/client.js"
import { hashPassword } from "./password.service.js"
import { redis } from "../config/redis.js"

const isProduction = process.env.NODE_ENV === "production"

/**
 * Issue access and refresh tokens for a user (email/OTP login)
 */
export const issueTokens = async (user, req, res) => {
  try {
    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" })
    }

    const refreshToken = generateRefreshToken({ sub: user.id })

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: await hashPassword(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    })

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    })

    return res.json({
      userId: user.id,
      accessToken,
      message: "Email Verified Successfully",
      success: true,
    })
  } catch (err) {
    console.error("Token issuance failed:", err)
    return res.status(500).json({ message: "Failed to issue tokens" })
  }
}

/**
 * Issue tokens for mobile (no cookies — tokens in response body)
 */
export const issueMobileTokens = async (user, req, res) => {
  try {
    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" })
    }

    const refreshToken = generateRefreshToken({ sub: user.id })

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: await hashPassword(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    })

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    })

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

/**
 * Issue tokens for social OAuth (Google, etc.) — one-time code pattern
 */
export const issueTokensSocial = async (user, req, res) => {
  try {
    if (user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" })
    }

    const refreshToken = generateRefreshToken({ sub: user.id })

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: await hashPassword(refreshToken),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    })

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    })

    // Generate one-time code and store access token in Redis (30s TTL)
    const code = crypto.randomUUID()
    await redis.set(`oauth_code:${code}`, accessToken, { ex: 30 })

    const base = process.env.FRONTEND_URL
    const roleRedirects = {
      ADMIN: `${base}/admin`,
      DRIVER: `${base}/driver`,
      PASSENGER: `${base}/user`,
      EV_CHARGER_MANAGER: `${base}/ev-charge-manager`,
      PARKING_MANAGER: `${base}/parking-manager`,
    }

    const redirectUrl = roleRedirects[user.role] || base
    return res.redirect(`${redirectUrl}?code=${code}`)
  } catch (err) {
    console.error("Token issuance failed:", err)
    return res.status(500).json({ message: "Failed to issue tokens" })
  }
}

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
