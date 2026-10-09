import { prisma } from "../prisma";
import {
  generateBase32Secret,
  generateRecoveryCodes,
  hashRecoveryCode,
  encryptTOTPSecret,
  decryptTOTPSecret,
  verifyTOTPWithStep,
} from "../utils/crypto";
import { AuthError, extractActiveRoles } from "./token.service";
import { STAFF_ROLES } from "./otp.service";
import type { User } from "@prisma/client";

export interface MfaSetupResponse {
  secret: string;
  otpauthUri: string;
  qrCodeUrl: string;
  recoveryCodes: string[];
}

export interface VerifyMfaChallengeOptions {
  userId: string;
  code: string;
  isRecoveryCode?: boolean;
  ipAddress?: string;
}

export interface MfaStatusResponse {
  enabled: boolean;
  mfaEnabled: boolean;
  recoveryCodesLeft: number;
  required: boolean;
  mfaRequired: boolean;
  enabledAt: Date | null;
}

/**
 * Temporary in-memory cache for pending plaintext recovery codes during enrollment
 * (TTL 15 minutes)
 */
const pendingRecoveryCodesMap = new Map<string, { codes: string[]; expiresAt: number }>();

export function storePendingRecoveryCodes(userId: string, codes: string[], ttlMinutes = 15) {
  pendingRecoveryCodesMap.set(userId, {
    codes,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
  });

  setTimeout(() => {
    pendingRecoveryCodesMap.delete(userId);
  }, ttlMinutes * 60 * 1000).unref?.();
}

export function retrievePendingRecoveryCodes(userId: string): string[] {
  const entry = pendingRecoveryCodesMap.get(userId);
  pendingRecoveryCodesMap.delete(userId);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.codes;
  }

  // Fallback: generate and persist 8 fresh recovery codes if map was cleared (e.g. process restart)
  const freshCodes = generateRecoveryCodes(8);
  const hashes = freshCodes.map(hashRecoveryCode);
  prisma.userMfa
    .update({
      where: { userId },
      data: { recoveryCodeHashes: hashes },
    })
    .catch(() => undefined);

  return freshCodes;
}

/**
 * Begin MFA setup: generates Base32 secret, QR code link, and recovery codes
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

  storePendingRecoveryCodes(userId, recoveryCodes);

  const otpauthUri = `otpauth://totp/HabeshaGo:${encodeURIComponent(email)}?secret=${secret}&issuer=HabeshaGo`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUri)}`;

  return {
    secret,
    otpauthUri,
    qrCodeUrl,
    recoveryCodes,
  };
}

/**
 * Confirm and enable MFA by verifying the first TOTP code
 * Returns the plaintext recovery codes once so user can save them safely.
 */
export async function enableUserMfa(userId: string, code: string, ipAddress?: string) {
  if (!code || typeof code !== "string") {
    throw new AuthError("CODE_REQUIRED", "Authenticator code is required to enable MFA", 400);
  }

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
  }).catch(() => undefined);

  const recoveryCodes = retrievePendingRecoveryCodes(userId);

  return {
    success: true,
    message: "Multi-Factor Authentication enabled successfully",
    recoveryCodes,
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
  if (!code || typeof code !== "string") {
    throw new AuthError("CODE_REQUIRED", "Verification code is required", 400);
  }

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
    const hashed = hashRecoveryCode(code.trim());
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
    }).catch(() => undefined);

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
    remainingRecoveryCodes: mfa.recoveryCodeHashes.length,
  };
}

/**
 * Regenerate recovery codes (requires fresh TOTP code)
 */
export async function regenerateRecoveryCodes(userId: string, code: string, ipAddress?: string) {
  if (!code || typeof code !== "string") {
    throw new AuthError("CODE_REQUIRED", "Current authenticator code is required", 400);
  }

  const mfa = await prisma.userMfa.findUnique({ where: { userId } });
  if (!mfa || !mfa.enabledAt) {
    throw new AuthError("MFA_NOT_ENABLED", "MFA is not enabled for this user", 400);
  }

  const secret = decryptTOTPSecret(mfa.totpSecretCiphertext);
  const step = verifyTOTPWithStep(code, secret);
  if (step === null) {
    throw new AuthError("INVALID_TOTP", "Invalid authenticator code", 400);
  }

  const freshCodes = generateRecoveryCodes(8);
  const freshHashes = freshCodes.map(hashRecoveryCode);

  await prisma.userMfa.update({
    where: { userId },
    data: {
      recoveryCodeHashes: freshHashes,
      lastUsedTotpStep: step,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "MFA_RESET",
      targetUserId: userId,
      reason: "User regenerated backup recovery codes",
      ipAddress,
    },
  }).catch(() => undefined);

  return {
    success: true,
    message: "Recovery codes regenerated successfully. Store them safely.",
    recoveryCodes: freshCodes,
  };
}

/**
 * Disable MFA (requires valid TOTP or recovery code)
 */
export async function disableUserMfa(userId: string, code: string, ipAddress?: string) {
  if (!code || typeof code !== "string") {
    throw new AuthError("CODE_REQUIRED", "Current code is required to disable MFA", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roleGrants: true, mfa: true },
  });

  if (!user || !user.mfa || !user.mfa.enabledAt) {
    throw new AuthError("MFA_NOT_ENABLED", "MFA is not enabled", 400);
  }

  const roles = extractActiveRoles(user.roleGrants);
  const isStaff = roles.some((r) => STAFF_ROLES.includes(r));
  if (isStaff) {
    throw new AuthError(
      "MFA_MANDATORY",
      "Multi-Factor Authentication is mandatory for staff roles and cannot be disabled",
      403
    );
  }

  const secret = decryptTOTPSecret(user.mfa.totpSecretCiphertext);
  const step = verifyTOTPWithStep(code, secret);

  if (step === null) {
    // Check if recovery code matches
    const hashed = hashRecoveryCode(code.trim());
    if (!user.mfa.recoveryCodeHashes.includes(hashed)) {
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
  }).catch(() => undefined);

  return {
    success: true,
    message: "Multi-Factor Authentication disabled successfully",
  };
}

/**
 * Admin Reset MFA for staff member who lost their device
 */
export async function resetUserMfaByAdmin(
  targetUserId: string,
  adminId: string,
  reason?: string,
  ipAddress?: string
) {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { mfa: true },
  });

  if (!targetUser) {
    throw new AuthError("USER_NOT_FOUND", "Target user not found", 404);
  }

  // Delete user MFA record so they can enroll cleanly on next login
  await prisma.userMfa.deleteMany({ where: { userId: targetUserId } });

  // Revoke all active sessions for the user
  await prisma.session.updateMany({
    where: { userId: targetUserId, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: "ADMIN_MFA_RESET" },
  });

  // Log audit trail
  await prisma.auditLog.create({
    data: {
      action: "MFA_RESET",
      actorId: adminId,
      targetUserId,
      reason: reason || "Admin reset user MFA following lost device",
      ipAddress,
    },
  }).catch(() => undefined);

  return {
    success: true,
    message: "User MFA has been reset successfully. User will be required to re-enroll upon login.",
  };
}

/**
 * Get MFA status for user
 */
export async function getUserMfaStatus(userId: string): Promise<MfaStatusResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roleGrants: true, mfa: true },
  });

  if (!user) {
    throw new AuthError("USER_NOT_FOUND", "User not found", 404);
  }

  const enabled = Boolean(user.mfa && user.mfa.enabledAt);
  const recoveryCodesLeft = user.mfa?.recoveryCodeHashes?.length || 0;
  const roles = extractActiveRoles(user.roleGrants);
  const required = roles.some((r) => STAFF_ROLES.includes(r));

  return {
    enabled,
    mfaEnabled: enabled,
    recoveryCodesLeft,
    required,
    mfaRequired: required,
    enabledAt: user.mfa?.enabledAt || null,
  };
}
