import type { Request, Response } from "express";
import { env } from "../config/env";
import { requestLoginOtp, verifyLoginOtp } from "../services/otp.service";
import {
  generateMfaChallengeToken,
  issueAuthSession,
} from "../services/token.service";
import { sendError } from "./base.controller";

/**
 * Unified Register / Login (Continue with Email) endpoint
 * Serves as the single entry point for both registration and login screens.
 * Automatically provisions new users or identifies existing users and dispatches OTP.
 *
 * POST /api/v1/auth/continue-with-email
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
 * POST /api/v1/auth/verify-otp
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
