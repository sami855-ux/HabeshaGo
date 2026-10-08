import crypto from "node:crypto"
import prisma from "../prisma/client.js"
import { sendOTP } from "../services/otp.service.js"
import {
  generateAccessToken,
  generateMFAEnrollmentToken,
  generateMFAToken,
  generateRefreshToken,
  hashToken,
  issueMobileTokens,
  issueTokens,
  issueTokensSocial,
  verifyMFAToken,
  verifyMFAEnrollmentToken,
  verifyRefreshToken,
  DUMMY_BCRYPT_HASH,
  REFRESH_TOKEN_MS,
} from "../services/token.service.js"

/**
 * Strong password policy validator:
 * Enforces at least 8 characters, uppercase, lowercase, number, and special symbol
 */
export const isStrongPassword = (pwd) => {
  if (typeof pwd !== "string" || pwd.length < 8) return false
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasDigit = /[0-9]/.test(pwd)
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
  return hasUpper && hasLower && hasDigit && hasSpecial
}
import { hashPassword, verifyPassword } from "../services/password.service.js"
import {
  verifyTOTP,
  verifyTOTPWithStep,
  generate2FASecret,
  generateRecoveryPhrases,
  hashRecoveryPhrase,
  hashRecoveryPhrases,
  verifyRecoveryPhrase,
  encryptTOTPSecret,
  decryptTOTPSecret,
} from "../services/2fa.service.js"
import { STAFF_ROLES } from "../utils/constants.js"

import dotenv from "dotenv"
import { errorResponse, successResponse } from "../utils/apiResponse.js"
import admin from "../config/firebaseAdmin.js"
import { generateReferralCode } from "../utils/qrcode.js"
import axios from "axios"
import { redis } from "../config/redis.js"
dotenv.config()

const safeParseRecoveryHashes = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val.map((x) => String(x))
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [String(parsed)]
    } catch {
      return val.split(",").map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}

const consumeOtpRecord = async (otp) => {
  const consumed = await prisma.otpCode.updateMany({
    where: {
      id: otp.id,
      used: false,
      expiresAt: { gt: new Date() },
      attempts: { lt: otp.maxAttempts },
    },
    data: { used: true },
  })
  return consumed.count === 1
}

const recordFailedOtpAttempt = (otp) =>
  prisma.otpCode.updateMany({
    where: {
      id: otp.id,
      used: false,
      attempts: { lt: otp.maxAttempts },
    },
    data: { attempts: { increment: 1 } },
  })

const revokeAllUserSessions = async (userId) => {
  await prisma.session.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  })
  try {
    await redis.set(`user_revoked_all:${userId}`, Date.now().toString(), {
      ex: 86400,
    })
  } catch {}
}

// Registration
export const register = async (req, res) => {
  try {
    const { email, name } = req.body
    if (!email)
      return res
        .status(400)
        .json({ message: "Email is required", success: false })

    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) user = await prisma.user.create({ data: { email, name } })
    if (STAFF_ROLES.includes(user.role)) {
      // Do not expose whether the address belongs to privileged staff.
      return res.json({ message: "OTP sent to email", success: true })
    }

    await sendOTP(user, "login")
    res.json({ message: "OTP sent to email", success: true })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Registration failed", success: false })
  }
}

export const verifyOtpPhone = async (req, res) => {
  try {
    const { idToken } = req.body

    if (!idToken)
      return res.status(400).json(errorResponse("ID token is required", 400))

    // 1. Verify the Firebase OTP token
    const decoded = await admin.auth().verifyIdToken(idToken)
    const phone = decoded.phone_number

    if (!phone)
      return res.status(400).json(errorResponse("Invalid phone number", 400))

    // 2. Find the user in your Neon DB
    let user = await prisma.user.findUnique({ where: { phone } })

    const referralCode = generateReferralCode(user?.name || "USR")
    // 3. If the user doesn't exist, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: "PASSENGER",
          referralCode,
          phoneVerified: true,
        },
      })
    }

    if (STAFF_ROLES.includes(user.role)) {
      return res.status(403).json(errorResponse("Use staff sign-in", 403))
    }

    // 4. Issue JWT and respond using your helper
    return issueTokens(user, req, res)
  } catch (err) {
    console.error("verifyOtp error:", err)
    return res.status(401).json(errorResponse("OTP verification failed", 401))
  }
}

export const verifyAppOtpPhone = async (req, res) => {
  try {
    const { idToken } = req.body

    if (!idToken)
      return res.status(400).json(errorResponse("ID token is required", 400))

    // 1. Verify the Firebase OTP token
    const decoded = await admin.auth().verifyIdToken(idToken)
    const phone = decoded.phone_number

    if (!phone)
      return res.status(400).json(errorResponse("Invalid phone number", 400))

    // 2. Find the user in your Neon DB
    let user = await prisma.user.findUnique({ where: { phone } })

    const referralCode = generateReferralCode(user?.name || "USR")
    // 3. If the user doesn't exist, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: "PASSENGER",
          referralCode,
          phoneVerified: true,
        },
      })
    }

    if (STAFF_ROLES.includes(user.role)) {
      return res.status(403).json(errorResponse("Use staff sign-in", 403))
    }

    // 4. Issue JWT and respond using your helper
    return issueMobileTokens(user, req, res)
  } catch (err) {
    console.error("verifyOtp error:", err)
    return res.status(401).json(errorResponse("OTP verification failed", 401))
  }
}
// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code)
      return res
        .status(400)
        .json({ message: "Email and OTP code are required", success: false })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user)
      return res.status(404).json({ message: "User not found", success: false })
    if (STAFF_ROLES.includes(user.role)) {
      return res.status(403).json({ message: "Use staff sign-in", success: false })
    }

    const otp = await prisma.otpCode.findFirst({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    })

    if (!otp)
      return res
        .status(400)
        .json({ message: "OTP expired or not found", success: false })
    if (otp.attempts >= otp.maxAttempts)
      return res
        .status(429)
        .json({ message: "Too many incorrect attempts", success: false })

    const isValid = await verifyPassword(code, otp.codeHash)
    if (!isValid) {
      await recordFailedOtpAttempt(otp)
      return res.status(400).json({ message: "Invalid OTP", success: false })
    }

    if (!(await consumeOtpRecord(otp))) {
      return res
        .status(401)
        .json({ message: "OTP has already been used", success: false })
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })

    return issueTokens(user, req, res)
  } catch (err) {
    console.error("Verify OTP error:", err)
    return res
      .status(500)
      .json({ message: "OTP verification failed", success: false })
  }
}

// Verify OTP for app
export const verifyOTPApp = async (req, res) => {
  try {
    const { email, code } = req.body
    if (!email || !code)
      return res
        .status(400)
        .json({ message: "Email and OTP code are required", success: false })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user)
      return res.status(404).json({ message: "User not found", success: false })
    if (STAFF_ROLES.includes(user.role)) {
      return res.status(403).json({ message: "Use staff sign-in", success: false })
    }

    const otp = await prisma.otpCode.findFirst({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    })

    if (!otp)
      return res
        .status(400)
        .json({ message: "OTP expired or not found", success: false })
    if (otp.attempts >= otp.maxAttempts)
      return res
        .status(429)
        .json({ message: "Too many incorrect attempts", success: false })

    const isValid = await verifyPassword(code, otp.codeHash)
    if (!isValid) {
      await recordFailedOtpAttempt(otp)
      return res.status(400).json({ message: "Invalid OTP", success: false })
    }

    if (!(await consumeOtpRecord(otp))) {
      return res
        .status(401)
        .json({ message: "OTP has already been used", success: false })
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })

    return issueMobileTokens(user, req, res) // ✅ issue mobile tokens
  } catch (err) {
    console.error("Verify OTP App error:", err)
    return res
      .status(500)
      .json({ message: "OTP verification failed", success: false })
  }
}

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: "Email is required" })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ message: "User not found" })
    if (STAFF_ROLES.includes(user.role)) {
      return res.status(403).json({ message: "Use staff sign-in" })
    }

    await sendOTP(user, "resend")
    res.json({ message: "OTP resent successfully", success: true })
  } catch (error) {
    console.error("Resend OTP error:", error)
    res.status(500).json({ message: "Failed to resend OTP", success: false })
  }
}

// Continue with apple
export const appleAuth = async (req, res) => {
  try {
    const { token } = req.body

    const decoded = await admin.auth().verifyIdToken(token)

    const { uid, email, name, picture } = decoded

    let user = await prisma.user.findUnique({
      where: { appleId: uid },
    })

    if (!user && email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        if (STAFF_ROLES.includes(existingUser.role)) {
          return res.status(403).json(errorResponse("Use staff sign-in", 403))
        }
        user = await prisma.user.update({
          where: { email },
          data: {
            appleId: uid,
            emailVerified: true,
            ...(picture && !existingUser.avaterUrl
              ? { avaterUrl: picture }
              : {}),
          },
        })
      }
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          appleId: uid,
          email,
          name,
          avaterUrl: picture,
          emailVerified: true,
          role: "PASSENGER",
        },
      })
    }

    if (STAFF_ROLES.includes(user.role)) {
      return res.status(403).json(errorResponse("Use staff sign-in", 403))
    }

    // Issue tokens + get JSON response
    await issueTokensSocial(user, req, res)
  } catch (error) {
    res.status(401).json({
      error: "Invalid token",
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avaterUrl: true,
        bio: true,
        location: true,
        emailVerified: true,
        phoneVerified: true,
        passengerCategory: true,
        createdAt: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            points: true,
            currency: true,
            isActive: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false })
    }

    res.json({ user, success: true })
  } catch (err) {
    console.error("Get current user error:", err)
    res.status(500).json({ message: "Failed to fetch user data" })
  }
}

export const googleCallback = async (req, res) => {
  try {
    const user = req.user

    // Issue tokens + get JSON response
    await issueTokensSocial(user, req, res)
  } catch (err) {
    console.error("Google login failed:", err)
    if (!res.headersSent) {
      return res.status(500).json({ message: "Google login failed" })
    }
  }
}


export const refreshToken = async (req, res) => {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!incomingToken) {
      return res.status(401).json({ message: "No refresh token" })
    }

    // Verify JWT signature
    const decoded = verifyRefreshToken(incomingToken)

    // Validate against stored hash in DB
    const incomingHash = hashToken(incomingToken)
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.sub,
        refreshTokenHash: incomingHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!session) {
      // Security Defense: Detect refresh token reuse / theft
      const revokedSession = await prisma.session.findFirst({
        where: {
          userId: decoded.sub,
          refreshTokenHash: incomingHash,
          revoked: true,
        },
      })
      if (revokedSession) {
        console.warn(
          `[SECURITY ALERT] Refresh token reuse detected for user ${decoded.sub}. Revoking all sessions.`,
        )
        await revokeAllUserSessions(decoded.sub)
        return res
          .status(403)
          .json(
            errorResponse(
              "Security alert: session compromised. All sessions revoked.",
              403,
            ),
          )
      }
      return res.status(403).json(errorResponse("Invalid or expired session", 403))
    }

    if (session.user.isSuspended || session.user.isDeleted) {
      return res.status(403).json({ message: "Account unavailable" })
    }

    const user = session.user

    // Rotate refresh token
    const newRefreshToken = generateRefreshToken({ sub: user.id })
    const newHashedToken = hashToken(newRefreshToken)

    const rotated = await prisma.session.updateMany({
      where: {
        id: session.id,
        refreshTokenHash: incomingHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      data: {
        refreshTokenHash: newHashedToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
        lastActiveAt: new Date(),
      },
    })
    if (rotated.count !== 1) {
      await revokeAllUserSessions(user.id)
      return res
        .status(403)
        .json(errorResponse("Security alert: refresh token reuse detected", 403))
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    })

    const isProduction = process.env.NODE_ENV === "production"

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: REFRESH_TOKEN_MS,
      path: "/",
    })

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error("Refresh token error:", err)
    return res.status(403).json({ message: "Invalid or expired refresh token" })
  }
}

export const refreshTokenApp = async (req, res) => {
  try {
    // Get refresh token from request body (mobile-safe)
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" })
    }

    // Verify JWT signature
    const decoded = verifyRefreshToken(refreshToken)

    // Hash incoming token to match DB (deterministic SHA-256)
    const hashedToken = hashToken(refreshToken)

    // Find valid session
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.sub,
        refreshTokenHash: hashedToken,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!session) {
      const revokedSession = await prisma.session.findFirst({
        where: {
          refreshTokenHash: hashedToken,
          revoked: true,
        },
      })
      if (revokedSession) {
        console.warn(
          `[SECURITY ALERT] Mobile refresh token reuse detected for user ${revokedSession.userId}. Revoking all sessions.`,
        )
        await revokeAllUserSessions(revokedSession.userId)
        return res
          .status(403)
          .json(
            errorResponse(
              "Security alert: session compromised. All sessions revoked.",
              403,
            ),
          )
      }
      return res.status(403).json(errorResponse("Invalid or expired session", 403))
    }

    if (session.user.isSuspended || session.user.isDeleted) {
      return res.status(403).json(errorResponse("Account unavailable", 403))
    }

    // Rotate refresh token
    const newRefreshToken = generateRefreshToken({ sub: session.user.id })
    const newHashedToken = hashToken(newRefreshToken)

    const rotated = await prisma.session.updateMany({
      where: {
        id: session.id,
        refreshTokenHash: hashedToken,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      data: {
        refreshTokenHash: newHashedToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
        lastActiveAt: new Date(),
      },
    })
    if (rotated.count !== 1) {
      await revokeAllUserSessions(session.user.id)
      return res
        .status(403)
        .json(errorResponse("Security alert: refresh token reuse detected", 403))
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    })

    // Return tokens (NO COOKIES)
    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
    })
  } catch (err) {
    console.error("Refresh token error:", err)
    return res.status(403).json({ message: "Invalid or expired refresh token" })
  }
}

export const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production"

    // 1. Blacklist caller's Bearer access token in Redis (zero-trust token revocation)
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null
    if (token) {
      try {
        await redis.set(`bl:${hashToken(token)}`, "1", { ex: 3600 })
      } catch (e) {}
    }

    // 2. Revoke the session in DB if sessionId is available
    if (req.user?.sessionId) {
      await prisma.session.updateMany({
        where: { id: req.user.sessionId },
        data: { revoked: true },
      })
    }

    // 3. Also revoke by incoming cookie or body refresh token hash if present
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken
    if (incomingToken) {
      await prisma.session.updateMany({
        where: { refreshTokenHash: hashToken(incomingToken) },
        data: { revoked: true },
      })
    }

    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })

    return res.json({ message: "Logged out successfully", success: true })
  } catch (err) {
    console.error("Logout error:", err)
    return res.status(500).json({ message: "Failed to logout", success: false })
  }
}

export const googleMobileAuth = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: "Token is required" })
    }

    // 1. Verify token with Google
    const googleRes = await axios.get(
      "https://www.googleapis.com/userinfo/v2/me",
      { headers: { Authorization: `Bearer ${token}` } },
    )
    const googleUser = googleRes.data

    if (!googleUser.verified_email) {
      return res.status(401).json({ error: "Google email not verified" })
    }

    // 2. Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.id }, { email: googleUser.email }],
      },
    })

    // 3. Check suspended or deleted
    if (existingUser?.isSuspended) {
      return res.status(403).json({
        error: "Account suspended",
        reason: existingUser.suspensionReason,
        suspendedAt: existingUser.suspendedAt,
      })
    }

    if (existingUser?.isDeleted) {
      return res.status(403).json({ error: "Account has been deleted" })
    }
    if (existingUser && STAFF_ROLES.includes(existingUser.role)) {
      return res.status(403).json({ error: "Use staff sign-in" })
    }

    // 4. Find or create user
    let user

    if (existingUser) {
      // ✅ User exists — update their Google info
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: googleUser.id,
          avaterUrl: existingUser.avaterUrl ?? googleUser.picture,
          emailVerified: true,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avaterUrl: true,
          bio: true,
          location: true,
          emailVerified: true,
          phoneVerified: true,
          passengerCategory: true,
          createdAt: true,
          wallet: true,
        },
      })
    } else {
      // ✅ No user found — create new one
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.id,
          avaterUrl: googleUser.picture,
          emailVerified: true,
          role: "PASSENGER",
          passengerCategory: "NORMAL",
          emailVerified: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avaterUrl: true,
          bio: true,
          location: true,
          emailVerified: true,
          phoneVerified: true,
          passengerCategory: true,
          createdAt: true,
          wallet: true,
        },
      })
    }

    // 5. Generate refresh token & session
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

    // 6. Generate access token with sessionId
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    })

    // 7. Return response
    return res.status(200).json({
      user,
      accessToken,
      refreshToken,
      isNewUser: !existingUser,
    })
  } catch (error) {
    console.error("Google auth error:", error.message)
    return res.status(500).json({ error: "Authentication failed" })
  }
}

export const logoutAll = async (req, res) => {
  try {
    const userId = req.user.id

    // Revoke all user sessions in DB
    await prisma.session.updateMany({
      where: { userId },
      data: { revoked: true },
    })

    // Invalidate all tokens via user-level Redis timestamp
    try {
      await redis.set(
        `user_revoked_all:${userId}`,
        Date.now().toString(),
        { ex: 86400 },
      )
      const authHeader = req.headers.authorization
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null
      if (token) {
        await redis.set(`bl:${hashToken(token)}`, "1", { ex: 3600 })
      }
    } catch (e) {}

    const isProduction = process.env.NODE_ENV === "production"
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    })

    return res.json({ message: "All sessions revoked successfully", success: true })
  } catch (err) {
    console.error("LogoutAll error:", err)
    return res
      .status(500)
      .json({ message: "Failed to revoke all sessions", success: false })
  }
}


// Get all active sessions for the logged-in user
export const getSessions = async (req, res) => {
  try {
    const userId = req.user.id

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { lastActiveAt: "desc" },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        lastActiveAt: true,
        expiresAt: true,
        revoked: true,
        createdAt: true,
      },
    })

    return res
      .status(200)
      .json(successResponse("User sessions retrieved successfully", sessions))
  } catch (error) {
    console.error("getSessions error:", error)
    return res
      .status(500)
      .json(errorResponse("Failed to retrieve sessions", 500))
  }
}

// Revoke a specific session (logout from a device)
export const revokeSession = async (req, res) => {
  try {
    const userId = req.user.id
    const { sessionId } = req.params

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.userId !== userId) {
      return res.status(404).json(errorResponse("Session not found", 404))
    }

    if (session.revoked) {
      return res
        .status(400)
        .json(errorResponse("Session is already revoked", 400))
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { revoked: true },
    })

    return res.status(200).json(successResponse("Session revoked successfully"))
  } catch (error) {
    console.error("revokeSession error:", error)
    return res.status(500).json(errorResponse("Failed to revoke session", 500))
  }
}

export const exchangeOAuthCode = async (req, res) => {
  try {
    const { code } = req.query

    if (!code) {
      return res.status(400).json({ message: "Code is required" })
    }

    // Atomically get and delete — one-time use guaranteed
    const accessToken = await redis.getdel(`oauth_code:${code}`)

    if (!accessToken) {
      return res.status(400).json({ message: "Invalid or expired code" })
    }

    return res.json({ accessToken })
  } catch (err) {
    console.error("Code exchange failed:", err)
    return res.status(500).json({ message: "Exchange failed" })
  }
}

// ==========================================
// STAFF AUTHENTICATION & MULTI-FACTOR AUTH
// (DRIVER, ADMIN, EV_CHARGER_MANAGER, PARKING_MANAGER)
// ==========================================

/**
 * Step 1: Staff Login with Email & Password
 * Checks staff role, validates password, and sends an MFA code.
 */
export const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res
        .status(400)
        .json(errorResponse("Email and password are required", 400))
    }

    const normalizedEmail = email.toLowerCase().trim()
    const lockoutKey = `failed_login:${normalizedEmail}`

    // 1. Account Lockout Check: 5 failed attempts locks for 15 mins
    try {
      const attempts = await redis.get(lockoutKey)
      if (attempts && Number(attempts) >= 5) {
        return res
          .status(429)
          .json(
            errorResponse(
              "Account is temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.",
              429,
            ),
          )
      }
    } catch (e) {}

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Constant-time dummy comparison to prevent user enumeration
    if (!user || !user.password) {
      await verifyPassword(password, DUMMY_BCRYPT_HASH)
      try {
        await redis.incr(lockoutKey)
        await redis.expire(lockoutKey, 900)
      } catch (e) {}
      return res.status(401).json(errorResponse("Invalid credentials", 401))
    }

    // Check staff role
    if (!STAFF_ROLES.includes(user.role)) {
      await verifyPassword(password, DUMMY_BCRYPT_HASH)
      return res
        .status(403)
        .json(
          errorResponse("Access restricted to authorized staff members", 403),
        )
    }

    // Check suspension/deletion
    if (user.isSuspended) {
      return res
        .status(403)
        .json(
          errorResponse(
            `Account suspended: ${user.suspensionReason || "Contact administrator"}`,
            403,
          ),
        )
    }

    if (user.isDeleted) {
      return res
        .status(403)
        .json(errorResponse("Account has been deleted", 403))
    }

    // Password validation with legacy auto-upgrade
    let isPasswordValid = false
    if (
      user.password.startsWith("$2a$") ||
      user.password.startsWith("$2b$") ||
      user.password.startsWith("$2y$")
    ) {
      isPasswordValid = await verifyPassword(password, user.password)
    } else {
      const sha256 = crypto.createHash("sha256").update(password).digest("hex")
      if (user.password === password || user.password === sha256) {
        isPasswordValid = true
        // Upgrade password to bcrypt
        const upgradedHash = await hashPassword(password)
        await prisma.user.update({
          where: { id: user.id },
          data: { password: upgradedHash },
        })
      }
    }

    if (!isPasswordValid) {
      try {
        await redis.incr(lockoutKey)
        await redis.expire(lockoutKey, 900)
      } catch (e) {}
      return res.status(401).json(errorResponse("Invalid credentials", 401))
    }

    // Reset lockout counter on successful authentication
    try {
      await redis.del(lockoutKey)
    } catch (e) {}

    const hasTotp = Boolean(
      await prisma.staffMfa.findUnique({
        where: { userId: user.id },
        select: { id: true },
      }),
    )

    // Generate short-lived MFA token
    const mfaToken = generateMFAToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    if (hasTotp) {
      // 2FA is already configured: prompt user to type their 6-digit TOTP code
      return res.status(200).json(
        successResponse("Credentials verified. Please enter your 2FA code.", {
          mfaRequired: true,
          hasTotp: true,
          mfaToken,
          mfaMethod: "TOTP",
          expiresIn: 300,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        }),
      )
    }

    // First enrollment requires a separate email factor before any authenticator
    // secret or recovery phrase is disclosed.
    const rawOtp = await sendOTP(user, "login")

    return res.status(200).json(
      successResponse("Credentials verified. Verify the code sent to your email to enroll an authenticator.", {
        mfaRequired: true,
        hasTotp: false,
        mfaToken,
        mfaMethod: "EMAIL_OTP",
        expiresIn: 300,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        ...(process.env.NODE_ENV !== "production" ? { devOtp: rawOtp } : {}),
      }),
    )
  } catch (error) {
    console.error("Staff login error:", error)
    return res.status(500).json(errorResponse("Staff login failed", 500))
  }
}

/**
 * Step 2: Verify MFA code (Email OTP or Authenticator App TOTP)
 * Issues full access and refresh tokens upon successful verification.
 */
export const staffVerifyMFA = async (req, res) => {
  try {
    const { mfaToken, code } = req.body

    if (
      !mfaToken ||
      !code ||
      typeof mfaToken !== "string" ||
      typeof code !== "string"
    ) {
      return res
        .status(400)
        .json(errorResponse("MFA token and verification code are required", 400))
    }

    let decoded
    try {
      decoded = verifyMFAToken(mfaToken)
    } catch (err) {
      return res
        .status(401)
        .json(
          errorResponse(
            "MFA session has expired or is invalid. Please log in again.",
            401,
          ),
        )
    }

    // Replay and brute-force state is security-critical. Fail closed if the
    // shared store is unavailable instead of silently disabling protection.
    try {
      const isReplayed = await redis.get(`mfa_used:${decoded.jti}`)
      if (isReplayed) {
        return res.status(401).json(
          errorResponse("MFA session has already been used. Please log in again.", 401),
        )
      }
    } catch (e) {
      return res.status(503).json(errorResponse("MFA verification is temporarily unavailable", 503))
    }

    // 2. MFA Brute-Force Rate Limiting (max 5 attempts per user per session)
    const mfaFailsKey = `mfa_fails:${decoded.jti}`
    try {
      const fails = await redis.get(mfaFailsKey)
      if (fails && Number(fails) >= 5) {
        return res
          .status(429)
          .json(
            errorResponse(
              "Too many failed verification attempts. MFA session terminated.",
              429,
            ),
          )
      }
    } catch (e) {
      return res.status(503).json(errorResponse("MFA verification is temporarily unavailable", 503))
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    })

    if (!user || user.isSuspended || user.isDeleted) {
      return res
        .status(403)
        .json(errorResponse("Account suspended or not found", 403))
    }

    const cleanCode = code.toString().trim()
    let isValidMFA = false

    const staffMfa = await prisma.staffMfa.findUnique({
      where: { userId: user.id },
    })

    if (staffMfa) {
      // Enrolled staff may use only their authenticator or a one-time recovery
      // phrase. Email OTP is not a downgrade path for an existing enrollment.
      if (/^\d{6}$/.test(cleanCode)) {
        const secret = decryptTOTPSecret(staffMfa.totpSecretCiphertext)
        const matchedStep = verifyTOTPWithStep(cleanCode, secret)
        if (matchedStep !== null) {
          const consumed = await prisma.staffMfa.updateMany({
            where: {
              id: staffMfa.id,
              OR: [
                { lastUsedTotpStep: null },
                { lastUsedTotpStep: { lt: matchedStep } },
              ],
            },
            data: { lastUsedTotpStep: matchedStep },
          })
          isValidMFA = consumed.count === 1
        }
      }

      if (!isValidMFA) {
        const phraseHash = hashRecoveryPhrase(cleanCode)
        const { valid, remaining } = verifyRecoveryPhrase(
          cleanCode,
          staffMfa.recoveryCodeHashes,
        )
        if (valid) {
          const consumed = await prisma.staffMfa.updateMany({
            where: {
              id: staffMfa.id,
              recoveryCodeHashes: { has: phraseHash },
            },
            data: { recoveryCodeHashes: { set: remaining } },
          })
          isValidMFA = consumed.count === 1
        }
      }

      if (!isValidMFA) {
        try {
          await redis.incr(mfaFailsKey)
          await redis.expire(mfaFailsKey, 300)
        } catch {}
        return res.status(400).json(errorResponse("Invalid MFA code", 400))
      }
    } else {
      // A separate email factor authorizes first-time authenticator enrollment.
      const otpRecord = await prisma.otpCode.findFirst({
        where: {
          userId: user.id,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      })

      if (!otpRecord) {
        try {
          await redis.incr(mfaFailsKey)
          await redis.expire(mfaFailsKey, 300)
        } catch (e) {}
        return res
          .status(400)
          .json(
            errorResponse(
              "MFA verification code has expired or was not found",
              400,
            ),
          )
      }

      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        return res
          .status(429)
          .json(
            errorResponse(
              "Too many incorrect attempts. Please request a new code.",
              429,
            ),
          )
      }

      isValidMFA = Boolean(
        otpRecord.codeHash &&
          (await verifyPassword(cleanCode, otpRecord.codeHash)),
      )

      if (!isValidMFA) {
        await recordFailedOtpAttempt(otpRecord)
        try {
          await redis.incr(mfaFailsKey)
          await redis.expire(mfaFailsKey, 300)
        } catch (e) {}
        return res.status(400).json(errorResponse("Invalid MFA code", 400))
      }

      if (!(await consumeOtpRecord(otpRecord))) {
        return res.status(401).json(errorResponse("MFA code has already been used", 401))
      }

      try {
        const claimed = await redis.set(`mfa_used:${decoded.jti}`, "1", {
          nx: true,
          ex: 300,
        })
        if (claimed !== "OK") {
          return res.status(401).json(errorResponse("MFA session has already been used", 401))
        }
        await redis.del(mfaFailsKey)
      } catch {
        return res.status(503).json(errorResponse("MFA verification is temporarily unavailable", 503))
      }

      const enrollmentToken = generateMFAEnrollmentToken({
        sub: user.id,
        role: user.role,
      })
      return res.status(200).json(
        successResponse("Email verified. Complete authenticator enrollment.", {
          setupRequired: true,
          enrollmentToken,
          mfaToken: enrollmentToken,
          expiresIn: 600,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        }),
      )
    }

    // Atomically consume the pending login itself. NX closes the concurrent
    // request race that a separate GET/SET pair would leave open.
    try {
      const claimed = await redis.set(`mfa_used:${decoded.jti}`, "1", {
        nx: true,
        ex: 300,
      })
      if (claimed !== "OK") {
        return res.status(401).json(errorResponse("MFA session has already been used", 401))
      }
      await redis.del(mfaFailsKey)
    } catch (e) {
      return res.status(503).json(errorResponse("MFA verification is temporarily unavailable", 503))
    }

    // 3. Issue full session and tokens
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

    const isProduction = process.env.NODE_ENV === "production"
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: REFRESH_TOKEN_MS,
      path: "/",
    })

    return res.status(200).json(
      successResponse("Staff authentication successful", {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avaterUrl: user.avaterUrl,
          phone: user.phone,
        },
      }),
    )
  } catch (error) {
    console.error("Staff MFA verification error:", error)
    return res.status(500).json(errorResponse("MFA verification failed", 500))
  }
}

/**
 * Resend MFA code for pending staff login
 */
export const staffResendMFA = async (req, res) => {
  try {
    const { mfaToken } = req.body

    if (!mfaToken) {
      return res.status(400).json(errorResponse("MFA token is required", 400))
    }

    let decoded
    try {
      decoded = verifyMFAToken(mfaToken)
    } catch (err) {
      return res
        .status(401)
        .json(errorResponse("MFA session expired. Please log in again.", 401))
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    })

    if (!user || user.isSuspended || user.isDeleted) {
      return res
        .status(403)
        .json(errorResponse("Account suspended or not found", 403))
    }

    const configuredMfa = await prisma.staffMfa.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (configuredMfa) {
      return res
        .status(400)
        .json(errorResponse("Use your authenticator code or a recovery phrase", 400))
    }

    const rawOtp = await sendOTP(user, "resend")

    return res.status(200).json(
      successResponse("MFA code resent successfully", {
        ...(process.env.NODE_ENV !== "production" ? { devOtp: rawOtp } : {}),
      }),
    )
  } catch (error) {
    console.error("Staff MFA resend error:", error)
    return res.status(500).json(errorResponse("Failed to resend MFA code", 500))
  }
}

/**
 * Staff change their own password (authenticated)
 */
export const staffChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Current password and new password are required",
            400,
          ),
        )
    }

    if (!isStrongPassword(newPassword)) {
      return res
        .status(400)
        .json(
          errorResponse(
            "New password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters",
            400,
          ),
        )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json(errorResponse("User not found", 404))

    if (!user.password) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Account does not have a password configured",
            400,
          ),
        )
    }

    const isMatch = await verifyPassword(currentPassword, user.password)
    if (!isMatch) {
      return res
        .status(400)
        .json(errorResponse("Current password is incorrect", 400))
    }

    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    // Invalidate other active sessions for user upon password update
    await prisma.session.updateMany({
      where: {
        userId,
        ...(req.user?.sessionId ? { id: { not: req.user.sessionId } } : {}),
        revoked: false,
      },
      data: { revoked: true },
    })

    return res
      .status(200)
      .json(successResponse("Password updated successfully"))
  } catch (error) {
    console.error("Change password error:", error)
    return res.status(500).json(errorResponse("Failed to update password", 500))
  }
}

/**
 * Setup TOTP Authenticator App for staff (authenticated)
 * Generates QR code for Google Authenticator + 8 single-use recovery phrases
 */
export const staffSetupTOTP = async (req, res) => {
  try {
    const user = req.user
    const existing = await prisma.staffMfa.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (existing) {
      return res.status(409).json(
        errorResponse("Authenticator MFA is already enabled. Contact an administrator to reset it.", 409),
      )
    }

    const { base32, qrCode, otpauth_url } = await generate2FASecret(
      user.email || user.id,
    )
    const recoveryPhrases = generateRecoveryPhrases(8)

    // Pending data expires quickly. The secret is encrypted and phrases are
    // hashed even in temporary storage; plaintext phrases are returned once.
    await redis.set(`totp_pending:${user.id}`, encryptTOTPSecret(base32), { ex: 900 })
    await redis.set(
      `totp_backup_pending:${user.id}`,
      JSON.stringify(hashRecoveryPhrases(recoveryPhrases)),
      { ex: 900 },
    )

    return res.status(200).json(
      successResponse("Scan QR code and save your recovery phrases", {
        qrCode,
        secret: base32,
        otpauth_url,
        recoveryPhrases,
        instructions: [
          "1. Open Google Authenticator (or Authy/1Password) on your phone.",
          "2. Tap '+' and select 'Scan a QR code' to scan the QR code image.",
          "3. Alternatively, enter the manual secret key into your authenticator app.",
          "4. Copy and store the 8 recovery phrases securely offline in case you lose your device.",
          "5. Submit the 6-digit code showing in your authenticator app to /api/auth/staff/totp/enable to activate MFA.",
        ],
      }),
    )
  } catch (error) {
    console.error("TOTP setup error:", error)
    return res
      .status(500)
      .json(errorResponse("Failed to generate TOTP setup", 500))
  }
}

/**
 * Enable TOTP Authenticator App after verifying test code (authenticated)
 */
export const staffEnableTOTP = async (req, res) => {
  try {
    const { code } = req.body
    const userId = req.user.id

    if (!code) {
      return res
        .status(400)
        .json(errorResponse("Verification code is required", 400))
    }

    const pendingSecretCiphertext = await redis.get(`totp_pending:${userId}`)
    const pendingBackupJson = await redis.get(`totp_backup_pending:${userId}`)

    if (!pendingSecretCiphertext || !pendingBackupJson) {
      return res
        .status(400)
        .json(
          errorResponse(
            "No pending 2FA setup found or it has expired. Please run setup again.",
            400,
          ),
        )
    }

    const pendingSecret = decryptTOTPSecret(pendingSecretCiphertext)
    const cleanCode = code.toString().trim()
    const isValid = verifyTOTP(cleanCode, pendingSecret)
    if (!isValid) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Invalid 6-digit code. Please verify the code showing in Google Authenticator.",
            400,
          ),
        )
    }

    const recoveryCodeHashes = safeParseRecoveryHashes(pendingBackupJson)
    const initialStep = verifyTOTPWithStep(cleanCode, pendingSecret)

    // Create-only activation prevents a race from replacing an enrollment.
    await prisma.staffMfa.create({
      data: {
        userId,
        totpSecretCiphertext: pendingSecretCiphertext,
        recoveryCodeHashes,
        lastUsedTotpStep: initialStep,
      },
    })

    // Clean up temporary keys
    await redis.del(`totp_pending:${userId}`)
    await redis.del(`totp_backup_pending:${userId}`)

    return res.status(200).json(
      successResponse("Google Authenticator MFA enabled successfully!", {
        enabled: true,
        notice: "Your recovery phrases were shown once during setup. Keep the saved copy offline.",
      }),
    )
  } catch (error) {
    console.error("TOTP enable error:", error)
    return res.status(500).json(errorResponse("Failed to enable TOTP", 500))
  }
}

/**
 * View QR Code & Recovery Phrases in Browser as a styled web page
 */
export const staffViewQRPage = async (req, res) => {
  return res.status(404).json(errorResponse("Route not found", 404))
}

/**
 * Admin set password for staff user (Admin only)
 */
export const adminSetStaffPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body

    if (!userId || !newPassword) {
      return res
        .status(400)
        .json(errorResponse("User ID and new password are required", 400))
    }

    if (!isStrongPassword(newPassword)) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters",
            400,
          ),
        )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json(errorResponse("User not found", 404))
    if (!STAFF_ROLES.includes(user.role)) {
      return res.status(400).json(errorResponse("Target account is not staff", 400))
    }

    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
    await revokeAllUserSessions(user.id)

    return res
      .status(200)
      .json(
        successResponse(
          `Password configured for ${user.email || user.name || user.id}`,
        ),
      )
  } catch (error) {
    console.error("Admin set password error:", error)
    return res.status(500).json(errorResponse("Failed to set password", 500))
  }
}

/**
 * Regenerate or fetch pending TOTP setup during staff login before full session exists
 */
export const staffSetupPendingTOTP = async (req, res) => {
  try {
    const { mfaToken } = req.body

    if (!mfaToken) {
      return res.status(400).json(errorResponse("MFA token is required", 400))
    }

    let decoded
    try {
      decoded = verifyMFAEnrollmentToken(mfaToken)
    } catch (err) {
      return res
        .status(401)
        .json(errorResponse("MFA enrollment expired. Please log in again.", 401))
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    })

    if (
      !user ||
      user.isSuspended ||
      user.isDeleted ||
      !STAFF_ROLES.includes(user.role)
    ) {
      return res.status(403).json(errorResponse("Account suspended or not found", 403))
    }

    const existing = await prisma.staffMfa.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (existing) {
      return res.status(409).json(
        errorResponse("2FA is already configured for this account. Contact an administrator to reset it.", 409),
      )
    }

    const { base32, qrCode, otpauth_url } = await generate2FASecret(
      user.email || user.id,
    )
    const recoveryPhrases = generateRecoveryPhrases(8)

    await redis.set(`totp_pending:${user.id}`, encryptTOTPSecret(base32), { ex: 900 })
    await redis.set(
      `totp_backup_pending:${user.id}`,
      JSON.stringify(hashRecoveryPhrases(recoveryPhrases)),
      { ex: 900 },
    )

    return res.status(200).json(
      successResponse("Scan QR code and save your recovery phrases", {
        qrCode,
        secret: base32,
        otpauth_url,
        recoveryPhrases,
        instructions: [
          "1. Open Google Authenticator (or Authy / 1Password) on your device.",
          "2. Tap '+' and select 'Scan a QR code' to scan the QR code image.",
          "3. Alternatively, enter the manual secret key into your authenticator app.",
          "4. Copy and store the 8 recovery phrases securely offline in case you lose your device.",
          "5. Submit the 6-digit code showing in your authenticator app to complete setup and log in.",
        ],
      }),
    )
  } catch (error) {
    console.error("Setup pending TOTP error:", error)
    return res.status(500).json(errorResponse("Failed to generate 2FA setup", 500))
  }
}

/**
 * Enable TOTP for pending staff login and authenticate directly
 */
export const staffEnablePendingTOTP = async (req, res) => {
  try {
    const { mfaToken, code } = req.body

    if (!mfaToken || !code || typeof code !== "string") {
      return res
        .status(400)
        .json(errorResponse("MFA enrollment token and authenticator code are required", 400))
    }

    let decoded
    try {
      decoded = verifyMFAEnrollmentToken(mfaToken)
    } catch (err) {
      return res
        .status(401)
        .json(errorResponse("MFA enrollment expired. Please log in again.", 401))
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    })

    if (
      !user ||
      user.isSuspended ||
      user.isDeleted ||
      !STAFF_ROLES.includes(user.role)
    ) {
      return res.status(403).json(errorResponse("Account suspended or not found", 403))
    }

    const pendingSecretCiphertext = await redis.get(`totp_pending:${user.id}`)
    const pendingBackupJson = await redis.get(`totp_backup_pending:${user.id}`)

    if (!pendingSecretCiphertext || !pendingBackupJson) {
      return res.status(400).json(
        errorResponse("2FA setup session expired. Please log in again.", 400),
      )
    }

    const pendingSecret = decryptTOTPSecret(pendingSecretCiphertext)
    const cleanCode = code.trim()
    const matchedStep = verifyTOTPWithStep(cleanCode, pendingSecret)
    if (matchedStep === null) {
      return res.status(400).json(
        errorResponse("Invalid 6-digit code. Please verify the code showing in your authenticator app.", 400),
      )
    }

    const recoveryCodeHashes = safeParseRecoveryHashes(pendingBackupJson)

    const enrollmentClaimed = await redis.set(
      `mfa_enrollment_used:${decoded.jti}`,
      "1",
      { nx: true, ex: 600 },
    )
    if (enrollmentClaimed !== "OK") {
      return res
        .status(401)
        .json(errorResponse("MFA enrollment has already been used", 401))
    }

    // Create session and issue tokens
    const refreshToken = generateRefreshToken({ sub: user.id })
    const session = await prisma.$transaction(async (tx) => {
      await tx.staffMfa.create({
        data: {
          userId: user.id,
          totpSecretCiphertext: pendingSecretCiphertext,
          recoveryCodeHashes,
          lastUsedTotpStep: matchedStep,
        },
      })
      return tx.session.create({
        data: {
          userId: user.id,
          refreshTokenHash: hashToken(refreshToken),
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      })
    })

    await redis.del(`totp_pending:${user.id}`)
    await redis.del(`totp_backup_pending:${user.id}`)

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    })

    const isProduction = process.env.NODE_ENV === "production"
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: REFRESH_TOKEN_MS,
      path: "/",
    })

    return res.status(200).json(
      successResponse("2FA successfully enabled and authenticated", {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avaterUrl: user.avaterUrl,
          phone: user.phone,
        },
      }),
    )
  } catch (error) {
    console.error("Enable pending TOTP error:", error)
    return res.status(500).json(errorResponse("Failed to complete 2FA setup", 500))
  }
}
