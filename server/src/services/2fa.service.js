import crypto from "node:crypto"
import speakeasy from "speakeasy"
import QRCode from "qrcode"

// Words dictionary for human-friendly recovery phrases
const PHRASE_WORDS = [
  "alpha", "bravo", "cedar", "delta", "ember", "falcon",
  "galaxy", "harbor", "island", "jungle", "karma", "lagoon",
  "meteor", "nebula", "orbit", "prism", "quartz", "river",
  "safari", "timber", "ultra", "velvet", "winter", "zenith",
  "summit", "canyon", "aurora", "beacon", "horizon", "shield",
]

/**
 * Generate N human-readable recovery phrases
 * e.g. "falcon-ember-482"
 */
export const generateRecoveryPhrases = (count = 8) => {
  const phrases = []
  for (let i = 0; i < count; i++) {
    const w1 = PHRASE_WORDS[crypto.randomInt(0, PHRASE_WORDS.length)]
    const w2 = PHRASE_WORDS[crypto.randomInt(0, PHRASE_WORDS.length)]
    const num = crypto.randomInt(100, 999)
    phrases.push(`${w1}-${w2}-${num}`)
  }
  return phrases
}

/**
 * Validate and consume a single-use recovery phrase
 */
export const verifyRecoveryPhrase = (inputPhrase, savedPhrases = []) => {
  if (
    !inputPhrase ||
    typeof inputPhrase !== "string" ||
    !Array.isArray(savedPhrases)
  ) {
    return { valid: false, remaining: savedPhrases }
  }

  const normalizedInput = inputPhrase.toLowerCase().trim()
  const inputBuf = Buffer.from(normalizedInput)

  let matchedIndex = -1
  for (let i = 0; i < savedPhrases.length; i++) {
    const candidate = savedPhrases[i].toString().toLowerCase().trim()
    const candidateBuf = Buffer.from(candidate)

    if (
      inputBuf.length === candidateBuf.length &&
      crypto.timingSafeEqual(inputBuf, candidateBuf)
    ) {
      matchedIndex = i
      break
    }
  }

  if (matchedIndex !== -1) {
    const remaining = [...savedPhrases]
    remaining.splice(matchedIndex, 1)
    return { valid: true, remaining }
  }

  return { valid: false, remaining: savedPhrases }
}

/**
 * Generate TOTP base32 secret and QR Code for Google Authenticator
 */
export const generate2FASecret = async (email) => {
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `HabeshaGo (${email})`,
    issuer: "HabeshaGo",
  })

  const qrCode = await QRCode.toDataURL(secret.otpauth_url, {
    margin: 2,
    width: 280,
    errorCorrectionLevel: "M",
  })

  return {
    base32: secret.base32,
    otpauth_url: secret.otpauth_url,
    qrCode,
  }
}

/**
 * Verify a 6-digit TOTP token against the base32 secret
 */
export const verifyTOTP = (token, secret) => {
  if (!token || !secret) return false

  const normalizedToken = token.toString().replace(/\s+/g, "")

  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: normalizedToken,
    window: 1, // allow +/- 30 seconds clock drift
  })
}

