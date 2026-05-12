import crypto from "crypto"
import axios from "axios"

const TELEBIRR_CONFIG = {
  appId: process.env.TELEBIRR_APP_ID,
  appKey: process.env.TELEBIRR_APP_KEY,
  publicKey: process.env.TELEBIRR_PUBLIC_KEY,
  shortCode: process.env.TELEBIRR_SHORT_CODE,
  baseUrl:
    process.env.TELEBIRR_BASE_URL || "https://196.188.120.3:38443/payment/v1",
  notifyUrl: `${process.env.BASE_URL}/api/payment/telebirr/callback`,
  returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
}

// ✅ Sign the payload
export const signPayload = (params) => {
  const sorted = Object.keys(params)
    .sort()
    .filter((k) => params[k] !== undefined && params[k] !== "")
    .map((k) => `${k}=${params[k]}`)
    .join("&")

  return crypto
    .createHash("sha256")
    .update(sorted + TELEBIRR_CONFIG.appKey)
    .digest("hex")
    .toUpperCase()
}

// ✅ Encrypt with Telebirr public key
export const encryptWithPublicKey = (data) => {
  const publicKey = `-----BEGIN PUBLIC KEY-----\n${TELEBIRR_CONFIG.publicKey}\n-----END PUBLIC KEY-----`
  const encrypted = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(JSON.stringify(data)),
  )
  return encrypted.toString("base64")
}

export const createTelebirrPayment = async (payment, user) => {
  try {
    const timestamp = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString("hex")

    const ussdParams = {
      appId: TELEBIRR_CONFIG.appId,
      shortCode: TELEBIRR_CONFIG.shortCode,
      timeStamp: timestamp,
      nonce,
      subject: "HabeshaGo Payment",
      totalAmount: payment.amount.toString(),
      transNo: payment.reference,
      notifyUrl: TELEBIRR_CONFIG.notifyUrl,
      returnUrl: `${TELEBIRR_CONFIG.returnUrl}?ref=${payment.reference}`,
      receiveName: "HabeshaGo",
    }

    const sign = signPayload(ussdParams)
    const encryptedData = encryptWithPublicKey(ussdParams)

    const response = await axios.post(
      `${TELEBIRR_CONFIG.baseUrl}/create`,
      {
        appid: TELEBIRR_CONFIG.appId,
        sign,
        ussd: encryptedData,
      },
      {
        headers: { "Content-Type": "application/json" },
        httpsAgent: new (await import("https")).Agent({
          rejectUnauthorized: false,
        }),
      },
    )

    if (response.data.code !== "0") {
      throw new Error(`Telebirr error: ${response.data.message}`)
    }

    return {
      paymentUrl: response.data.data.toPayUrl,
      rawResponse: response.data,
    }
  } catch (error) {
    console.error("Telebirr payment error:", error)
    throw error
  }
}
