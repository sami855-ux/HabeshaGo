import test from "node:test"
import assert from "node:assert/strict"
import crypto from "node:crypto"
import speakeasy from "speakeasy"

process.env.MFA_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64")
process.env.JWT_SECRET = "test-jwt-secret-that-is-long-enough-for-local-tests"

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
  generateMFAToken,
  verifyAccessToken,
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
})
