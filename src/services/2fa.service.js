import speakeasy from "speakeasy"
import QRCode from "qrcode"

export const generate2FASecret = async (email) => {
  const secret = speakeasy.generateSecret({
    name: `AddisPulse (${email})`,
  })

  const qrCode = await QRCode.toDataURL(secret.otpauth_url)

  return {
    base32: secret.base32,
    qrCode,
  }
}

export const verifyTOTP = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  })
}
