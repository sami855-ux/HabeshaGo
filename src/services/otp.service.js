import prisma from "../prisma/client.js"
import { generateOTP } from "../utils/otp.js"
import { transporter } from "../config/mail.js"

const OTP_EXPIRY_MINUTES = 5

export const sendOTP = async (user) => {
  // Invalidate all previous unused OTPs
  await prisma.otpCode.updateMany({
    where: {
      userId: user.id,
      used: false,
    },
    data: {
      used: true,
    },
  })

  // Generate new OTP
  const code = generateOTP() // e.g. "123456"

  // Save OTP to DB
  await prisma.otpCode.create({
    data: {
      userId: user.id,
      code,
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  })

  // Send email
  await transporter.sendMail({
    from: `"Addis Pulse" <no-reply@addispulse.com>`,
    to: user.email,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #00796B; text-align: center;">Addis Pulse</h2>
        <p>Hi ${user.name || "there"},</p>
        <p>Your verification code is:</p>
        <h1 style="text-align: center; color: #FFB300; letter-spacing: 4px; font-size: 2em;">${code}</h1>
        <p style="text-align: center;">
          This code will expire in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 0.9em; color: #555;">
          If you didn't request this OTP, you can safely ignore this email.
        </p>
        <p style="text-align: center; font-size: 0.8em; color: #999;">
          &copy; 2025 Addis Pulse. All rights reserved.
        </p>
      </div>
    `,
  })
}
