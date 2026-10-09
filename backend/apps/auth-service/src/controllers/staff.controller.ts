import type { Request, Response } from "express";
import { env } from "../config/env";
import {
  requestStaffLoginOtp,
  verifyLoginOtp,
  STAFF_ROLES,
} from "../services/otp.service";
import {
  AuthError,
  generateMfaChallengeToken,
} from "../services/token.service";
import { setupUserMfa } from "../services/mfa.service";
import { sendError } from "./base.controller";

/**
 * Staff Login - Step 1: Request OTP
 * Checks staff role, validates account status, and dispatches OTP
 * POST /api/v1/auth/staff/login
 */
export async function staffLogin(req: Request, res: Response) {
  try {
    const { email } = req.body || {};
    const result = await requestStaffLoginOtp(email, req.ip);

    return res.status(200).json({
      success: true,
      message: "Staff OTP sent to email",
      email: result.user.email,
      expiresIn: result.expiresInSeconds,
      ...(env.NODE_ENV !== "production" ? { devOtp: result.rawOtp } : {}),
      data: {
        email: result.user.email,
        expiresIn: result.expiresInSeconds,
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Staff Login - Step 2: Verify OTP
 * - If MFA is NOT yet enabled: starts it up immediately and returns setup QR/secret
 * - If MFA IS already enabled: returns challenge token to type authenticator numbers
 * POST /api/v1/auth/staff/verify-otp
 */
export async function staffVerifyOtp(req: Request, res: Response) {
  try {
    const { email, code } = req.body || {};
    const { user, roles, mfaRequired } = await verifyLoginOtp(email, code, req.ip);

    // Verify staff role
    const isStaff = roles.some((r) => STAFF_ROLES.includes(r));
    if (!isStaff) {
      throw new AuthError("STAFF_ACCESS_DENIED", "Access restricted to authorized staff members", 403);
    }

    // If MFA is not yet enabled, automatically start it up!
    if (!mfaRequired) {
      const setupData = await setupUserMfa(user.id, user.email);
      const mfaToken = generateMfaChallengeToken(user, roles, "staff_mfa_setup");

      return res.status(200).json({
        success: true,
        mfaRequired: true,
        mfaSetupRequired: true,
        mfaToken,
        mfaMethod: "SETUP_TOTP",
        secret: setupData.secret,
        otpauthUri: setupData.otpauthUri,
        recoveryCodes: setupData.recoveryCodes,
        expiresIn: 300,
        message: "Email OTP verified. MFA is required for staff accounts. Please scan the QR code and enter the 6-digit authenticator code.",
        data: {
          mfaRequired: true,
          mfaSetupRequired: true,
          mfaToken,
          mfaMethod: "SETUP_TOTP",
          secret: setupData.secret,
          otpauthUri: setupData.otpauthUri,
          recoveryCodes: setupData.recoveryCodes,
          expiresIn: 300,
        },
      });
    }

    // MFA is already configured: prompt staff to type the 6-digit authenticator numbers
    const mfaToken = generateMfaChallengeToken(user, roles, "mfa_challenge");
    return res.status(200).json({
      success: true,
      mfaRequired: true,
      mfaSetupRequired: false,
      mfaToken,
      mfaMethod: "TOTP",
      expiresIn: 300,
      message: "Email OTP verified. Please enter the 6-digit code from your authenticator app.",
      data: {
        mfaRequired: true,
        mfaSetupRequired: false,
        mfaToken,
        mfaMethod: "TOTP",
        expiresIn: 300,
      },
    });
  } catch (err) {
    return sendError(res, err);
  }
}
