import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { env } from "../config/env";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Generate a cryptographically secure numeric OTP code (default 6 digits)
 */
export function generateOtpCode(digits = 6): string {
  const min = 10 ** (digits - 1);
  const max = 10 ** digits;
  return crypto.randomInt(min, max).toString();
}

/**
 * Hash an OTP code using bcrypt
 */
export async function hashOtpCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

/**
 * Verify an OTP code against its bcrypt hash
 */
export async function verifyOtpCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

/**
 * Hash a token (refresh token, recovery phrase, etc.) using SHA-256
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a cryptographically secure random opaque token
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

// -------------------------------------------------------------
// Base32 & TOTP (RFC 6238 / RFC 4226)
// -------------------------------------------------------------

export function generateBase32Secret(byteLength = 20): string {
  const buffer = crypto.randomBytes(byteLength);
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function base32Decode(str: string): Buffer {
  const cleaned = str.toUpperCase().replace(/=+$/, "").replace(/[\s-]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) {
      throw new Error(`Invalid base32 character encountered: ${cleaned[i]}`);
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate standard RFC 6238 6-digit TOTP code for a secret and timestamp
 */
export function generateTOTP(secret: string, time = Date.now()): string {
  const key = base32Decode(secret);
  const counter = Math.floor(time / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, "0");
}

/**
 * Verify a 6-digit TOTP token against a Base32 secret.
 * Returns the matching time step (integer) for replay prevention, or null if invalid.
 */
export function verifyTOTPWithStep(
  token: string,
  secret: string,
  time = Date.now(),
  window = 1
): number | null {
  if (!token || !secret) return null;
  const normalized = token.toString().replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalized)) return null;

  const currentStep = Math.floor(time / 1000 / 30);

  for (let delta = -window; delta <= window; delta++) {
    const stepTime = (currentStep + delta) * 30 * 1000;
    try {
      if (generateTOTP(secret, stepTime) === normalized) {
        return currentStep + delta;
      }
    } catch {
      return null;
    }
  }

  return null;
}

// -------------------------------------------------------------
// AES-256-GCM Encryption for TOTP Secret Storage
// -------------------------------------------------------------

function getMfaKey(customKey?: string): Buffer {
  const raw = customKey || env.MFA_ENCRYPTION_KEY;
  if (/^[a-f0-9]{64}$/i.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length === 32) return buf;
  // Fallback derive 32-byte key
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptTOTPSecret(secret: string, keyString?: string): string {
  const key = getMfaKey(keyString);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptTOTPSecret(encrypted: string, keyString?: string): string {
  const [version, ivVal, tagVal, cipherVal] = encrypted.split(".");
  if (version !== "v1" || !ivVal || !tagVal || !cipherVal) {
    throw new Error("Invalid encrypted TOTP secret format");
  }

  const key = getMfaKey(keyString);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivVal, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagVal, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(cipherVal, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

// -------------------------------------------------------------
// Recovery Codes
// -------------------------------------------------------------

const RECOVERY_WORDS = [
  "alpha", "bravo", "cedar", "delta", "ember", "falcon",
  "galaxy", "harbor", "island", "jungle", "karma", "lagoon",
  "meteor", "nebula", "orbit", "prism", "quartz", "river",
  "safari", "timber", "ultra", "velvet", "winter", "zenith",
  "summit", "canyon", "aurora", "beacon", "horizon", "shield",
];

export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const word1 = RECOVERY_WORDS[crypto.randomInt(0, RECOVERY_WORDS.length)];
    const word2 = RECOVERY_WORDS[crypto.randomInt(0, RECOVERY_WORDS.length)];
    const num = crypto.randomInt(100000, 999999);
    codes.push(`${word1}-${word2}-${num}`);
  }
  return codes;
}

export function normalizeRecoveryCode(val: string): string {
  return val.toLowerCase().trim().replace(/\s+/g, "-");
}

export function hashRecoveryCode(code: string): string {
  return crypto.createHash("sha256").update(normalizeRecoveryCode(code)).digest("hex");
}
