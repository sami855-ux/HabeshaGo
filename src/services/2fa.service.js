import speakeasy from "speakeasy"
import QRCode from "qrcode"

export const generate2FASecret = async (email) => {
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `HabeshaGo (${email})`,
  })

  const qrCode = await QRCode.toDataURL(secret.otpauth_url)

  return {
    base32: secret.base32,
    qrCode,
  }
}

export const verifyTOTP = (token, secret) => {
  if (!token || !secret) return false

  const normalizedToken = token.replace(/\s+/g, "")

  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: normalizedToken,
    window: 1,
  })
}
