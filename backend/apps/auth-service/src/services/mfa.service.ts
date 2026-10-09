import { prisma } from "../prisma";
import {
  generateBase32Secret,
  generateRecoveryCodes,
  hashRecoveryCode,
  encryptTOTPSecret,
  decryptTOTPSecret,
  verifyTOTPWithStep,
} from "../utils/crypto";
import { AuthError } from "./token.service";

export interface MfaSetupResponse {
  secret: string;
  otpauthUri: string;
  recoveryCodes: string[];
}

export interface VerifyMfaChallengeOptions {
  userId: string;
  code: string;
  isRecoveryCode?: boolean;
  ipAddress?: string;
}

/**
 * Begin MFA setup: generates Base32 secret and recovery codes
 */
export async function setupUserMfa(userId: string, email: string): Promise<MfaSetupResponse> {
  const secret = generateBase32Secret(20);
  const recoveryCodes = generateRecoveryCodes(8);
  const recoveryCodeHashes = recoveryCodes.map(hashRecoveryCode);
  const totpSecretCiphertext = encryptTOTPSecret(secret);

  await prisma.userMfa.upsert({
    where: { userId },
    create: {
      userId,
      totpSecretCiphertext,
      recoveryCodeHashes,
      enabledAt: null, // Pending confirmation
    },
    update: {
      totpSecretCiphertext,
      recoveryCodeHashes,
      enabledAt: null,
      lastUsedTotpStep: null,
    },
  });

  const otpauthUri = `otpauth://totp/HabeshaGo:${encodeURIComponent(email)}?secret=${secret}&issuer=HabeshaGo`;

  return {
    secret,
    otpauthUri,
    recoveryCodes,
  };
}

/**
 * Confirm and enable MFA by verifying the first TOTP code
 */
export async function enableUserMfa(userId: string, code: string, ipAddress?: string) {
  const mfa = await prisma.userMfa.findUnique({ where: { userId } });
  if (!mfa) {
    throw new AuthError("MFA_NOT_INITIALIZED", "MFA setup has not been initiated", 400);
  }

  const secret = decryptTOTPSecret(mfa.totpSecretCiphertext);
  const step = verifyTOTPWithStep(code, secret);

  if (step === null) {
    throw new AuthError("INVALID_TOTP", "Invalid authenticator code", 400);
  }

  await prisma.userMfa.update({
    where: { userId },
    data: {
      enabledAt: new Date(),
      lastUsedTotpStep: step,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "MFA_ENABLED",
      targetUserId: userId,
      reason: "User successfully enrolled and enabled TOTP MFA",
      ipAddress,
    },
  });

  return {
    success: true,
    message: "Multi-Factor Authentication enabled successfully",
  };
}

/**
 * Verify MFA Challenge during Login (TOTP code or recovery code)
 */
export async function verifyMfaChallenge({
  userId,
  code,
  isRecoveryCode = false,
  ipAddress,
}: VerifyMfaChallengeOptions) {
  const mfa = await prisma.userMfa.findUnique({
    where: { userId },
    include: {
      user: {
        include: { roleGrants: true },
      },
    },
  });

  if (!mfa || !mfa.enabledAt) {
    throw new AuthError("MFA_NOT_ENABLED", "MFA is not enabled for this user", 400);
  }

  if (mfa.user.status !== "ACTIVE") {
    throw new AuthError("ACCOUNT_UNAVAILABLE", "User account is suspended or inactive", 403);
  }

  if (isRecoveryCode) {
    const hashed = hashRecoveryCode(code);
    const index = mfa.recoveryCodeHashes.indexOf(hashed);

    if (index === -1) {
      throw new AuthError("INVALID_RECOVERY_CODE", "Invalid or already used recovery code", 400);
    }

    // Remove the consumed recovery code
    const updatedHashes = [...mfa.recoveryCodeHashes];
    updatedHashes.splice(index, 1);

    await prisma.userMfa.update({
      where: { userId },
      data: { recoveryCodeHashes: updatedHashes },
    });

    await prisma.auditLog.create({
      data: {
        action: "RECOVERY_CODE_USED",
        targetUserId: userId,
        reason: "User authenticated using a single-use backup recovery code",
        ipAddress,
      },
    });

    return {
      user: mfa.user,
      recoveryCodeUsed: true,
      remainingRecoveryCodes: updatedHashes.length,
    };
  }

  // Verify TOTP code
  const secret = decryptTOTPSecret(mfa.totpSecretCiphertext);
  const step = verifyTOTPWithStep(code, secret);

  if (step === null) {
    throw new AuthError("INVALID_TOTP", "Invalid authenticator code", 400);
  }

  // Replay prevention: do not allow using the same 30-second time step twice
  if (mfa.lastUsedTotpStep !== null && step <= mfa.lastUsedTotpStep) {
    throw new AuthError(
      "TOTP_REPLAY_DETECTED",
      "Authenticator code has already been used. Please wait for the next 30-second code.",
      400
    );
  }

  await prisma.userMfa.update({
    where: { userId },
    data: { lastUsedTotpStep: step },
  });

  return {
    user: mfa.user,
    recoveryCodeUsed: false,
  };
}

/**
 * Disable MFA
 */
export async function disableUserMfa(userId: string, code: string, ipAddress?: string) {
  const mfa = await prisma.userMfa.findUnique({ where: { userId } });
  if (!mfa || !mfa.enabledAt) {
    throw new AuthError("MFA_NOT_ENABLED", "MFA is not enabled", 400);
  }

  const secret = decryptTOTPSecret(mfa.totpSecretCiphertext);
  const step = verifyTOTPWithStep(code, secret);

  if (step === null) {
    // Check if recovery code matches
    const hashed = hashRecoveryCode(code);
    if (!mfa.recoveryCodeHashes.includes(hashed)) {
      throw new AuthError("INVALID_CODE", "Invalid authenticator or recovery code", 400);
    }
  }

  await prisma.userMfa.delete({ where: { userId } });

  await prisma.auditLog.create({
    data: {
      action: "MFA_DISABLED",
      targetUserId: userId,
      reason: "User disabled Multi-Factor Authentication",
      ipAddress,
    },
  });

  return {
    success: true,
    message: "Multi-Factor Authentication disabled successfully",
  };
}
