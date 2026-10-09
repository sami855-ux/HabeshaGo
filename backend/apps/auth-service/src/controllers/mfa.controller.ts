import type { Request, Response } from "express";
import { prisma } from "../prisma";
import {
  AuthError,
  generateAccessToken,
  verifyMfaChallengeToken,
  issueAuthSession,
  extractActiveRoles,
} from "../services/token.service";
import {
  setupUserMfa,
  enableUserMfa,
  verifyMfaChallenge,
  disableUserMfa,
  regenerateRecoveryCodes,
  resetUserMfaByAdmin,
  getUserMfaStatus,
} from "../services/mfa.service";
import { sendError } from "./base.controller";

/**
 * Extract MFA token from either JSON body or Bearer Authorization header
 */
export function extractMfaToken(req: Request): string {
  const token = req.body?.mfaToken || req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || typeof token !== "string") {
    throw new AuthError("MFA_TOKEN_REQUIRED", "MFA challenge/enrollment token is required", 400);
  }
  return token.trim();
}

/**
 * Submit TOTP code at login, receive tokens
 * POST /api/v1/auth/mfa/verify
 */
export async function mfaVerify(req: Request, res: Response) {
  try {
    const mfaToken = extractMfaToken(req);
    const { code } = req.body || {};

    if (!code) {
      throw new AuthError("CODE_REQUIRED", "Authenticator code is required", 400);
    }

    const payload = verifyMfaChallengeToken(mfaToken, "mfa_challenge");
    const { user } = await verifyMfaChallenge({
      userId: payload.sub,
      code: String(code),
      isRecoveryCode: false,
      ipAddress: req.ip,
    });

    const responsePayload = await issueAuthSession({
      user,
      roles: payload.roles,
      req,
      res,
      mfaVerified: true,
    });

    return res.status(200).json(responsePayload);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Log in with a single-use recovery code
 * POST /api/v1/auth/mfa/recovery
 */
export async function mfaRecovery(req: Request, res: Response) {
  try {
    const mfaToken = extractMfaToken(req);
    const recoveryCode = req.body?.recoveryCode || req.body?.code;

    if (!recoveryCode) {
      throw new AuthError("RECOVERY_CODE_REQUIRED", "Recovery code is required", 400);
    }

    const payload = verifyMfaChallengeToken(mfaToken, "mfa_challenge");
    const result = await verifyMfaChallenge({
      userId: payload.sub,
      code: String(recoveryCode),
      isRecoveryCode: true,
      ipAddress: req.ip,
    });

    const responsePayload = await issueAuthSession({
      user: result.user,
      roles: payload.roles,
      req,
      res,
      mfaVerified: true,
    });

    return res.status(200).json({
      ...responsePayload,
      recoveryCodeUsed: true,
      remainingRecoveryCodes: result.remainingRecoveryCodes,
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Staff first-time setup, returns secret and QR link
 * POST /api/v1/auth/mfa/enroll/setup
 */
export async function mfaEnrollSetup(req: Request, res: Response) {
  try {
    const mfaToken = extractMfaToken(req);
    const payload = verifyMfaChallengeToken(mfaToken, "mfa_enrollment");

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new AuthError("USER_NOT_FOUND", "User not found", 404);
    }

    const setupData = await setupUserMfa(user.id, user.email);
    return res.status(200).json({
      success: true,
      message: "Scan the QR code or enter the secret in your authenticator app",
      secret: setupData.secret,
      otpauthUri: setupData.otpauthUri,
      qrCodeUrl: setupData.qrCodeUrl,
      data: {
        secret: setupData.secret,
        otpauthUri: setupData.otpauthUri,
        qrCodeUrl: setupData.qrCodeUrl,
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Confirm first-time code, return recovery codes and tokens
 * POST /api/v1/auth/mfa/enroll/verify
 */
export async function mfaEnrollVerify(req: Request, res: Response) {
  try {
    const mfaToken = extractMfaToken(req);
    const { code } = req.body || {};

    if (!code) {
      throw new AuthError("CODE_REQUIRED", "Authenticator code is required to complete enrollment", 400);
    }

    const payload = verifyMfaChallengeToken(mfaToken, "mfa_enrollment");
    const enableResult = await enableUserMfa(payload.sub, String(code), req.ip);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roleGrants: true },
    });
    if (!user) {
      throw new AuthError("USER_NOT_FOUND", "User not found", 404);
    }

    const roles = extractActiveRoles(user.roleGrants);
    const responsePayload = await issueAuthSession({
      user,
      roles,
      req,
      res,
      mfaVerified: true,
    });

    return res.status(200).json({
      ...responsePayload,
      recoveryCodes: enableResult.recoveryCodes,
      message: "MFA enrollment confirmed successfully. Save your recovery codes safely.",
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Check MFA status for current authenticated user
 * GET /api/v1/auth/mfa/status
 */
export async function mfaStatus(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AuthError("UNAUTHORIZED", "Authentication required", 401);
    }

    const status = await getUserMfaStatus(userId);
    return res.status(200).json({
      success: true,
      ...status,
      data: status,
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Voluntary MFA setup for regular users
 * POST /api/v1/auth/mfa/setup
 */
export async function setupMfa(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AuthError("UNAUTHORIZED", "Authentication required", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AuthError("USER_NOT_FOUND", "User not found", 404);
    }

    const result = await setupUserMfa(user.id, user.email);
    return res.status(200).json({
      success: true,
      message: "Scan the QR code or enter the secret into your authenticator app",
      secret: result.secret,
      otpauthUri: result.otpauthUri,
      qrCodeUrl: result.qrCodeUrl,
      data: {
        secret: result.secret,
        otpauthUri: result.otpauthUri,
        qrCodeUrl: result.qrCodeUrl,
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Confirm and enable MFA for regular users, returning recovery codes once
 * POST /api/v1/auth/mfa/verify-setup
 */
export async function mfaVerifySetup(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { code } = req.body || {};

    if (!userId) {
      throw new AuthError("UNAUTHORIZED", "Authentication required", 401);
    }
    if (!code) {
      throw new AuthError("CODE_REQUIRED", "Authenticator code is required to enable MFA", 400);
    }

    const result = await enableUserMfa(userId, String(code), req.ip);
    return res.status(200).json({
      success: true,
      message: result.message,
      recoveryCodes: result.recoveryCodes,
      data: {
        recoveryCodes: result.recoveryCodes,
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Fresh MFA code for sensitive actions, returns a new access token
 * POST /api/v1/auth/mfa/step-up
 */
export async function mfaStepUp(req: Request, res: Response) {
  try {
    const userClaims = (req as any).user;
    const userId = userClaims?.id;
    const { code } = req.body || {};

    if (!userId) {
      throw new AuthError("UNAUTHORIZED", "Authentication required", 401);
    }
    if (!code) {
      throw new AuthError("CODE_REQUIRED", "Fresh authenticator code is required for step-up verification", 400);
    }

    // Verify TOTP code against active MFA
    await verifyMfaChallenge({
      userId,
      code: String(code),
      isRecoveryCode: false,
      ipAddress: req.ip,
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roleGrants: true },
    });
    if (!user) {
      throw new AuthError("USER_NOT_FOUND", "User not found", 404);
    }

    const roles = extractActiveRoles(user.roleGrants);
    const newAccessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      roles,
      sid: userClaims.sid || userClaims.sessionId || "",
      mfa: true,
    });

    return res.status(200).json({
      success: true,
      message: "Step-up authentication successful",
      accessToken: newAccessToken,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Turn MFA off, requires a current code
 * POST /api/v1/auth/mfa/disable
 */
export async function disableMfa(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { code } = req.body || {};

    if (!userId) {
      throw new AuthError("UNAUTHORIZED", "Authentication required", 401);
    }
    if (!code) {
      throw new AuthError("CODE_REQUIRED", "Verification code is required to disable MFA", 400);
    }

    const result = await disableUserMfa(userId, String(code), req.ip);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Generate new recovery codes, requires a current code
 * POST /api/v1/auth/mfa/recovery-codes/regenerate
 */
export async function mfaRegenerateRecoveryCodes(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { code } = req.body || {};

    if (!userId) {
      throw new AuthError("UNAUTHORIZED", "Authentication required", 401);
    }
    if (!code) {
      throw new AuthError("CODE_REQUIRED", "Current authenticator code is required to regenerate recovery codes", 400);
    }

    const result = await regenerateRecoveryCodes(userId, String(code), req.ip);
    return res.status(200).json({
      success: true,
      message: result.message,
      recoveryCodes: result.recoveryCodes,
      data: {
        recoveryCodes: result.recoveryCodes,
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Admin reset user MFA (e.g. staff member who lost device)
 * POST /api/v1/auth/admin/users/:userId/mfa/reset
 */
export async function adminResetMfa(req: Request, res: Response) {
  try {
    const adminUser = (req as any).user;
    const roles: string[] = adminUser?.roles || [];
    const isAdmin = roles.some((r) => r.toUpperCase() === "ADMIN");

    if (!adminUser?.id || !isAdmin) {
      throw new AuthError("FORBIDDEN", "Admin permissions required to reset user MFA", 403);
    }

    const { userId } = req.params;
    if (!userId) {
      throw new AuthError("USER_ID_REQUIRED", "User ID is required", 400);
    }

    const { reason } = req.body || {};
    const result = await resetUserMfaByAdmin(userId, adminUser.id, reason, req.ip);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        userId,
        reset: true,
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
}
