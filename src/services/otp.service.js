import prisma from "../prisma/client.js"
import { generateOTP } from "../utils/otp.js"
import { sendEmail } from "./email.service.js" // your Resend helper
import { hashPassword } from "./password.service.js"
import dotenv from "dotenv"
dotenv.config()

const OTP_EXPIRY_MINUTES = 5
const MAX_ATTEMPTS = 5

export const sendOTP = async (user) => {
  // 1️⃣ Invalidate previous unused OTPs
  await prisma.otpCode.updateMany({
    where: {
      userId: user.id,
      used: false,
    },
    data: {
      used: true,
    },
  })

  // 2️⃣ Generate new OTP
  const code = generateOTP() // e.g., "123456"
  const codeHash = await hashPassword(code)

  // 3️⃣ Save OTP to DB
  await prisma.otpCode.create({
    data: {
      userId: user.id,
      email: user.email,
      codeHash,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      used: false,
    },
  })

  // 4️⃣ Prepare email HTML
  const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: auto; padding: 40px 30px; border-radius: 16px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
  <div style="text-align: center; margin-bottom: 32px;">
    <h2 style="color: #00796B; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">HabeshaGo</h2>
    <div style="height: 4px; width: 60px; background: linear-gradient(90deg, #00796B, #4DB6AC); margin: 8px auto; border-radius: 2px;"></div>
  </div>
  
  <p style="color: #4A5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi ${
    user.name || "there"
  },</p>
  <p style="color: #4A5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Please use the following verification code to complete your request:</p>
  
  <div style="background: #FFFFFF; border-radius: 12px; padding: 32px 24px; margin: 32px 0; border: 1px solid #151516ff; text-align: center; box-shadow: 0 4px 12px rgba(0, 121, 107, 0.05);">
    <div style="color: #718096; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; text-transform: uppercase;">Verification Code</div>
    <div style="font-size: 40px; font-weight: 700; letter-spacing: 6px; color: #00796B; font-family: 'Courier New', monospace; padding: 12px; background: #f7fafc; border-radius: 8px; display: inline-block; min-width: 240px;">${code}</div>
  </div>
  
  <div style="background: #FFF7E6; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center; border-left: 4px solid #FFB300;">
    <p style="color: #805B36; font-size: 14px; margin: 0; font-weight: 500;">
      ⏰ This code expires in <strong style="color: #D69E2E;">${OTP_EXPIRY_MINUTES} minutes</strong>
    </p>
  </div>
  
  <div style="border-top: 1px solid #E2E8F0; margin: 32px 0 24px;"></div>
  
  <p style="color: #718096; font-size: 14px; line-height: 1.5; margin-bottom: 24px; text-align: center;">
    If you didn't request this verification code, please disregard this email. For security reasons, do not share this code with anyone.
  </p>
  
  <p style="text-align: center; font-size: 12px; color: #A0AEC0; margin-top: 32px; padding-top: 16px; border-top: 1px solid #EDF2F7;">
    &copy; ${new Date().getFullYear()} HabeshaGo. All rights reserved.
  </p>
</div>
`

  // 5️⃣ Send OTP via Resend
  const result = await sendEmail({
    to: user.email,
    subject: "Your OTP Code",
    html: htmlContent,
  })

  console.log("Resend OTP email result:", result.data)

  return code // optional: for dev logging
}
