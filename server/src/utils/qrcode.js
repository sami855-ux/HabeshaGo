import QRCode from "qrcode"

export const generateQRCode = async (text = null) => {
  try {
    const qrText = text || crypto.randomUUID()

    const qrCodeBase64 = await QRCode.toDataURL(qrText, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.9,
      margin: 1,
    })

    return qrCodeBase64
  } catch (err) {
    console.error("QR code generation error:", err)
    throw new Error("Failed to generate QR code")
  }
}

export function generateReferralCode(name) {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${name.slice(0, 3).toUpperCase()}${random}`
}
