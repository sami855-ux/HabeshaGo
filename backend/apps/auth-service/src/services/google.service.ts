import { env } from "../config/env";
import { prisma } from "../prisma";
import { normalizeEmail } from "./otp.service";
import { AuthError, extractActiveRoles } from "./token.service";
import { generateSecureToken } from "../utils/crypto";
import type { User } from "@prisma/client";

export interface GoogleProfile {
  id: string; // Google sub ID
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

export interface GoogleAuthResult {
  user: User;
  roles: string[];
  mfaRequired: boolean;
  isNewUser: boolean;
}

/**
 * Generate Google OAuth 2.0 Authorization URL
 */
export function getGoogleAuthUrl(options?: {
  state?: string;
  redirectUri?: string;
  prompt?: string;
}): string {
  const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new AuthError("CONFIG_ERROR", "GOOGLE_CLIENT_ID is not configured", 500);
  }

  const redirectUri =
    options?.redirectUri ||
    env.GOOGLE_CALLBACK_URL ||
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:4001/api/v1/auth/google/callback";

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", options?.prompt || "select_account");

  if (options?.state) {
    url.searchParams.set("state", options.state);
  }

  return url.toString();
}

/**
 * Exchange authorization code for tokens and fetch Google user profile
 */
export async function exchangeGoogleAuthCode(
  code: string,
  redirectUri?: string
): Promise<GoogleProfile> {
  if (!code || typeof code !== "string") {
    throw new AuthError("CODE_REQUIRED", "Google authorization code is required", 400);
  }

  const clientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new AuthError("CONFIG_ERROR", "Google OAuth credentials are not configured", 500);
  }

  const callbackUrl =
    redirectUri ||
    env.GOOGLE_CALLBACK_URL ||
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:4001/api/v1/auth/google/callback";

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const errData = await tokenRes.json().catch(() => ({}));
    throw new AuthError(
      "GOOGLE_EXCHANGE_FAILED",
      (errData as any).error_description || "Failed to exchange authorization code with Google",
      400
    );
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string; id_token?: string };
  if (!tokenData.access_token) {
    throw new AuthError("GOOGLE_EXCHANGE_FAILED", "No access token received from Google", 400);
  }

  // Fetch user profile using access token
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!profileRes.ok) {
    throw new AuthError("GOOGLE_PROFILE_FAILED", "Failed to retrieve user profile from Google", 400);
  }

  const profileData = (await profileRes.json()) as any;
  return {
    id: profileData.sub,
    email: profileData.email,
    emailVerified: profileData.email_verified === true || profileData.email_verified === "true",
    name: profileData.name,
    picture: profileData.picture,
  };
}

/**
 * Verify Google ID token or Access token sent by mobile clients or Google One-Tap
 */
export async function verifyGoogleToken(token: string): Promise<GoogleProfile> {
  if (!token || typeof token !== "string") {
    throw new AuthError("TOKEN_REQUIRED", "Google token is required", 400);
  }

  const isJwt = token.split(".").length === 3;

  // 1. If JWT format, try tokeninfo endpoint (ID token verification)
  if (isJwt) {
    try {
      const res = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
      );
      if (res.ok) {
        const data = (await res.json()) as any;
        return {
          id: data.sub,
          email: data.email,
          emailVerified: data.email_verified === "true" || data.email_verified === true,
          name: data.name,
          picture: data.picture,
        };
      }
    } catch {
      // Fall through to userinfo attempt
    }
  }

  // 2. Try userinfo endpoint with bearer access token
  try {
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (userinfoRes.ok) {
      const data = (await userinfoRes.json()) as any;
      return {
        id: data.sub,
        email: data.email,
        emailVerified: data.email_verified === true || data.email_verified === "true",
        name: data.name,
        picture: data.picture,
      };
    }
  } catch {
    // Fall through
  }

  throw new AuthError("INVALID_GOOGLE_TOKEN", "Invalid or expired Google token", 401);
}

/**
 * Find or provision user from verified Google Profile, link OAuth account, and verify status
 */
export async function authenticateWithGoogleProfile(
  profile: GoogleProfile,
  ipAddress?: string
): Promise<GoogleAuthResult> {
  if (!profile.emailVerified) {
    throw new AuthError("GOOGLE_EMAIL_NOT_VERIFIED", "Google email address is not verified", 400);
  }

  const email = normalizeEmail(profile.email);
  let isNewUser = false;
  let user: (User & { roleGrants: any[]; mfa: any | null }) | null = null;

  // 1. Check if OAuth account is already linked
  const existingOAuth = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "GOOGLE",
        providerAccountId: profile.id,
      },
    },
    include: {
      user: {
        include: {
          roleGrants: true,
          mfa: true,
        },
      },
    },
  });

  if (existingOAuth?.user) {
    user = existingOAuth.user;
  } else {
    // 2. Check if user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        roleGrants: true,
        mfa: true,
      },
    });

    if (existingUser) {
      user = existingUser;
      // Link Google OAuth account to existing user
      await prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: "GOOGLE",
          providerAccountId: profile.id,
          email,
        },
      });

      // Ensure email verification timestamp is populated
      if (!user.emailVerifiedAt) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerifiedAt: new Date() },
        });
      }
    } else {
      // 3. Register new user with PASSENGER role and linked Google OAuth account
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          email,
          emailVerifiedAt: new Date(),
          status: "ACTIVE",
          roleGrants: {
            create: {
              role: "PASSENGER",
              reason: "Google Sign-in registration",
            },
          },
          oauthAccounts: {
            create: {
              provider: "GOOGLE",
              providerAccountId: profile.id,
              email,
            },
          },
        },
        include: {
          roleGrants: true,
          mfa: true,
        },
      });
    }
  }

  // Account status verification
  if (user.status === "SUSPENDED") {
    throw new AuthError(
      "ACCOUNT_SUSPENDED",
      user.suspensionReason || "Account suspended. Please contact customer support.",
      403
    );
  }
  if (user.status === "DELETED") {
    throw new AuthError("ACCOUNT_DELETED", "Account has been deleted.", 403);
  }

  // Audit logging
  await prisma.auditLog.create({
    data: {
      action: "LOGIN_SUCCESS",
      actorId: user.id,
      targetUserId: user.id,
      reason: "Google OAuth authentication",
      ipAddress,
    },
  }).catch(() => undefined);

  const roles = extractActiveRoles(user.roleGrants);
  const mfaRequired = Boolean(user.mfa && user.mfa.enabledAt);

  return {
    user,
    roles,
    mfaRequired,
    isNewUser,
  };
}

/**
 * In-memory store for short-lived one-time OAuth exchange codes
 */
interface OAuthCodeEntry {
  accessToken: string;
  expiresAt: number;
}

const oauthExchangeCodes = new Map<string, OAuthCodeEntry>();

/**
 * Store access token under a one-time code for frontend exchange (60s TTL)
 */
export function storeOAuthExchangeCode(accessToken: string, ttlSeconds = 60): string {
  const code = generateSecureToken(24);
  oauthExchangeCodes.set(code, {
    accessToken,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  setTimeout(() => {
    oauthExchangeCodes.delete(code);
  }, ttlSeconds * 1000).unref?.();

  return code;
}

/**
 * Consume a one-time OAuth exchange code
 */
export function consumeOAuthExchangeCode(code: string): string {
  if (!code || typeof code !== "string") {
    throw new AuthError("INVALID_OAUTH_CODE", "OAuth exchange code is required", 400);
  }

  const entry = oauthExchangeCodes.get(code);
  if (!entry) {
    throw new AuthError("INVALID_OAUTH_CODE", "Invalid or expired OAuth exchange code", 400);
  }

  // Enforce one-time use
  oauthExchangeCodes.delete(code);

  if (Date.now() > entry.expiresAt) {
    throw new AuthError("EXPIRED_OAUTH_CODE", "OAuth exchange code has expired", 400);
  }

  return entry.accessToken;
}
