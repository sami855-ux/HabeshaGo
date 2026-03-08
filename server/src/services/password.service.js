import crypto from "node:crypto"

export const hashPassword = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export const verifyPassword = (token, hash) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

  return tokenHash === hash
}
