import bcrypt from "bcrypt"
import crypto from "node:crypto"

const SALT_ROUNDS = 10

// For low-entropy secrets (OTP codes, PINs) — salted + slow
export const hashPassword = async (value) => {
  return bcrypt.hash(value, SALT_ROUNDS)
}

export const verifyPassword = async (value, hash) => {
  return bcrypt.compare(value, hash)
}

// For high-entropy tokens (refresh tokens) — deterministic for DB lookups
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex")
}
