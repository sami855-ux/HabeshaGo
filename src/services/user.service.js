import prisma from "../prisma/client.js"
import { uploadToCloudinary } from "./cloudinary.service.js"
import { sendOTP } from "./otp.service.js"
import { verifyPassword } from "./password.service.js"

export const updateProfileService = async (userId, data, avatarFile) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  if (!user) throw new Error("User not found")

  let avatarUrl = user.avaterUrl

  if (avatarFile) {
    avatarUrl = await uploadToCloudinary(avatarFile.buffer, "negari/avatars")
  }

  // 🚫 Protect sensitive fields
  delete data.role
  delete data.isSuspended
  delete data.emailVerified
  delete data.phoneVerified
  delete data.googleId
  delete data.appleId

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      avaterUrl: avatarUrl,
    },
  })
}

export const sendOtpService = async (user, type) => {
  // reuse your existing OTP sender
  await sendOTP(user, type)
}

export const verifyOtpService = async (user, code, channel) => {
  console.log(user, code)
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      used: false,
    },
    orderBy: { createdAt: "desc" },
  })

  if (!otp) throw new Error("OTP not found")

  if (otp.expiresAt < new Date()) {
    throw new Error("OTP has expired")
  }

  if (otp.attempts >= otp.maxAttempts) {
    throw new Error("Too many attempts")
  }

  const isValid = await verifyPassword(code, otp.codeHash)

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: {
      attempts: { increment: 1 },
      used: isValid,
    },
  })

  if (!isValid) {
    throw new Error("Invalid OTP")
  }

  // mark verification on user
  if (channel === "email") {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })
  }

  if (channel === "phone") {
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true },
    })
  }

  return true
}

export const getUsersByPhoneService = async (phone) => {
  const users = await prisma.user.findMany({
    where: phone
      ? {
          phone: {
            contains: phone, // allows partial search
            mode: "insensitive",
          },
        }
      : {},
    select: {
      id: true,
      name: true,
      phone: true,
      phoneVerified: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Format response exactly as requested
  return users.map((user) => ({
    id: user.id,
    name: user.name ?? "Unknown",
    phone: user.phone,
    isVerified: user.phoneVerified,
  }))
}
