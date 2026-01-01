import prisma from "../prisma/client.js"
import { sendOTP } from "../services/otp.service.js"
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  issueMobileTokens,
  issueTokens,
} from "../services/token.service.js"
import { hashPassword, verifyPassword } from "../services/password.service.js"
import { verifyTOTP, generate2FASecret } from "../services/2fa.service.js"

export const register = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required", success: false })
    }

    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({ data: { email } })
    }

    await sendOTP(user)

    res.json({ message: "OTP sent to email", success: true })
  } catch (error) {
    res.status(429).json({ message: error.message })
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email and code are required", success: false })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false })
    }

    const otp = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!otp) {
      return res
        .status(400)
        .json({ message: "OTP expired or not found", success: false })
    }

    if (otp.attempts >= otp.maxAttempts) {
      return res.status(429).json({
        message: "Too many incorrect attempts. OTP locked.",
        success: false,
      })
    }

    // Always increment attempts
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    })

    if (code !== otp.code) {
      return res.status(400).json({ message: "Invalid OTP", success: false })
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    })

    // Verify email
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })

    // Issue tokens and send to client
    return issueTokens(user, req, res)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "OTP verification failed", success: false })
  }
}
export const verifyOTPApp = async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email and code are required", success: false })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false })
    }

    const otp = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!otp) {
      return res
        .status(400)
        .json({ message: "OTP expired or not found", success: false })
    }

    if (otp.attempts >= otp.maxAttempts) {
      return res.status(429).json({
        message: "Too many incorrect attempts. OTP locked.",
        success: false,
      })
    }

    // Always increment attempts
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    })

    if (code !== otp.code) {
      return res.status(400).json({ message: "Invalid OTP", success: false })
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    })

    // Verify email
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })

    // Issue tokens and send to client
    return issueMobileTokens(user, req, res)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "OTP verification failed", success: false })
  }
}

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    await sendOTP(user)

    res.json({ message: "OTP resent successfully" })
  } catch (error) {
    res.status(429).json({ message: error.message })
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
            txns: true,
            payments: true,
          },
        },
        bookings: true,
        minibusReservations: true,
        parkingReservations: true,
        sessions: true,
        accounts: true,
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

export const socialLogin = async (req, res) => {
  const { email, provider, providerId } = req.body

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({ data: { email } })
  }

  // Optional: store provider info in Account
  await prisma.account.upsert({
    where: { provider_providerId: { provider, providerId } },
    update: { userId: user.id },
    create: { provider, providerId, userId: user.id },
  })

  const refreshToken = generateRefreshToken()
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  const accessToken = generateAccessToken({
    sub: user.id,
    role: user.role,
    sessionId: session.id,
  })

  res.json({ accessToken, refreshToken })
}

export const googleCallback = async (req, res) => {
  try {
    const user = req.user

    return issueTokens(user, req, res)
  } catch (err) {
    console.error("Google login failed:", err)
    return res.status(500).json({ message: "Google login failed" })
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
      user: {
        id: session.user.id,
        role: session.user.role,
        email: session.user.email,
      },
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
    const { sessionId } = req.user

    // Revoke the session in DB
    await prisma.session.update({
      where: { id: sessionId },
      data: { revoked: true },
    })

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
  const { id } = req.user
  const { base32, qrCode } = await generate2FASecret(req.user.email)

  await prisma.user.update({
    where: { id },
    data: { twoFactorSecret: base32, twoFactorEnabled: false },
  })

  res.json({ qrCode, secret: base32 })
}

export const confirm2FA = async (req, res) => {
  const { code } = req.body
  const { id } = req.user
  const user = await prisma.user.findUnique({ where: { id } })

  if (!verifyTOTP(code, user.twoFactorSecret))
    return res.status(401).json({ message: "Invalid 2FA code" })

  await prisma.user.update({ where: { id }, data: { twoFactorEnabled: true } })

  res.json({ message: "2FA enabled successfully" })
}

export const disable2FA = async (req, res) => {
  const { id } = req.user
  await prisma.user.update({
    where: { id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  })
  res.json({ message: "2FA disabled successfully" })
}

export const verify2FA = async (req, res) => {
  const { userId, code } = req.body
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user || !user.twoFactorEnabled)
    return res.status(400).json({ message: "Invalid request" })
  if (!verifyTOTP(code, user.twoFactorSecret))
    return res.status(401).json({ message: "Invalid 2FA code" })

  const refreshToken = generateRefreshToken()
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  const accessToken = generateAccessToken({
    sub: user.id,
    role: user.role,
    sessionId: session.id,
  })

  res.json({ accessToken, refreshToken })
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

export const getSessions = async (req, res) => {
  const sessions = await prisma.session.findMany({
    where: { userId: req.user.id },
  })
  res.json(sessions)
}

export const revokeSession = async (req, res) => {
  const { sessionId } = req.params
  await prisma.session.update({
    where: { id: sessionId },
    data: { revoked: true },
  })
  res.json({ message: "Session revoked" })
}
