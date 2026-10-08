import jwt from "jsonwebtoken"
import crypto from "crypto"

const ACCESS_TOKEN_EXPIRES = "15m"
const REFRESH_TOKEN_EXPIRES = "15d"
export const REFRESH_TOKEN_MS = 15 * 24 * 60 * 60 * 1000 // 15 days consistent with JWT
const JWT_ALGORITHM = "HS512"
const TOKEN_ISSUER = process.env.JWT_ISSUER || "habeshago-api"
const TOKEN_AUDIENCE = process.env.JWT_AUDIENCE || "habeshago-clients"

import prisma from "../prisma/client.js"
// hashToken is defined locally in this file for refresh token hashing
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
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
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
      sameSite: isProduction ? "none" : "lax",
      maxAge: REFRESH_TOKEN_MS,
      path: "/",
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
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
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
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
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
      sameSite: isProduction ? "none" : "lax",
      maxAge: REFRESH_TOKEN_MS,
      path: "/",
    })

    // Generate one-time code and store access token in Redis (30s TTL)
    const code = crypto.randomUUID()
    await redis.set(`oauth_code:${code}`, accessToken, { ex: 30 })

    const base = process.env.FRONTEND_URL
    const roleRedirects = {
      ADMIN: `${base}/admin`,
      EV_CHARGER_MANAGER: `${base}/ev-charge-manager`,
      PARKING_MANAGER: `${base}/admin/manage-parking`,
      PASSENGER: `${base}/user`,
      DRIVER: `${base}/admin`, // default for driver in web app
    }

    const redirectUrl = roleRedirects[user.role] || `${base}/admin`
    return res.redirect(`${redirectUrl}?code=${code}`)
  } catch (err) {
    console.error("Token issuance failed:", err)
    return res.status(500).json({ message: "Failed to issue tokens" })
  }
}

export const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set")
  const subject = payload.sub || payload.id
  if (!subject || !payload.sessionId) {
    throw new Error("Access token subject and session are required")
  }
  const { sub: _sub, ...claims } = payload
  return jwt.sign({ ...claims, type: "access" }, process.env.JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: ACCESS_TOKEN_EXPIRES,
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    subject,
    jwtid: crypto.randomUUID(),
  })
}

export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    })
    if (
      decoded.type !== "access" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.jti !== "string" ||
      typeof decoded.sessionId !== "string"
    ) {
      throw new Error("Invalid access token type")
    }
    return decoded
  } catch (err) {
    throw new Error("Invalid or expired access token")
  }
}

export const generateRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET)
    throw new Error("JWT_REFRESH_SECRET is not set")
  const subject = payload.sub || payload.id
  if (!subject) throw new Error("Refresh token subject is required")
  return jwt.sign({ type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: REFRESH_TOKEN_EXPIRES,
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    subject,
    jwtid: crypto.randomUUID(),
  })
}

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      algorithms: [JWT_ALGORITHM],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    })
    if (
      decoded.type !== "refresh" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.jti !== "string"
    ) {
      throw new Error("Invalid refresh token type")
    }
    return decoded
  } catch (err) {
    throw new Error("Invalid or expired refresh token")
  }
}

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex")
}

// Precomputed dummy bcrypt hash for constant-time comparison against timing attacks
export const DUMMY_BCRYPT_HASH =
  "$2b$10$e8wF3QvXv0U5P2cWvW6G9eI5nQpYvjL1F6rGvH3bY5qE8wF3QvXv0"

export const generateMFAToken = (payload) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set")
  const jti = crypto.randomUUID()
  const subject = payload.sub || payload.id
  if (!subject) throw new Error("MFA token subject is required")
  const { sub: _sub, ...claims } = payload
  return jwt.sign(
    { ...claims, id: subject, type: "mfa_pending" },
    process.env.JWT_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: "5m",
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      subject,
      jwtid: jti,
    },
  )
}

export const verifyMFAToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    })
    if (
      decoded.type !== "mfa_pending" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.jti !== "string"
    ) {
      throw new Error("Invalid token type")
    }
    return decoded
  } catch (err) {
    throw new Error("Invalid or expired MFA session")
  }
}

export const generateMFAEnrollmentToken = (payload) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set")
  const subject = payload.sub || payload.id
  if (!subject) throw new Error("MFA enrollment subject is required")
  return jwt.sign(
    { role: payload.role, type: "mfa_enrollment" },
    process.env.JWT_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: "10m",
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      subject,
      jwtid: crypto.randomUUID(),
    },
  )
}

export const verifyMFAEnrollmentToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    })
    if (
      decoded.type !== "mfa_enrollment" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.jti !== "string"
    ) {
      throw new Error("Invalid token type")
    }
    return decoded
  } catch {
    throw new Error("Invalid or expired MFA enrollment")
  }
}

export const validateAuthSecrets = () => {
  const jwtSecret = process.env.JWT_SECRET || ""
  const refreshSecret = process.env.JWT_REFRESH_SECRET || ""
  const sessionSecret = process.env.SESSION_SECRET || ""

  if (Buffer.byteLength(jwtSecret) < 64) {
    throw new Error("JWT_SECRET must contain at least 64 bytes")
  }
  if (Buffer.byteLength(refreshSecret) < 64) {
    throw new Error("JWT_REFRESH_SECRET must contain at least 64 bytes")
  }
  if (Buffer.byteLength(sessionSecret) < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 bytes")
  }
  if (
    jwtSecret === refreshSecret ||
    jwtSecret === sessionSecret ||
    refreshSecret === sessionSecret
  ) {
    throw new Error("JWT, refresh-token, and session secrets must be distinct")
  }
}
