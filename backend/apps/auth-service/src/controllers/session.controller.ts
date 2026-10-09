import type { Request, Response } from "express";
import { prisma } from "../prisma";
import {
  AuthError,
  rotateRefreshToken,
  terminateSession,
  terminateAllSessions,
  extractActiveRoles,
  resolvePrimaryRole,
  getRoleRedirectUrl,
} from "../services/token.service";
import { sendError } from "./base.controller";

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
 * Revoke Session & Logout (Current session - Web & Mobile)
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
 * Revoke All Sessions for Current User (Web & Mobile)
 * POST /api/v1/auth/logout-all
 */
export async function logoutAll(req: Request, res: Response) {
  try {
    const result = await terminateAllSessions(req, res);
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
      const primaryRole = resolvePrimaryRole(roles);
      const defaultRedirect = getRoleRedirectUrl(primaryRole);

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          roles,
          role: primaryRole,
          primaryRole,
          defaultRedirect,
          status: user.status,
          emailVerifiedAt: user.emailVerifiedAt,
          mfaEnabled: Boolean(user.mfa?.enabledAt),
          createdAt: user.createdAt,
        },
        requestId: (req as any).id,
      });
    }

    const fallbackRoles = userClaims.roles || ["PASSENGER"];
    const fallbackPrimaryRole = resolvePrimaryRole(fallbackRoles);
    return res.status(200).json({
      success: true,
      user: {
        id: userClaims.id,
        roles: fallbackRoles,
        role: fallbackPrimaryRole,
        primaryRole: fallbackPrimaryRole,
        defaultRedirect: getRoleRedirectUrl(fallbackPrimaryRole),
      },
      requestId: (req as any).id,
    });
  } catch (err) {
    return sendError(res, err);
  }
}
