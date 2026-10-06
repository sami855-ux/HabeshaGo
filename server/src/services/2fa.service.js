import crypto from "node:crypto"
import speakeasy from "speakeasy"
import QRCode from "qrcode"

// Human-friendly vocabulary. Twelve independently selected words provides
// about 59 bits of entropy with this 30-word list; the random numeric suffix
// adds another ~20 bits. Recovery phrases are also rate-limited and one-time.
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
    const words = Array.from(
      { length: 12 },
      () => PHRASE_WORDS[crypto.randomInt(0, PHRASE_WORDS.length)],
    )
    const num = crypto.randomInt(100000, 1000000)
    phrases.push(`${words.join("-")}-${num}`)
  }
  return phrases
}

export const normalizeRecoveryPhrase = (value) =>
  value.toString().toLowerCase().trim().replace(/\s+/g, "-")

export const hashRecoveryPhrase = (phrase) =>
  crypto.createHash("sha256").update(normalizeRecoveryPhrase(phrase)).digest("hex")

export const hashRecoveryPhrases = (phrases) =>
  phrases.map(hashRecoveryPhrase)

/**
 * Validate and consume a single-use recovery phrase
 */
export const verifyRecoveryPhrase = (inputPhrase, savedHashes = []) => {
  if (
    !inputPhrase ||
    typeof inputPhrase !== "string" ||
    !Array.isArray(savedHashes)
  ) {
    return { valid: false, remaining: savedHashes }
  }

  const inputBuf = Buffer.from(hashRecoveryPhrase(inputPhrase), "hex")

  let matchedIndex = -1
  for (let i = 0; i < savedHashes.length; i++) {
    const candidateBuf = Buffer.from(savedHashes[i], "hex")

    if (
      inputBuf.length === candidateBuf.length &&
      crypto.timingSafeEqual(inputBuf, candidateBuf)
    ) {
      matchedIndex = i
      break
    }
  }

  if (matchedIndex !== -1) {
    const remaining = [...savedHashes]
    remaining.splice(matchedIndex, 1)
    return { valid: true, remaining }
  }

  return { valid: false, remaining: savedHashes }
}

const getEncryptionKey = () => {
  const configured = process.env.MFA_ENCRYPTION_KEY
  if (configured) {
    try {
      const key = /^[a-f0-9]{64}$/i.test(configured)
        ? Buffer.from(configured, "hex")
        : Buffer.from(configured, "base64")
      if (key.length === 32) return key
    } catch (e) {}
  }

  // Safe deterministic 32-byte key fallback derived from JWT_SECRET or SESSION_SECRET
  const seed =
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET ||
    "habeshago-staff-mfa-encryption-fallback"
  return crypto.createHash("sha256").update(`mfa-key:${seed}`).digest()
}

export const encryptTOTPSecret = (secret) => {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`
}

export const decryptTOTPSecret = (encrypted) => {
  const [version, ivValue, tagValue, ciphertextValue] = encrypted.split(".")
  if (version !== "v1" || !ivValue || !tagValue || !ciphertextValue) {
    throw new Error("Invalid encrypted TOTP secret")
  }
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url"),
  )
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"))
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8")
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
  return verifyTOTPWithStep(token, secret) !== null
}

export const verifyTOTPWithStep = (token, secret, time = Date.now()) => {
  if (!token || !secret) return null

  const normalizedToken = token.toString().replace(/\s+/g, "")
  if (!/^\d{6}$/.test(normalizedToken)) return null

  const result = speakeasy.totp.verifyDelta({
    secret,
    encoding: "base32",
    token: normalizedToken,
    window: 1, // allow +/- 30 seconds clock drift
    time: Math.floor(time / 1000),
  })
  if (!result) return null
  return getTOTPTimeStep(time) + result.delta
}

export const getTOTPTimeStep = (time = Date.now()) => Math.floor(time / 1000 / 30)
