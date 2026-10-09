import type { Request, Response } from "express";
import {
  searchUsers,
  getUserDetail,
  suspendUser,
  reactivateUser,
  deleteUser,
  resetUserMfaByAdmin,
} from "../services/user-admin.service";
import { sendError } from "./base.controller";

/**
 * Search users by email prefix, status, role and created date, cursor paging, max 100
 * GET /api/v1/admin/users
 */
export async function adminSearchUsers(req: Request, res: Response) {
  try {
    const { email, status, role, createdFrom, createdTo, cursor, limit } = req.query as Record<string, string | undefined>;

    const result = await searchUsers({
      email,
      status,
      role,
      createdFrom,
      createdTo,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Account detail, MFA enabled and recovery codes left, linked providers, session count
 * GET /api/v1/admin/users/:userId
 * Audit: ADMIN_VIEWED_USER
 */
export async function adminGetUserDetail(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const adminId = (req as any).user?.id;

    const result = await getUserDetail(userId, adminId, req.ip);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * ACTIVE to SUSPENDED, sets suspendedAt, suspendedById, suspensionReason, revokes all sessions
 * POST /api/v1/admin/users/:userId/suspend
 * Audit: USER_SUSPENDED, Event: UserSuspended
 */
export async function adminSuspendUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const adminId = (req as any).user?.id;
    const { reason } = req.body || {};

    const result = await suspendUser(userId, adminId, reason, req.ip);

    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * SUSPENDED to ACTIVE, clears the suspension fields
 * POST /api/v1/admin/users/:userId/reactivate
 * Audit: USER_REACTIVATED, Event: UserReactivated
 */
export async function adminReactivateUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const adminId = (req as any).user?.id;
    const { reason } = req.body || {};

    const result = await reactivateUser(userId, adminId, reason, req.ip);

    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Sets DELETED and deletedAt, rewrites the email, removes OAuth links and MFA, revokes sessions
 * POST /api/v1/admin/users/:userId/delete
 * Audit: USER_DELETED, Event: UserDeleted
 */
export async function adminDeleteUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const adminId = (req as any).user?.id;
    const { reason } = req.body || {};

    const result = await deleteUser(userId, adminId, reason, req.ip);

    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}

/**
 * Removes the user_mfa row and revokes sessions, so staff must re-enroll at next login
 * POST /api/v1/admin/users/:userId/mfa/reset
 * Audit: MFA_RESET
 */
export async function adminResetUserMfa(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const adminId = (req as any).user?.id;
    const { reason } = req.body || {};

    const result = await resetUserMfaByAdmin(userId, adminId, reason, req.ip);

    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err);
  }
}
