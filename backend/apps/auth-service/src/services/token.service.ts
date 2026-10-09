import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { env } from "../config/env";
import { prisma } from "../prisma";
import { generateSecureToken, hashToken } from "../utils/crypto";
import type { User, UserRole } from "@prisma/client";

export interface TokenPayload {
  sub: string;
  email: string;
  roles: string[];
  sid: string;
  mfa: boolean;
}

export interface MfaChallengePayload {
  sub: string;
  email: string;
  purpose: "mfa_challenge" | "staff_mfa_setup" | "mfa_enrollment";
  roles: string[];
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Determine if the caller is a mobile client.
 * Mobile clients do not use cookies and require tokens in the response body.
 */
export function isMobileClient(req: Request, explicitType?: string): boolean {
  if (explicitType === "mobile" || req.body?.clientType === "mobile") {
    return true;
  }
  const header = req.header("x-client-type");
  if (header?.toLowerCase() === "mobile") {
    return true;
  }
  const userAgent = req.header("user-agent") || "";
  return /mobile|expo|okhttp|dart|react-native|alamofire|cfnetwork/i.test(userAgent);
}

/**
 * Generate Access Token (JWT)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`,
    issuer: "auth-service",
    audience: "habeshago-clients",
  });
}

/**
 * Generate Short-Lived MFA Challenge Token (5-minute expiry)
 */
export function generateMfaChallengeToken(
  user: User,
  roles: string[],
  purpose: "mfa_challenge" | "staff_mfa_setup" | "mfa_enrollment" = "mfa_challenge"
): string {
  const payload: MfaChallengePayload = {
    sub: user.id,
    email: user.email,
    purpose,
    roles,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: "5m",
    issuer: "auth-service",
    audience: "habeshago-clients",
  });
}

/**
 * Verify and decode an MFA Challenge Token
 */
export function verifyMfaChallengeToken(
  token: string,
  expectedPurpose?: "mfa_challenge" | "staff_mfa_setup" | "mfa_enrollment"
): MfaChallengePayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
      issuer: "auth-service",
      audience: "habeshago-clients",
    }) as MfaChallengePayload;

    if (expectedPurpose) {
      const matches =
        decoded.purpose === expectedPurpose ||
        (expectedPurpose === "mfa_enrollment" && decoded.purpose === "staff_mfa_setup") ||
        (expectedPurpose === "staff_mfa_setup" && decoded.purpose === "mfa_enrollment");
      if (!matches) {
        throw new AuthError(
          "INVALID_MFA_TOKEN",
          `Invalid MFA token purpose: expected ${expectedPurpose}`,
          401
        );
      }
    } else if (
      decoded.purpose !== "mfa_challenge" &&
      decoded.purpose !== "staff_mfa_setup" &&
      decoded.purpose !== "mfa_enrollment"
    ) {
      throw new AuthError("INVALID_MFA_TOKEN", "Invalid MFA token purpose", 401);
    }
    return decoded;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError("INVALID_MFA_TOKEN", "MFA verification token expired or invalid", 401);
  }
}

/**
 * Extract active roles for a user from UserRoleGrant relation
 */
/**
 * Resolve highest priority role when user has multiple roles granted
 */
export function resolvePrimaryRole(roles: string[]): string {
  const priority = [
    "ADMIN",
    "EV_CHARGER_MANAGER",
    "PARKING_MANAGER",
    "EMPLOYEE",
    "DRIVER",
    "PASSENGER",
  ];
  for (const p of priority) {
    if (roles.includes(p)) return p;
  }
  return roles[0] || "PASSENGER";
}

/**
 * Default web redirect target based on primary role
 */
export function getRoleRedirectUrl(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "EV_CHARGER_MANAGER":
      return "/ev-charge-manager";
    case "PARKING_MANAGER":
      return "/admin/manage-parking";
    case "EMPLOYEE":
      return "/admin";
    case "DRIVER":
      return "/admin";
    case "PASSENGER":
    default:
      return "/user";
  }
}

export function extractActiveRoles(roleGrants?: { role: UserRole; revokedAt: Date | null }[]): string[] {
  if (!roleGrants || roleGrants.length === 0) {
    return ["PASSENGER"];
  }
  const active = roleGrants
    .filter((g) => !g.revokedAt)
    .map((g) => g.role);

  return active.length > 0 ? active : ["PASSENGER"];
}

export interface IssueSessionOptions {
  user: User;
  roles: string[];
  req: Request;
  res: Response;
  mfaVerified?: boolean;
}

/**
 * Issue new session, tokens, set cookies if web, and return unified response
 */
export async function issueAuthSession({
  user,
  roles,
  req,
  res,
  mfaVerified = false,
}: IssueSessionOptions) {
  const isMobile = isMobileClient(req);
  const refreshTokenTtlMs = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  const rawRefreshToken = generateSecureToken(32);
  const tokenHash = hashToken(rawRefreshToken);

  // Create persistent session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.header("user-agent"),
      deviceName: req.header("x-device-name") || (isMobile ? "Mobile App" : "Web Client"),
      mfaVerifiedAt: mfaVerified ? new Date() : null,
      absoluteExpiresAt: new Date(Date.now() + refreshTokenTtlMs),
    },
  });

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      sessionId: session.id,
      tokenHash,
      expiresAt: new Date(Date.now() + refreshTokenTtlMs),
    },
  });

  // Update user last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate access token
  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
    roles,
    sid: session.id,
    mfa: mfaVerified,
  });

  // Set cookie for web (HttpOnly, Secure in prod, SameSite)
  if (!isMobile) {
    res.cookie("refreshToken", rawRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: refreshTokenTtlMs,
      path: "/",
    });
  }

  const primaryRole = resolvePrimaryRole(roles);
  const defaultRedirect = getRoleRedirectUrl(primaryRole);

  const userDto = {
    id: user.id,
    email: user.email,
    roles,
    role: primaryRole,
    primaryRole,
    defaultRedirect,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
  };

  return {
    success: true,
    message: "Authentication successful",
    accessToken,
    refreshToken: rawRefreshToken, // Always present in body so mobile has direct access
    tokenType: "Bearer",
    expiresIn: env.ACCESS_TOKEN_TTL_MINUTES * 60,
    userId: user.id,
    user: userDto,
    data: {
      accessToken,
      refreshToken: rawRefreshToken,
      userId: user.id,
      user: userDto,
    },
  };
}

/**
 * Rotate Refresh Token (Token Rotation pattern + Reuse Detection)
 */
export async function rotateRefreshToken(req: Request, res: Response) {
  const isMobile = isMobileClient(req);
  const rawToken = req.body?.refreshToken || req.cookies?.refreshToken;

  if (!rawToken || typeof rawToken !== "string") {
    throw new AuthError("REFRESH_TOKEN_REQUIRED", "Refresh token is required", 401);
  }

  const tokenHash = hashToken(rawToken);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: {
      session: {
        include: {
          user: {
            include: {
              roleGrants: true,
            },
          },
        },
      },
    },
  });

  if (!tokenRecord) {
    throw new AuthError("INVALID_REFRESH_TOKEN", "Invalid refresh token", 401);
  }

  // Token reuse detection:
  // If a previously used refresh token is presented, someone may have compromised it!
  if (tokenRecord.usedAt) {
    // Revoke the entire session immediately
    await prisma.session.update({
      where: { id: tokenRecord.sessionId },
      data: {
        revokedAt: new Date(),
        revokedReason: "REFRESH_REUSE_DETECTED",
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: "REFRESH_REUSE_DETECTED",
        actorId: tokenRecord.session.userId,
        targetUserId: tokenRecord.session.userId,
        reason: "Compromised or reused refresh token presented",
        ipAddress: req.ip,
        userAgent: req.header("user-agent"),
      },
    });

    res.clearCookie("refreshToken", { path: "/" });
    throw new AuthError("TOKEN_REUSE_DETECTED", "Refresh token reuse detected. Session terminated.", 401);
  }

  // Check expiration
  if (tokenRecord.expiresAt < new Date()) {
    throw new AuthError("EXPIRED_REFRESH_TOKEN", "Refresh token has expired", 401);
  }

  // Check if session is revoked
  if (tokenRecord.session.revokedAt) {
    throw new AuthError("SESSION_REVOKED", "Session has been revoked", 401);
  }

  // Check if user is active
  if (tokenRecord.session.user.status !== "ACTIVE") {
    throw new AuthError("USER_SUSPENDED", "User account is suspended or inactive", 403);
  }

  const refreshTokenTtlMs = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  const newRawRefreshToken = generateSecureToken(32);
  const newTokenHash = hashToken(newRawRefreshToken);

  // Create new refresh token record
  const newRecord = await prisma.refreshToken.create({
    data: {
      sessionId: tokenRecord.sessionId,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + refreshTokenTtlMs),
    },
  });

  // Mark old token as used and replaced
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: {
      usedAt: new Date(),
      replacedById: newRecord.id,
    },
  });

  // Update session activity
  await prisma.session.update({
    where: { id: tokenRecord.sessionId },
    data: { lastActiveAt: new Date() },
  });

  const roles = extractActiveRoles(tokenRecord.session.user.roleGrants);
  const accessToken = generateAccessToken({
    sub: tokenRecord.session.user.id,
    email: tokenRecord.session.user.email,
    roles,
    sid: tokenRecord.sessionId,
    mfa: Boolean(tokenRecord.session.mfaVerifiedAt),
  });

  // Update cookie if not mobile
  if (!isMobile || req.cookies?.refreshToken) {
    res.cookie("refreshToken", newRawRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: refreshTokenTtlMs,
      path: "/",
    });
  }

  return {
    success: true,
    message: "Token refreshed successfully",
    accessToken,
    refreshToken: newRawRefreshToken,
    tokenType: "Bearer",
    expiresIn: env.ACCESS_TOKEN_TTL_MINUTES * 60,
    data: {
      accessToken,
      refreshToken: newRawRefreshToken,
    },
  };
}

/**
 * Revoke Session & Logout (Current Session - Web & Mobile)
 */
export async function terminateSession(req: Request, res: Response) {
  const rawToken = req.body?.refreshToken || req.cookies?.refreshToken;
  const sessionId = (req as any).user?.sessionId;
  let userId = (req as any).user?.id;

  if (sessionId) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (session) {
      userId = userId || session.userId;
      await prisma.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: "USER_LOGOUT" },
      });
    }
  }

  if (rawToken && typeof rawToken === "string") {
    const tokenHash = hashToken(rawToken);
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { session: true },
    });
    if (tokenRecord?.session) {
      userId = userId || tokenRecord.session.userId;
      await prisma.session.updateMany({
        where: { id: tokenRecord.sessionId, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: "USER_LOGOUT" },
      });
    }
  }

  // Audit log
  if (userId) {
    await prisma.auditLog.create({
      data: {
        action: "LOGOUT",
        actorId: userId,
        targetUserId: userId,
        reason: "User logged out current session",
        ipAddress: req.ip,
        userAgent: req.header("user-agent"),
      },
    }).catch(() => undefined);
  }

  // Clear cookie for web clients
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return {
    success: true,
    message: "Logged out successfully",
  };
}

/**
 * Revoke All Sessions for Current User (Web & Mobile)
 */
export async function terminateAllSessions(req: Request, res: Response) {
  let userId = (req as any).user?.id;
  const rawToken = req.body?.refreshToken || req.cookies?.refreshToken;

  if (!userId && rawToken && typeof rawToken === "string") {
    const tokenHash = hashToken(rawToken);
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { session: true },
    });
    if (tokenRecord?.session) {
      userId = tokenRecord.session.userId;
    }
  }

  if (!userId) {
    throw new AuthError("UNAUTHORIZED", "Authentication required to revoke all sessions", 401);
  }

  // Revoke all active sessions for this user
  const result = await prisma.session.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
      revokedReason: "USER_LOGOUT_ALL",
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "SESSION_REVOKED",
      actorId: userId,
      targetUserId: userId,
      reason: "User revoked all active sessions",
      ipAddress: req.ip,
      userAgent: req.header("user-agent"),
    },
  }).catch(() => undefined);

  // Clear cookie for web clients
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return {
    success: true,
    message: "All sessions revoked successfully",
    revokedCount: result.count,
    data: {
      revokedCount: result.count,
    },
  };
}
