import crypto from "node:crypto"
import prisma from "../prisma/client.js"
import { sendOTP } from "../services/otp.service.js"
import {
  generateAccessToken,
  generateMFAToken,
  generateRefreshToken,
  hashToken,
  issueMobileTokens,
  issueTokens,
  issueTokensSocial,
  verifyMFAToken,
  verifyRefreshToken,
  DUMMY_BCRYPT_HASH,
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
  generate2FASecret,
  generateRecoveryPhrases,
  verifyRecoveryPhrase,
} from "../services/2fa.service.js"
import { STAFF_ROLES } from "../utils/constants.js"

import dotenv from "dotenv"
import { errorResponse, successResponse } from "../utils/apiResponse.js"
import admin from "../config/firebaseAdmin.js"
import { generateReferralCode } from "../utils/qrcode.js"
import axios from "axios"
import { redis } from "../config/redis.js"
dotenv.config()

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
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      })
      return res.status(400).json({ message: "Invalid OTP", success: false })
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    })
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
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      })
      return res.status(400).json({ message: "Invalid OTP", success: false })
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    })
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
        bookings: true,
        minibusReservations: true,
        parkingReservations: true,
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
    const incomingToken = req.cookies?.refreshToken

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
        await prisma.session.updateMany({
          where: { userId: decoded.sub },
          data: { revoked: true },
        })
        try {
          await redis.set(
            `user_revoked_all:${decoded.sub}`,
            Date.now().toString(),
            { ex: 86400 },
          )
        } catch (e) {}
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

    if (session.user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" })
    }

    const user = session.user

    // Rotate refresh token
    const newRefreshToken = generateRefreshToken({ sub: user.id })
    const newHashedToken = hashToken(newRefreshToken)

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newHashedToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(),
      },
    })

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
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
    verifyRefreshToken(refreshToken)

    // Hash incoming token to match DB (deterministic SHA-256)
    const hashedToken = hashToken(refreshToken)

    // Find valid session
    const session = await prisma.session.findFirst({
      where: {
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
        await prisma.session.updateMany({
          where: { userId: revokedSession.userId },
          data: { revoked: true },
        })
        try {
          await redis.set(
            `user_revoked_all:${revokedSession.userId}`,
            Date.now().toString(),
            { ex: 86400 },
          )
        } catch (e) {}
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

    if (session.user.isSuspended) {
      return res.status(403).json(errorResponse("Account suspended", 403))
    }

    // Rotate refresh token
    const newRefreshToken = generateRefreshToken({ sub: session.user.id })
    const newHashedToken = hashToken(newRefreshToken)

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newHashedToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(),
      },
    })

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

    // 3. Also revoke by incoming cookie refresh token hash if present
    const incomingToken = req.cookies?.refreshToken
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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

    // Check if staff has TOTP 2FA enabled
    let hasTotp = false
    try {
      const totpSecret = await redis.get(`totp:${user.id}`)
      if (totpSecret) hasTotp = true
    } catch (e) {
      // Redis fallback
    }

    // Send MFA OTP code to staff email
    const rawOtp = await sendOTP(user, "login")

    // Generate short-lived MFA token (5 minutes)
    const mfaToken = generateMFAToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return res.status(200).json(
      successResponse("Credentials verified. Please complete MFA verification.", {
        mfaRequired: true,
        mfaToken,
        mfaMethod: hasTotp ? "TOTP_OR_EMAIL" : "EMAIL_OTP",
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

    // 1. MFA Replay Attack Prevention (single-use jti check)
    if (decoded.jti) {
      try {
        const isReplayed = await redis.get(`mfa_used:${decoded.jti}`)
        if (isReplayed) {
          return res
            .status(401)
            .json(
              errorResponse(
                "MFA session has already been used. Please log in again.",
                401,
              ),
            )
        }
      } catch (e) {}
    }

    // 2. MFA Brute-Force Rate Limiting (max 5 attempts per user per session)
    const mfaFailsKey = `mfa_fails:${decoded.sub}`
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
    } catch (e) {}

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

    // 1. Try TOTP Authenticator verification if user configured it
    try {
      const totpSecret = await redis.get(`totp:${user.id}`)
      if (totpSecret && verifyTOTP(cleanCode, totpSecret)) {
        isValidMFA = true
      }
    } catch (e) {
      // Continue
    }

    // 2. Try single-use recovery phrase verification if user saved phrases
    if (!isValidMFA) {
      try {
        const backupPhrasesJson = await redis.get(`totp_backup:${user.id}`)
        if (backupPhrasesJson) {
          const savedPhrases =
            typeof backupPhrasesJson === "string"
              ? JSON.parse(backupPhrasesJson)
              : backupPhrasesJson
          const { valid, remaining } = verifyRecoveryPhrase(
            cleanCode,
            savedPhrases,
          )
          if (valid) {
            isValidMFA = true
            // Save remaining single-use recovery phrases (burning the used phrase)
            await redis.set(
              `totp_backup:${user.id}`,
              JSON.stringify(remaining),
            )
          }
        }
      } catch (e) {
        // Continue to email OTP
      }
    }

    // 3. If not verified via TOTP or Recovery Phrase, verify via Email OTP code
    if (!isValidMFA) {
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

      if (otpRecord.codeHash) {
        isValidMFA = await verifyPassword(cleanCode, otpRecord.codeHash)
      }

      if (!isValidMFA) {
        await prisma.otpCode.update({
          where: { id: otpRecord.id },
          data: { attempts: { increment: 1 } },
        })
        try {
          await redis.incr(mfaFailsKey)
          await redis.expire(mfaFailsKey, 300)
        } catch (e) {}
        return res.status(400).json(errorResponse("Invalid MFA code", 400))
      }

      // Mark OTP as used
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
      })
    }

    // Mark MFA token as consumed (prevents replay) and clear failed attempts
    if (decoded.jti) {
      try {
        await redis.set(`mfa_used:${decoded.jti}`, "1", { ex: 300 })
        await redis.del(mfaFailsKey)
      } catch (e) {}
    }

    // 3. Issue full session and tokens
    const refreshToken = generateRefreshToken({ sub: user.id })
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashToken(refreshToken),
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

    const isProduction = process.env.NODE_ENV === "production"
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    })

    return res.status(200).json(
      successResponse("Staff authentication successful", {
        accessToken,
        refreshToken,
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
    const { base32, qrCode, otpauth_url } = await generate2FASecret(
      user.email || user.id,
    )
    const recoveryPhrases = generateRecoveryPhrases(8)

    // Store pending setup in Redis (15 mins)
    await redis.set(`totp_pending:${user.id}`, base32, { ex: 900 })
    await redis.set(
      `totp_backup_pending:${user.id}`,
      JSON.stringify(recoveryPhrases),
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

    const pendingSecret = await redis.get(`totp_pending:${userId}`)
    const pendingBackupJson = await redis.get(`totp_backup_pending:${userId}`)

    if (!pendingSecret) {
      return res
        .status(400)
        .json(
          errorResponse(
            "No pending 2FA setup found or it has expired. Please run setup again.",
            400,
          ),
        )
    }

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

    // Persist permanently in Redis
    await redis.set(`totp:${userId}`, pendingSecret)
    if (pendingBackupJson) {
      await redis.set(`totp_backup:${userId}`, pendingBackupJson)
    }

    // Clean up temporary keys
    await redis.del(`totp_pending:${userId}`)
    await redis.del(`totp_backup_pending:${userId}`)

    let savedPhrases = []
    try {
      savedPhrases = JSON.parse(pendingBackupJson)
    } catch (e) {}

    return res.status(200).json(
      successResponse("Google Authenticator MFA enabled successfully!", {
        enabled: true,
        savedRecoveryPhrases: savedPhrases,
        notice:
          "Save your recovery phrases in a safe place. You will need them if you lose access to your authenticator app.",
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
  try {
    const user = req.user
    const { base32, qrCode } = await generate2FASecret(user.email || user.id)
    const recoveryPhrases = generateRecoveryPhrases(8)

    await redis.set(`totp_pending:${user.id}`, base32, { ex: 900 })
    await redis.set(
      `totp_backup_pending:${user.id}`,
      JSON.stringify(recoveryPhrases),
      { ex: 900 },
    )

    const phrasesHtml = recoveryPhrases
      .map(
        (p, i) =>
          `<div style="padding:10px 14px;background:#f8fafc;border-radius:8px;font-family:monospace;font-size:14px;color:#0f172a;border:1px solid #cbd5e1;box-shadow:0 1px 2px rgba(0,0,0,0.05);">${i + 1}. <strong>${p}</strong></div>`,
      )
      .join("")

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HabeshaGo - Setup Google Authenticator</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1329; color: #f8fafc; padding: 40px 20px; display: flex; justify-content: center; }
    .card { background: #1e293b; border-radius: 20px; padding: 36px; max-width: 540px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; border: 1px solid #334155; }
    h2 { color: #14b8a6; margin-top: 0; font-size: 24px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
    .qr-box { background: white; padding: 18px; border-radius: 16px; display: inline-block; margin: 18px 0; box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
    .secret-box { background: #0f172a; padding: 12px; border-radius: 10px; font-family: monospace; font-size: 16px; letter-spacing: 2px; color: #38bdf8; margin: 12px 0; border: 1px solid #1e293b; user-select: all; }
    .phrases { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; margin: 18px 0; }
    .warning { background: #451a03; border-left: 4px solid #f59e0b; padding: 14px; text-align: left; font-size: 13px; color: #fde68a; border-radius: 8px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🔐 HabeshaGo Staff 2FA Setup</h2>
    <p>Scan this QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>1Password</strong>.</p>
    <div class="qr-box">
      <img src="${qrCode}" alt="Scan QR Code" style="display:block; width:240px; height:240px;" />
    </div>
    <div style="font-size:12px; color:#94a3b8;">Can't scan? Enter this manual setup key:</div>
    <div class="secret-box">${base32}</div>
    <h3 style="color:#f8fafc; font-size:16px; margin-top:28px; text-align:left;">📝 Recovery Phrases (Save These Offline!):</h3>
    <div class="phrases">
      ${phrasesHtml}
    </div>
    <div class="warning">
      ⚠️ <strong>Important:</strong> Save these 8 recovery phrases now. If you ever lose your phone or authenticator app, you can enter any of these phrases during login to regain access.
    </div>
  </div>
</body>
</html>`

    res.setHeader("Content-Type", "text/html")
    return res.send(html)
  } catch (error) {
    console.error("View QR page error:", error)
    return res.status(500).send("Failed to render QR setup page")
  }
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

    const hashedPassword = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

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

