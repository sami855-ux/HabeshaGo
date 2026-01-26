import prisma from "../prisma/client.js"
import { sendOTP } from "../services/otp.service.js"
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  issueMobileTokens,
  issueTokens,
  issueTokensSocial,
} from "../services/token.service.js"
import { hashPassword, verifyPassword } from "../services/password.service.js"
import { verifyTOTP, generate2FASecret } from "../services/2fa.service.js"

import dotenv from "dotenv"
import { errorResponse, successResponse } from "../utils/apiResponse.js"
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

    return issueTokens(user, req, res) // ✅ issue web tokens
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

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: {
          include: {
            payments: true,
          },
        },
        bookings: true,
        minibusReservations: true,
        parkingReservations: true,
        sessions: true,
        otpCodes: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false })
    }

    // Remove sensitive fields
    delete user.password
    delete user.twoFactorSecret

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

export const appleCallback = async (req, res) => {
  try {
    const user = req.user

    return issueTokens(user, req, res)
  } catch (err) {
    console.error("Apple login failed:", err)
    return res.status(500).json({ message: "Apple login failed" })
  }
}

export const refreshToken = async (req, res) => {
  try {
    const incomingToken = req.cookies?.refreshToken
    if (!incomingToken) {
      return res.status(401).json({ message: "No refresh token" })
    }

    const hashedToken = hashPassword(incomingToken)

    const session = await prisma.session.findFirst({
      where: {
        refreshTokenHash: hashedToken,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!session || session.user.isSuspended) {
      return res.status(403).json({ message: "Invalid session" })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        wallet: {
          include: {
            payments: true,
          },
        },
        bookings: true,
        minibusReservations: true,
        parkingReservations: true,
        sessions: true,
        otpCodes: true,
      },
    })

    console.log(user.email)

    // 🔁 Rotate refresh token
    const newRefreshToken = generateRefreshToken({ sub: session.user.id })
    const newHashedToken = await hashPassword(newRefreshToken)

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newHashedToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    // New access token
    const accessToken = generateAccessToken({
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    })

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    })

    return res.json({
      accessToken,
      user,
    })
  } catch (err) {
    console.error("Refresh token error:", err)
    res.status(500).json({ message: "Failed to refresh token" })
  }
}
export const refreshTokenApp = async (req, res) => {
  try {
    // 🔐 Get refresh token from request body (mobile-safe)
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" })
    }

    // Hash incoming token to match DB
    const hashedToken = await hashPassword(refreshToken)

    // Find valid session
    const session = await prisma.session.findFirst({
      where: {
        refreshTokenHash: hashedToken,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!session || session.user.isSuspended) {
      return res.status(403).json({ message: "Invalid or expired session" })
    }

    // 🔁 Rotate refresh token
    const newRefreshToken = generateRefreshToken({ sub: session.user.id })
    const newHashedToken = await hashPassword(newRefreshToken)

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newHashedToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    // Generate new access token
    const accessToken = generateAccessToken({
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    })

    // ✅ Return tokens (NO COOKIES)
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
    return res.status(500).json({ message: "Failed to refresh token" })
  }
}

export const logout = async (req, res) => {
  try {
    // const { sessionId } = req.user

    // // Revoke the session in DB
    // await prisma.session.update({
    //   where: { id: sessionId },
    //   data: { revoked: true },
    // })

    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    })

    return res.json({ message: "Logged out successfully", success: true })
  } catch (err) {
    console.error("Logout error:", err)
    return res.status(500).json({ message: "Failed to logout", success: false })
  }
}

export const logoutAll = async (req, res) => {
  await prisma.session.updateMany({
    where: { userId: req.user.id },
    data: { revoked: true },
  })
  res.json({ message: "All sessions revoked" })
}

export const enable2FA = async (req, res) => {
  const userId = req.user.id
  const email = req.user.email

  // 1. Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  // 2. Prevent re-enabling
  if (user.twoFactorEnabled) {
    return res.status(400).json({ message: "2FA is already enabled" })
  }

  // 3. Generate secret
  const { base32, qrCode } = await generate2FASecret(email)

  // 4. Store secret (NOT enabled yet)
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: base32,
      twoFactorEnabled: false,
    },
  })

  // 5. Return ONLY QR code
  res.json({
    message: "Scan the QR code using your authenticator app",
    qrCode,
  })
}
export const confirm2FA = async (req, res) => {
  try {
    const { code } = req.body
    const userId = req.user.id

    if (!code) {
      return res.status(400).json(errorResponse("2FA code is required", 400))
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json(errorResponse("User not found", 404))
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json(errorResponse("2FA is already enabled", 400))
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json(errorResponse("2FA setup not initiated", 400))
    }

    const isValid = verifyTOTP(code, user.twoFactorSecret)

    if (!isValid) {
      return res.status(401).json(errorResponse("Invalid 2FA code", 401))
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
      },
    })

    return res.status(200).json(successResponse("2FA enabled successfully"))
  } catch (error) {
    console.error("confirm2FA error:", error)
    return res.status(500).json(errorResponse("Failed to confirm 2FA", 500))
  }
}

export const disable2FA = async (req, res) => {
  try {
    const userId = req.user.id
    const { code } = req.body

    if (!code) {
      return res.status(400).json(errorResponse("2FA code is required", 400))
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json(errorResponse("User not found", 404))
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json(errorResponse("2FA is not enabled", 400))
    }

    const isValid = verifyTOTP(code, user.twoFactorSecret)

    if (!isValid) {
      return res.status(401).json(errorResponse("Invalid 2FA code", 401))
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    return res.status(200).json(successResponse("2FA disabled successfully"))
  } catch (error) {
    console.error("disable2FA error:", error)
    return res.status(500).json(errorResponse("Failed to disable 2FA", 500))
  }
}

export const verify2FA = async (req, res) => {
  try {
    const userId = req.user.id
    const { code } = req.body

    if (!code) {
      return res.status(400).json(errorResponse("2FA code is required", 400))
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json(errorResponse("User not found", 404))
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res
        .status(400)
        .json(errorResponse("2FA is not enabled for this account", 400))
    }

    const isValid = verifyTOTP(code, user.twoFactorSecret)

    if (!isValid) {
      return res.status(401).json(errorResponse("Invalid 2FA code", 401))
    }

    // Create refresh token & session
    const refreshToken = generateRefreshToken()

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        ),
      },
    })

    // Issue access token
    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
      sessionId: session.id,
    })

    return res.status(200).json(
      successResponse("2FA verification successful", {
        accessToken,
        refreshToken,
      }),
    )
  } catch (error) {
    console.error("verify2FA error:", error)
    return res.status(500).json(errorResponse("Failed to verify 2FA", 500))
  }
}

export const suspendUser = async (req, res) => {
  const { userId, reason } = req.body
  await prisma.user.update({
    where: { id: userId },
    data: {
      isSuspended: true,
      suspendedAt: new Date(),
      suspensionReason: reason,
    },
  })
  await prisma.session.updateMany({
    where: { userId },
    data: { revoked: true },
  })
  res.json({ message: "User suspended successfully" })
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
