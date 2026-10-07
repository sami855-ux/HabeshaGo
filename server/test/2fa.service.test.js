import test from "node:test"
import assert from "node:assert/strict"
import crypto from "node:crypto"
import speakeasy from "speakeasy"

process.env.MFA_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64")
process.env.JWT_SECRET = crypto.randomBytes(64).toString("base64url")
process.env.JWT_REFRESH_SECRET = crypto.randomBytes(64).toString("base64url")
process.env.SESSION_SECRET = crypto.randomBytes(32).toString("base64url")

const {
  decryptTOTPSecret,
  encryptTOTPSecret,
  generate2FASecret,
  generateRecoveryPhrases,
  hashRecoveryPhrases,
  verifyRecoveryPhrase,
  verifyTOTPWithStep,
} = await import("../src/services/2fa.service.js")
const {
  generateAccessToken,
  generateMFAEnrollmentToken,
  generateMFAToken,
  generateRefreshToken,
  validateAuthSecrets,
  verifyAccessToken,
  verifyMFAEnrollmentToken,
  verifyRefreshToken,
} = await import("../src/services/token.service.js")

test("encrypts TOTP secrets with authenticated encryption", () => {
  const secret = "JBSWY3DPEHPK3PXP"
  const encrypted = encryptTOTPSecret(secret)
  assert.notEqual(encrypted, secret)
  assert.equal(decryptTOTPSecret(encrypted), secret)
  assert.throws(() => decryptTOTPSecret(`${encrypted}tampered`))
})

test("generates random recovery phrases and stores verifiable hashes", () => {
  const phrases = generateRecoveryPhrases(8)
  assert.equal(phrases.length, 8)
  assert.equal(new Set(phrases).size, 8)

  const hashes = hashRecoveryPhrases(phrases)
  assert.equal(hashes.some((hash) => phrases.includes(hash)), false)
  const result = verifyRecoveryPhrase(phrases[0], hashes)
  assert.equal(result.valid, true)
  assert.equal(result.remaining.length, 7)
  assert.equal(verifyRecoveryPhrase(phrases[0], result.remaining).valid, false)
})

test("verifies a Google Authenticator-compatible TOTP and returns its time step", async () => {
  const { base32 } = await generate2FASecret("staff@example.com")
  const token = speakeasy.totp({ secret: base32, encoding: "base32" })
  assert.equal(typeof verifyTOTPWithStep(token, base32), "number")
  assert.equal(verifyTOTPWithStep("0000000", base32), null)
})

test("never accepts an MFA-pending JWT as an access token", () => {
  const pending = generateMFAToken({ sub: "staff-1", role: "ADMIN" })
  assert.throws(() => verifyAccessToken(pending))

  const access = generateAccessToken({
    id: "staff-1",
    role: "ADMIN",
    sessionId: "session-1",
  })
  assert.equal(verifyAccessToken(access).type, "access")
  assert.equal(verifyAccessToken(access).sub, "staff-1")
  assert.equal(typeof verifyAccessToken(access).jti, "string")
})

test("creates unique, strictly typed refresh tokens", () => {
  const first = generateRefreshToken({ sub: "staff-1" })
  const second = generateRefreshToken({ sub: "staff-1" })
  assert.notEqual(first, second)
  assert.equal(verifyRefreshToken(first).type, "refresh")
  assert.equal(verifyRefreshToken(first).sub, "staff-1")
  assert.throws(() => verifyAccessToken(first))
})

test("keeps enrollment tokens outside the access-token boundary", () => {
  const enrollment = generateMFAEnrollmentToken({
    sub: "staff-1",
    role: "ADMIN",
  })
  assert.equal(verifyMFAEnrollmentToken(enrollment).type, "mfa_enrollment")
  assert.throws(() => verifyAccessToken(enrollment))
})

test("requires strong, distinct authentication secrets", () => {
  assert.doesNotThrow(() => validateAuthSecrets())
  const original = process.env.JWT_REFRESH_SECRET
  process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET
  assert.throws(() => validateAuthSecrets(), /distinct/)
  process.env.JWT_REFRESH_SECRET = original
})
