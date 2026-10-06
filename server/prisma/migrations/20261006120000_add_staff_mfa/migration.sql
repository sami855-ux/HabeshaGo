-- Store staff MFA credentials durably. Secrets are encrypted by the application
-- and recovery phrases are stored only as SHA-256 hashes.
CREATE TABLE "staff_mfa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totpSecretCiphertext" TEXT NOT NULL,
    "recoveryCodeHashes" TEXT[] NOT NULL,
    "lastUsedTotpStep" INTEGER,
    "enabledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_mfa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "staff_mfa_userId_key" ON "staff_mfa"("userId");

ALTER TABLE "staff_mfa"
ADD CONSTRAINT "staff_mfa_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
