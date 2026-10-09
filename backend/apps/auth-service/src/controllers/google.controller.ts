import type { Request, Response } from "express";
import { env } from "../config/env";
import {
  AuthError,
  generateMfaChallengeToken,
  issueAuthSession,
  resolvePrimaryRole,
  getRoleRedirectUrl,
} from "../services/token.service";
import {
  getGoogleAuthUrl,
  exchangeGoogleAuthCode,
  verifyGoogleToken,
  authenticateWithGoogleProfile,
  storeOAuthExchangeCode,
  consumeOAuthExchangeCode,
  type GoogleProfile,
} from "../services/google.service";
import { sendError } from "./base.controller";

/**
 * Initiate Google OAuth Redirect
 * GET /api/v1/auth/google
 */
export async function googleAuthRedirect(req: Request, res: Response) {
  try {
    const { state, redirect_uri, prompt } = req.query as Record<string, string | undefined>;
    const url = getGoogleAuthUrl({
      state,
      redirectUri: redirect_uri,
      prompt,
    });
    return res.redirect(url);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Get Google OAuth URL as JSON
 * GET /api/v1/auth/google/url
 */
export async function getGoogleAuthUrlHandler(req: Request, res: Response) {
  try {
    const { state, redirect_uri, prompt } = req.query as Record<string, string | undefined>;
    const url = getGoogleAuthUrl({
      state,
      redirectUri: redirect_uri,
      prompt,
    });
    return res.status(200).json({ success: true, url, data: { url } });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Handle Google OAuth Callback (Web redirect flow)
 * GET /api/v1/auth/google/callback
 */
export async function googleAuthCallback(req: Request, res: Response) {
  const frontendBase = env.FRONTEND_URL.replace(/\/$/, "");
  try {
    const { code, error, error_description } = req.query as Record<string, string | undefined>;

    if (error) {
      const msg = error_description || error;
      return res.redirect(`${frontendBase}/login?error=${encodeURIComponent(msg)}`);
    }

    if (!code) {
      return res.redirect(`${frontendBase}/login?error=missing_code`);
    }

    const profile = await exchangeGoogleAuthCode(code);
    const { user, roles, mfaRequired } = await authenticateWithGoogleProfile(profile, req.ip);

    if (mfaRequired) {
      const mfaToken = generateMfaChallengeToken(user, roles);
      return res.redirect(`${frontendBase}/login?mfa=true&mfaToken=${encodeURIComponent(mfaToken)}`);
    }

    const sessionResult = await issueAuthSession({
      user,
      roles,
      req,
      res,
      mfaVerified: false,
    });

    const exchangeCode = storeOAuthExchangeCode(sessionResult.accessToken);
    const primaryRole = resolvePrimaryRole(roles);
    const redirectPath = getRoleRedirectUrl(primaryRole);

    return res.redirect(`${frontendBase}${redirectPath}?code=${encodeURIComponent(exchangeCode)}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google authentication failed";
    return res.redirect(`${frontendBase}/login?error=${encodeURIComponent(message)}`);
  }
}

/**
 * Sign in / Register with Google Token (Mobile app or Web One-Tap)
 * POST /api/v1/auth/google
 * POST /api/v1/auth/mobile/google
 */
export async function googleTokenAuth(req: Request, res: Response) {
  try {
    const { token, idToken, credential, code, redirectUri } = req.body || {};

    let profile: GoogleProfile;
    if (code) {
      profile = await exchangeGoogleAuthCode(code, redirectUri);
    } else if (idToken || token || credential) {
      profile = await verifyGoogleToken(idToken || token || credential);
    } else {
      throw new AuthError(
        "TOKEN_REQUIRED",
        "Google token, credential, or authorization code is required",
        400
      );
    }

    const { user, roles, mfaRequired } = await authenticateWithGoogleProfile(profile, req.ip);

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
 * Exchange one-time OAuth code for Access Token
 * GET /api/v1/auth/exchange
 * POST /api/v1/auth/exchange
 */
export async function exchangeOAuthCode(req: Request, res: Response) {
  try {
    const code = (req.query?.code || req.body?.code) as string | undefined;
    if (!code) {
      throw new AuthError("CODE_REQUIRED", "Exchange code is required", 400);
    }

    const accessToken = consumeOAuthExchangeCode(code);
    return res.status(200).json({
      success: true,
      accessToken,
      data: { accessToken },
    });
  } catch (err) {
    return sendError(res, err);
  }
}
