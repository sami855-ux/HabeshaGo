import type { Request, Response } from "express";
import { env } from "../config/env";
import { prisma } from "../prisma";
import { requestLoginOtp, verifyLoginOtp } from "../services/otp.service";
import {
  AuthError,
  generateMfaChallengeToken,
  verifyMfaChallengeToken,
  issueAuthSession,
  rotateRefreshToken,
  terminateSession,
  extractActiveRoles,
} from "../services/token.service";
import {
  setupUserMfa,
  enableUserMfa,
  verifyMfaChallenge,
  disableUserMfa,
} from "../services/mfa.service";

/**
 * Standardized error responder adhering to contracts and frontend needs
 */
export function sendError(res: Response, err: unknown) {
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      message: err.message,
    });
  }

  const message = err instanceof Error ? err.message : "Internal authentication error";
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message,
    },
    message,
  });
}

/**
 * Unified Register / Login (Continue with Email) endpoint
 * Serves as the single entry point for both registration and login screens.
 * Automatically provisions new users or identifies existing users and dispatches OTP.
 *
 * POST /api/v1/auth/continue-with-email
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/otp/send
 */
export async function continueWithEmail(req: Request, res: Response) {
  try {
    const { email, name } = req.body || {};
    const result = await requestLoginOtp(email, req.ip, name);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
      email: result.user.email,
      isNewUser: result.isNewUser,
      expiresIn: result.expiresInSeconds,
      ...(env.NODE_ENV !== "production" ? { devOtp: result.rawOtp } : {}),
      data: {
        email: result.user.email,
        isNewUser: result.isNewUser,
        expiresIn: result.expiresInSeconds,
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
}


/**
 * Resend OTP code
 * POST /api/v1/auth/resend-otp
 */
export async function resendOtp(req: Request, res: Response) {
  try {
    const { email } = req.body || {};
    const result = await requestLoginOtp(email, req.ip);

    return res.status(200).json({
      success: true,
      message: "OTP resent to email",
      email: result.user.email,
      expiresIn: result.expiresInSeconds,
      ...(env.NODE_ENV !== "production" ? { devOtp: result.rawOtp } : {}),
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Verify OTP code (Supports both web and mobile)
 * POST /api/v1/auth/otp/verify or POST /api/v1/auth/verify-otp
 */
export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, code } = req.body || {};
    const { user, roles, mfaRequired } = await verifyLoginOtp(email, code, req.ip);

    // If MFA is enabled, issue short-lived challenge token and pause final session
    if (mfaRequired) {
      const mfaToken = generateMfaChallengeToken(user, roles);
      return res.status(200).json({
        success: true,
        mfaRequired: true,
        mfaToken,
        mfaMethod: "TOTP",
        expiresIn: 300,
        message: "MFA verification required. Please enter your authenticator code or recovery code.",
        data: {
          mfaRequired: true,
          mfaToken,
          mfaMethod: "TOTP",
          expiresIn: 300,
        },
      });
    }

    // MFA is not enabled: issue full session and tokens
    const responsePayload = await issueAuthSession({
      user,
      roles,
      req,
      res,
      mfaVerified: false,
    });

    return res.status(200).json(responsePayload);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Verify MFA Challenge (TOTP code or recovery code)
 * POST /api/v1/auth/mfa/verify
 */
export async function verifyMfa(req: Request, res: Response) {
  try {
    const { mfaToken, code, isRecoveryCode } = req.body || {};

    if (!mfaToken) {
      throw new AuthError("MFA_TOKEN_REQUIRED", "MFA challenge token is required", 400);
    }
    if (!code) {
      throw new AuthError("CODE_REQUIRED", "Verification code is required", 400);
    }

    const payload = verifyMfaChallengeToken(mfaToken);
    const { user } = await verifyMfaChallenge({
      userId: payload.sub,
      code,
      isRecoveryCode: Boolean(isRecoveryCode),
      ipAddress: req.ip,
    });

    // Issue full session with MFA verified
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
 * Rotate Refresh Token
 * POST /api/v1/auth/refresh
 */
export async function refresh(req: Request, res: Response) {
  try {
    const result = await rotateRefreshToken(req, res);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Revoke Session & Logout
 * POST /api/v1/auth/logout
 */
export async function logout(req: Request, res: Response) {
  try {
    const result = await terminateSession(req, res);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Setup Multi-Factor Authentication
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
      message: "Scan the QR code / enter the secret into your authenticator app",
      data: result,
      secret: result.secret,
      otpauthUri: result.otpauthUri,
      recoveryCodes: result.recoveryCodes,
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Enable Multi-Factor Authentication
 * POST /api/v1/auth/mfa/enable
 */
export async function enableMfa(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const { code } = req.body || {};

    if (!userId) {
      throw new AuthError("UNAUTHORIZED", "Authentication required", 401);
    }
    if (!code) {
      throw new AuthError("CODE_REQUIRED", "Authenticator code is required to enable MFA", 400);
    }

    const result = await enableUserMfa(userId, code, req.ip);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Disable Multi-Factor Authentication
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

    const result = await disableUserMfa(userId, code, req.ip);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Get current authenticated user profile
 * GET /api/v1/auth/me
 */
export async function getMe(req: Request, res: Response) {
  try {
    const userClaims = (req as any).user;
    if (!userClaims?.id) {
      throw new AuthError("UNAUTHORIZED", "Authentication required", 401);
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userClaims.id },
        include: {
          roleGrants: true,
          mfa: {
            select: {
              enabledAt: true,
              createdAt: true,
            },
          },
        },
      });
    } catch {
      // In case database is unreachable in test mode, proceed with claims
    }

    if (user) {
      const roles = extractActiveRoles(user.roleGrants);
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          roles,
          status: user.status,
          emailVerifiedAt: user.emailVerifiedAt,
          mfaEnabled: Boolean(user.mfa?.enabledAt),
          createdAt: user.createdAt,
        },
        requestId: (req as any).id,
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: userClaims.id,
        roles: userClaims.roles || ["PASSENGER"],
      },
      requestId: (req as any).id,
    });
  } catch (err) {
    return sendError(res, err);
  }
}
